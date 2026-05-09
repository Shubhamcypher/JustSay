import OpenAI from "openai";
import { SkeletonMap } from "./generateSkeletons.service";
import {
  REFERENCE_NAVBAR,
  REFERENCE_HERO,
  REFERENCE_CARD_GRID,
} from "../utils/referenceComponents";

//for OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


function cleanJSON(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

// New helper — formats the skeleton map into a readable context block
function formatSkeletonContext(
  currentFiles: string[],
  allSkeletons: SkeletonMap
): string {
  const lines: string[] = [];

  // Full skeleton of every file in the project (for awareness)
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



export async function generateFilesBatch(files: any, prompt: string, skeletons: SkeletonMap = {}, features: string[] = []) {


  const skeletonContext = Object.keys(skeletons).length > 0
    ? formatSkeletonContext(files, skeletons)
    : "No skeleton context available.";

  const res = await openai.chat.completions.create({
    model: "gpt-4o",  //open ai model for planner
    // model: "google/gemma-3-12b-it:free", // llama model works freely but too scratchy
    temperature: 0.2,
    max_tokens: 16000,
    messages: [
      {
        role: "system",
        content: `
You are a senior frontend engineer and UI/UX expert.

Your task is to generate a COMPLETE, production-quality React + TypeScript application.


========================
REFERENCE EXAMPLES (QUALITY ANCHOR)
========================

The components below represent the MINIMUM quality bar. Every file you generate
must match or exceed this level of polish — in layout, spacing, interactivity,
and visual design.

// --- REFERENCE: Navbar ---
${REFERENCE_NAVBAR}

// --- REFERENCE: Hero section ---
${REFERENCE_HERO}

// --- REFERENCE: Card grid ---
${REFERENCE_CARD_GRID}

Study the patterns above:
- Dark theme with gray-950 / gray-800 surfaces
- Indigo accent color (indigo-600 buttons, indigo-400 text accents)
- rounded-xl / rounded-2xl corners, not rounded-md
- Hover transitions on every interactive element
- Real props — no hardcoded placeholder text
- Responsive: mobile-first with md: / lg: breakpoints


========================
PROJECT STRUCTURE CONTEXT
========================

${skeletonContext}

Use the skeleton above as your blueprint:
- Implement EXACTLY the sections listed for each file
- Use EXACTLY the props listed
- Wire up EXACTLY the imports listed
- Every component must fit into the larger app coherently

STRICT RULES:

* Return ONLY valid JSON
* No markdown
* No backticks
* No explanations
* Output format must strictly follow:

{
"files": {
"filePath": "content"
}
}

========================
CORE REQUIREMENTS
=================

* The app MUST be fully functional and visually polished
* No empty UI or placeholder layouts
* All components must render meaningful content
* Ensure imports and exports are correct
* Code must run without errors in a Vite + React environment

========================
UI / UX REQUIREMENTS
====================

* Build a modern SaaS-style UI
* Use proper layout hierarchy and spacing
* Use flexbox and grid layouts effectively

MANDATORY COMPLEXITY RULES:

- MUST include routing (multiple pages)
- MUST include global state (context or hook)
- MUST include loading + empty + error states
- MUST include at least 3 interactive features
- MUST include reusable components (Button, Card, Modal, etc.)
- MUST avoid single-file apps

Design must include:

* Navbar / Header
* Hero or main section
* Content sections (cards, lists, panels)
* Buttons with clear actions

Use these styling patterns:

* rounded-xl
* shadow-md
* spacing (p-4, p-6, gap-4, etc.)
* hover effects
* transitions

Buttons must look premium:
className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"

Use container layout:
className="max-w-6xl mx-auto px-4"

========================
STYLING RULES (CRITICAL)
========================

* Tailwind CSS is already fully configured in the project

* DO NOT:
  - create tailwind.config.js
  - create postcss.config.js
  - modify package.json dependencies
  - add Tailwind CDN
  - use <link rel="stylesheet">

* DO NOT include @tailwind directives in any file

* ONLY use Tailwind utility classes inside JSX

Example:
<div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-xl">

========================
IMAGES (VERY IMPORTANT)
=======================

* ALWAYS use direct image URLs from:
  https://images.unsplash.com/

* DO NOT use:

  * source.unsplash.com
  * picsum.photos
  * placeholder services

* Images must:

  * load directly (HTTP 200)
  * be relevant to the app context
  * be visually appropriate

Example:
https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400

========================
STRUCTURE
========================

* Split UI into reusable components

* Keep code modular and clean

* Use functional components

* Use React hooks where needed

* Ensure file structure is logical:

STRICT SYNTAX RULES (MUST FOLLOW):

- NEVER write: () = {}
- ALWAYS write: () => {}

- NEVER assign className inside functions or event handlers
  ❌ WRONG: onClick={() => { className = "..." }}
  ✅ CORRECT: use state or conditional rendering

- ALL event handlers must be valid arrow functions:
  onClick={() => handleClick()}

- INVALID JS/TS CODE IS STRICTLY FORBIDDEN

  * components/
  * hooks/
  * utils/
  * types/
  * 

If any invalid JavaScript is generated, the output is considered FAILED.

INVALID PATTERNS (STRICTLY FORBIDDEN):
- () = {}
- className assignment inside functions
- invalid onClick handlers

You MUST self-correct BEFORE returning output.


REACT ROUTER RULES (CRITICAL):
- Use react-router-dom v6 ONLY
- Use <Routes> and <Route element={<X />}>
- NEVER use <Switch> or component={X}
- NEVER wrap App.tsx with BrowserRouter — main.tsx already provides HashRouter
- Name route components "AppRoutes" never "Routes"

HOOK RULES (CRITICAL):
- export default hookName — never named exports
- import hookName from '../hooks/hookName' — never { hookName }

========================
FUNCTIONALITY
========================

* Include interactive UI elements
* Buttons must perform actions (state updates, UI changes, etc.)
* Use useState / useEffect where needed
* Avoid static-only UI


========================
DEFENSIVE CODING (CRITICAL — READ CAREFULLY)
========================

ALL components that receive props or render data MUST follow these rules:

1. NEVER call methods on potentially undefined values
   ❌ product.price.toFixed(2)
   ✅ (product?.price ?? 0).toFixed(2)

   ❌ items.map(...)
   ✅ (items ?? []).map(...)

   ❌ user.name.toUpperCase()
   ✅ user?.name?.toUpperCase() ?? ""

2. EVERY array prop must have a fallback before .map()
   ❌ {products.map(p => <Card key={p.id} />)}
   ✅ {(products ?? []).map(p => <Card key={p.id} />)}

3. EVERY numeric value displayed must have a fallback
   ❌ \${product.price}
   ✅ \${product?.price ?? 0}
   ❌ {count} items
   ✅ {count ?? 0} items

4. EVERY image src must have a fallback
   ❌ <img src={item.image} />
   ✅ <img src={item?.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400"} />



5. EVERY object prop access must use optional chaining
   ❌ <p>{user.address.city}</p>
   ✅ <p>{user?.address?.city ?? "Unknown"}</p>

6. Components with loading states MUST guard against undefined data
   ✅ if (loading) return <LoadingSkeleton />
   ✅ if (!data || data.length === 0) return <EmptyState />
   ✅ if (error) return <ErrorState message={error} />
   // THEN render with data — never render data before these checks

7. Mock data arrays MUST be defined OUTSIDE the component
   ❌ const MyComp = () => { const items = [...] }
   ✅ const MOCK_ITEMS = [...];
      const MyComp = () => { ... }

Any component that violates these rules = INVALID OUTPUT.
Self-check every component before returning.

========================
FINAL OUTPUT RULES
========================

* The app must be complete and usable
* No broken imports
* No missing files
* No invalid code
* No placeholder-only UI


INFRASTRUCTURE NOTE:

- Core project files (package.json, index.html, main.tsx, Tailwind setup) are already provided by the system
- You should focus ONLY on application logic and UI components
- Do NOT override core infrastructure files unless necessary


========================
LAYOUT RULES (CRITICAL)
========================

If Header.tsx exists in the project file list:
- App.tsx MUST import Header and render it ABOVE AppRoutes
- NEVER skip Header — every page must have navigation visible

If Footer.tsx exists in the project file list:
- App.tsx MUST import Footer and render it BELOW AppRoutes
- NEVER skip Footer

Correct App.tsx structure when Header and Footer exist:

import Header from './components/Header';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <ProviderWrapper>
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  </ProviderWrapper>
);

Pages (HomePage, MovieDetailsPage etc.) must NOT include their own Header or Footer.
Header and Footer are global — rendered once in App.tsx only.
Violation of this rule = INVALID OUTPUT.

========================
IMPORT DISCIPLINE (CRITICAL)
========================

You may ONLY import from:
1. Files listed in FILES TO GENERATE NOW
2. Files listed in FULL PROJECT STRUCTURE context
3. react, react-dom, react-router-dom packages

NEVER import from a file not in the project structure.
NEVER import Hero, Modal, Button, or any component unless it exists in the file list.
If you want a Hero section — build it inline in the page component.

For constants.ts specifically — when generating this file:
- Export EVERY named constant that ANY other file in the project will need
- Look at the "Must export" field in the skeleton context above — export ALL of them
- Each MOCK_ array must have 4-6 fully typed realistic items
- Each item must have ALL fields that components using it will access
  e.g. for videos: { id, title, thumbnail, views, duration, channelName, channelAvatar }
  e.g. for products: { id, name, price, image, description, rating, category }
  e.g. for jobs: { id, title, company, location, salary, type, description, postedAt }
- NAV_LINKS must match the actual routes defined in AppRoutes.tsx
- NEVER export API_ENDPOINTS
- It is better to export MORE than needed than to miss something

For constants imports in other files:
- ONLY import names listed in constants.ts "Must export" field
- If a name is not listed — define it inline in that file instead

Self-check before returning:
- For every import statement, verify the imported file/export exists in project structure
- For every constants import, verify the name is in constants.ts exports list


========================
ALLOWED PACKAGES (STRICT)
========================

You may ONLY import from these packages:
- react
- react-dom  
- react-router-dom

DO NOT import from ANY other npm package.
DO NOT use axios — use fetch() instead.
DO NOT use lodash, zustand, redux, or any utility library.

If you need HTTP: use fetch().
If you need state: use useState / useContext / useReducer.
If you need routing: use react-router-dom v6 only.

Any import from an unlisted package = INVALID OUTPUT.

========================
DATA STRATEGY (CRITICAL)
========================

This app runs in a sandboxed WebContainer with NO backend.

NEVER use fetch() or any API calls to get data.
NEVER use useEffect to fetch from an endpoint.
NEVER use /api/... URLs.

ALWAYS use hardcoded mock data defined at module level:

✅ CORRECT:
const MOCK_PRODUCTS = [
  { id: "1", name: "Product One", price: 29.99, image: "https://images.unsplash.com/..." },
  { id: "2", name: "Product Two", price: 49.99, image: "https://images.unsplash.com/..." },
];

const ProductList = () => {
  const [items] = useState(MOCK_PRODUCTS);
  ...
};

❌ WRONG:
useEffect(() => {
  fetch('/api/products').then(r => r.json()).then(setProducts);
}, []);

Mock data must be:
- Defined at module level (outside components)
- Realistic and specific to the app domain
- At least 4-6 items per list
- Fully typed with all required fields populated


========================
QUALITY ENFORCEMENT
========================

Before returning output, self-check every generated component against the reference examples above:

- Does every page have a real Navbar with navigation links?
- Does the landing/home page have a Hero section with a headline, subtext, and CTA button?
- Are cards using rounded-2xl, hover:border transitions, and icon slots?
- Are all buttons using the indigo-600 + hover:indigo-500 + transition pattern?
- Is the color palette consistent: gray-950 bg, gray-800 surfaces, white text, gray-400 muted text?
- Are there loading states, empty states, and error states on any data-fetching components?

If ANY component is below reference quality → rewrite it before outputting.

Generate all required files listed below:

Files:
${files.join("\n")}
`
      },
      {
        role: "user",
        content: `
========================
REQUIRED FEATURES — IMPLEMENT ALL OF THESE
========================

Every feature below MUST be visibly present in the UI.
Do not skip, summarize, or combine them.
If a feature requires a new component or page — create it.

${features.map((f: string, i: number) => `${i + 1}. ${f}`).join("\n")}

========================
USER'S GOAL
========================

${prompt}

========================
FILES TO GENERATE NOW
========================

${files.join("\n")}

Return ONLY this JSON shape, nothing else:
{
  "files": {
    "filePath": "full file content"
  }
}
`
      }
    ]
  });

  console.log("Received files in generateFilesBatch:", files);
  const raw = res.choices[0].message.content || "";
  const cleaned = cleanJSON(raw);
  const json = JSON.parse(cleaned);

  try {
    if (!json.files || typeof json.files !== "object") {
      throw new Error("Invalid batch response");
    }
    return json;
  } catch {
    console.warn("⚠️ JSON parse failed in generateFilesBatch");
  }
}