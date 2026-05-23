import OpenAI from "openai";
import { getCachedPlan, setCachedPlan } from "../utils/cacheAiResponse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FileSkeleton {
  componentName: string;
  purpose: string;
  props: string[];
  sections: string[];
  imports: string[];
  mockData?: string[];
  exports: string[];
}

export type SkeletonMap = Record<string, FileSkeleton>;

export interface PlanAndSkeletonResult {
  files: string[];
  skeletons: SkeletonMap;
}

export async function planAndSkeleton(
  prompt: string,
  features: string[]
): Promise<PlanAndSkeletonResult> {
  const cached = await getCachedPlan(prompt);
  if (cached) {
    console.log("⚡ Cache hit: plan + skeletons");
    return cached;
  }

  console.log("🗺️ Planning + skeleting project...");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini", // was gpt-4o for skeletons — mini handles JSON structure fine
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are a senior React architect.

Your job is to plan ALL required files for a React + TypeScript app,
and design the structural blueprint for each one.

Return this exact JSON shape:

{
  "files": ["src/App.tsx", "src/pages/HomePage.tsx", ...],
  "skeletons": {
    "src/App.tsx": {
      "componentName": "App",
      "purpose": "Root component, sets up routing and global providers",
      "props": [],
      "sections": ["Header", "main content via AppRoutes", "Footer"],
      "imports": ["src/components/Header.tsx", "src/components/Footer.tsx", "src/routes/AppRoutes.tsx"],
      "mockData": [],
      "exports": ["default"]
    }
  }
}

========================
FILE PLANNING RULES
========================

- 12–18 files minimum for any non-trivial app
- Always include:
    src/App.tsx
    src/routes/AppRoutes.tsx
    3+ pages under src/pages/
    4+ components under src/components/
    1+ context under src/context/
    1+ custom hook under src/hooks/
    src/utils/constants.ts
- Never include: binary files, tailwind.config.js, postcss.config.js,
  package.json, index.html, src/main.tsx (already provided by template)
- Only packages allowed: react | react-dom | react-router-dom

========================
SKELETON RULES
========================

Every file in "files" MUST have a matching skeleton entry.

componentName   — exported component or function name
purpose         — one sentence
props           — realistic TypeScript prop names; typed arrays e.g. "items: Product[]"
sections        — specific visual/logical sections, NOT generic "header, body, footer"
imports         — only other files from the "files" list
mockData        — module-level mock arrays this file will define (pages/data files only)
exports         — ALL named exports; hooks always ["default"]

========================
LAYOUT CONTRACT
========================

App.tsx:
- If Header.tsx is planned → imports MUST include it, sections MUST include "Header"
- If Footer.tsx is planned → imports MUST include it, sections MUST include "Footer"
- NEVER wrap with BrowserRouter — main.tsx already has HashRouter
- Route component named "AppRoutes" — never "Routes"

Pages (HomePage, etc.):
- Must NOT import or render Header or Footer — those are global in App.tsx

Hooks:
- Always "export default hookName" — exports: ["default"]
- Never named exports from hook files

========================
CONSTANTS CONTRACT
========================

src/utils/constants.ts exports MUST include everything other files need:

- MOCK_[ENTITY] arrays for every data type the app uses (4–6 items, fully typed)
- NAV_LINKS if a Header/Navbar exists
- CATEGORIES / GENRES / TAGS if browsing or filtering exists
- Never include API_ENDPOINTS — this app has no backend

Examples by app type:
  ecommerce     → MOCK_PRODUCTS, MOCK_CATEGORIES, NAV_LINKS, MOCK_ORDERS
  video stream  → MOCK_VIDEOS, MOCK_CHANNELS, VIDEO_CATEGORIES, NAV_LINKS, TRENDING_VIDEOS
  job board     → MOCK_JOBS, MOCK_COMPANIES, JOB_CATEGORIES, NAV_LINKS
  social        → MOCK_POSTS, MOCK_USERS, NAV_LINKS

All files that import from constants MUST use names listed in constants exports — never import
a name not in that list.

========================
DATA RULES
========================

- All data is hardcoded mock — NO fetch(), NO /api/ URLs
- Mock arrays defined at MODULE LEVEL (outside components)
- At least 4–6 items per list, domain-specific, fully typed
- Pages import mock data from constants — don't redefine locally

========================
QUALITY BAR
========================

Plan for a fully interactive multi-page app:
- Global state via context
- Loading + empty + error states
- At least 3 interactive features
- Reusable components (Button, Card, Modal, etc.)

Return only valid JSON. No markdown. No explanation.
`,
          },
          {
            role: "user",
            content: `
App idea: ${prompt}

Required features:
${features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Plan all required files and return the full skeleton map.
Err on the side of MORE files and MORE exports from constants — 
it is better to export something unused than to miss something needed.
`,
          },
        ],
      });

      const raw = res.choices[0].message.content || "";
      console.log("🗺️ Plan + skeleton raw length:", raw.length);

      const json = JSON.parse(raw);

      if (!Array.isArray(json.files) || !json.files.length) {
        throw new Error("Missing or empty files array");
      }
      if (!json.skeletons || typeof json.skeletons !== "object") {
        throw new Error("Missing skeletons object");
      }

      // Ensure every planned file has a skeleton — fill gaps with a safe default
      for (const file of json.files) {
        if (!json.skeletons[file]) {
          console.warn(`⚠️ No skeleton for ${file} — inserting default`);
          json.skeletons[file] = {
            componentName: file.split("/").pop()?.replace(/\.(tsx|ts)$/, "") ?? "Component",
            purpose: "Auto-planned component",
            props: [],
            sections: ["Main content"],
            imports: [],
            mockData: [],
            exports: ["default"],
          };
        }
      }

      console.log(
        `✅ Plan + skeleton done: ${json.files.length} files, ${Object.keys(json.skeletons).length} skeletons`
      );

      await setCachedPlan(prompt, json);
      return json as PlanAndSkeletonResult;

    } catch (err) {
      console.warn(`⚠️ planAndSkeleton attempt ${attempt + 1} failed:`, err);
    }
  }

  throw new Error("planAndSkeleton failed after 3 attempts");
}