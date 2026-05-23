import OpenAI from "openai";
import { SkeletonMap } from "./generateSkeletons.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanJSON(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function formatSkeletonContext(
  currentFiles: string[],
  allSkeletons: SkeletonMap
): string {
  const lines: string[] = [];

  lines.push("=== FULL PROJECT STRUCTURE (all files) ===");
  for (const [path, skeleton] of Object.entries(allSkeletons)) {
    lines.push(`${path} → ${skeleton.componentName}: ${skeleton.purpose}`);
  }

  lines.push("\n=== DETAILED SKELETONS FOR FILES YOU ARE GENERATING NOW ===");
  for (const filePath of currentFiles) {
    const s = allSkeletons[filePath];
    if (!s) continue;
    lines.push(`
File: ${filePath}
Component: ${s.componentName}
Purpose: ${s.purpose}
Props: ${s.props.length ? s.props.join(", ") : "none"}
Sections to build: ${s.sections.join(" | ")}
Imports from project: ${s.imports.length ? s.imports.join(", ") : "none"}
Must export: ${s.exports?.length ? s.exports.join(", ") : "default only"}
Mock data to define: ${s.mockData?.length ? s.mockData.join(", ") : "none"}
    `);
  }

  return lines.join("\n");
}

// ─── Built once at module load, reused across all chunk calls ───────────────
const BASE_SYSTEM_PROMPT = `
You are a senior frontend engineer.

Generate a production-quality React + TypeScript + Tailwind application.

========================
QUALITY BAR
========================

Dark theme: gray-950 bg, gray-900 sections, gray-800/60 cards.
Text: white headings, gray-400 body, gray-500 captions.
Accent: indigo-600 buttons (hover:indigo-500), indigo-400 highlights.
Corners: rounded-xl / rounded-2xl — never rounded-md.
Spacing: py-16 sections, max-w-6xl mx-auto px-4 containers, gap-4/gap-6 grids.
Interactive: hover + transition on every clickable element.
Responsive: mobile-first, md: 2-col, lg: 3-col.

Every page MUST have:
- A real Navbar with navigation links
- A Hero section (headline + subtext + CTA button) on landing pages
- Cards using rounded-2xl, hover:border-indigo-500/50, hover:bg-gray-800 transition-all
- Buttons: px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition

========================
OUTPUT FORMAT (STRICT)
========================

Return ONLY valid JSON — no markdown, no backticks, no explanation:
{
  "files": {
    "filePath": "full file content as a string"
  }
}

========================
CORE RULES
========================

PACKAGES — only import from:
  react | react-dom | react-router-dom
  Never: axios, lodash, zustand, redux, @tanstack/*, etc.
  HTTP: use fetch() only. State: useState / useContext / useReducer only.

ROUTING:
  react-router-dom v6 only.
  Use <Routes> and <Route element={<X />}> — never <Switch> or component={X}.
  Never wrap App.tsx with BrowserRouter — main.tsx already has HashRouter.
  Name route component "AppRoutes" never "Routes".

HOOKS:
  export default hookName — never named exports.
  import hookName from '../hooks/hookName' — never { hookName }.

DATA:
  No fetch() calls, no /api/ URLs, no useEffect fetching.
  All data = hardcoded mock arrays defined at MODULE LEVEL (outside components).
  At least 4–6 items per list, fully typed, domain-specific.

LAYOUT:
  If Header.tsx is in the project → App.tsx MUST render <Header /> above <AppRoutes />.
  If Footer.tsx is in the project → App.tsx MUST render <Footer /> below <AppRoutes />.
  Pages must NOT include their own Header or Footer.

IMPORTS:
  Only import from files listed in the project structure context.
  Never import a component that isn't in the file list.
  If you need a section — build it inline.

STYLING:
  Tailwind is pre-configured. Do NOT create tailwind.config.js or postcss.config.js.
  Do NOT add @tailwind directives. Do NOT use CDN. Do NOT use <link rel="stylesheet">.
  Only utility classes inside JSX.

IMAGES:
  Always: https://images.unsplash.com/photo-XXXX?w=400 (direct, HTTP 200).
  Never: source.unsplash.com, picsum.photos, or placeholder services.

SYNTAX (CRITICAL):
  Always () => {} — never () = {}.
  Never assign className inside event handlers.
  All event handlers must be valid arrow functions: onClick={() => handleClick()}.
  Invalid JS/TS = FAILED output. Self-correct before returning.

DEFENSIVE CODING:
  (items ?? []).map(...)             — every array before .map()
  (value?.price ?? 0).toFixed(2)     — every .toFixed()
  user?.name?.toUpperCase() ?? ""    — every chained access
  <img src={item?.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400"} />

COMPLEXITY (MANDATORY):
  - Multi-page routing
  - Global state via context or hook
  - Loading + empty + error states
  - At least 3 interactive features
  - Reusable components (Button, Card, Modal, etc.)
  - No single-file apps

INFRASTRUCTURE NOTE:
  package.json, index.html, src/main.tsx, Tailwind setup are already provided.
  Do NOT regenerate them. Focus on app logic and UI only.
`;

// ─── Per-call: inject skeleton context, then generate ───────────────────────
function buildSystemPrompt(skeletonContext: string): string {
  return `${BASE_SYSTEM_PROMPT}
========================
PROJECT STRUCTURE CONTEXT
========================

${skeletonContext}

Use the skeleton as your blueprint:
- Implement EXACTLY the sections listed for each file
- Use EXACTLY the props listed
- Wire up EXACTLY the imports listed
- Every component must fit into the larger app coherently
`;
}

export async function generateFilesBatch(
  files: any,
  prompt: string,
  skeletons: SkeletonMap = {},
  features: string[] = []
) {
  const skeletonContext = Object.keys(skeletons).length > 0
    ? formatSkeletonContext(files, skeletons)
    : "No skeleton context available.";

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    max_tokens: 16000,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(skeletonContext),
      },
      {
        role: "user",
        content: `
========================
REQUIRED FEATURES — IMPLEMENT ALL OF THESE
========================

${features.map((f: string, i: number) => `${i + 1}. ${f}`).join("\n")}

========================
USER'S GOAL
========================

${prompt}

========================
FILES TO GENERATE NOW
========================

${Array.isArray(files) ? files.join("\n") : files}

Return ONLY this JSON shape, nothing else:
{
  "files": {
    "filePath": "full file content"
  }
}
`,
      },
    ],
  });

  console.log("Received files in generateFilesBatch:", files);

  const raw = res.choices[0].message.content || "";
  const cleaned = cleanJSON(raw);

  try {
    const json = JSON.parse(cleaned);
    if (!json.files || typeof json.files !== "object") {
      throw new Error("Invalid batch response");
    }
    return json;
  } catch {
    console.warn("⚠️ JSON parse failed in generateFilesBatch");
  }
}