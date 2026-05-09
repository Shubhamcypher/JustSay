import OpenAI from "openai";
import { getCachedSkeletons, setCachedSkeletons } from "../utils/cacheAiResponse";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanJSON(text: string) {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

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

export async function generateSkeletons(
    files: string[],
    prompt: string,
    features: string[]
): Promise<SkeletonMap> {
    const cached = getCachedSkeletons(prompt);
    if (cached) { console.log("⚡ Cache hit: skeletons"); return cached; }

    console.log("🦴 Generating skeletons for", files.length, "files");

    const res = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.1,
        max_tokens: 8000,
        messages: [
            {
                role: "system",
                content: `
You are a senior React architect.

Your job is to design the STRUCTURE of a React + TypeScript app — not the full code.

For each file, return a skeleton describing:
- componentName: the exported component or function name
- purpose: one sentence of what it does
- props: list of TypeScript prop names it will accept
- sections: list of visual/logical sections it will contain (e.g. "hero banner", "stats row", "feature cards")
- imports: list of other files in this project it will import from

Return ONLY valid JSON, no markdown, no backticks:

{
  "skeletons": {
    "src/App.tsx": {
      "componentName": "App",
      "purpose": "Root component, sets up routing and global providers",
      "props": [],
      "sections": ["Router setup", "AppRoutes", "Global layout"],
      "imports": ["src/routes/AppRoutes.tsx", "src/context/AppContext.tsx"],
      "mockData": [],
      "exports": ["default"]
    },
    "src/pages/HomePage.tsx": {
      "componentName": "HomePage",
      "purpose": "Landing page showing product grid and hero section",
      "props": [],
      "sections": ["Hero banner with CTA", "Category filter bar", "Product card grid", "Loading skeleton", "Empty state"],
      "imports": ["src/components/ProductCard.tsx", "src/context/CartContext.tsx"],
      "mockData": ["MOCK_PRODUCTS: { id: string; name: string; price: number; image: string }[]", "MOCK_CATEGORIES: string[]"],
      "exports": ["default"]
    },
    "src/context/CartContext.tsx": {
      "componentName": "CartProvider",
      "purpose": "Global cart state with context, reducer and custom hook",
      "props": ["children: ReactNode"],
      "sections": ["CartContext creation", "cartReducer", "CartProvider component", "useCart hook"],
      "imports": [],
      "mockData": [],
      "exports": ["CartContext", "CartProvider", "useCart"]
    }
  }
}

Rules:
- Every file in the input list MUST have a skeleton entry
- Sections should be specific to the app — not generic like "header, body, footer"
- Imports must only reference other files in the input list
- Props must be realistic for the component's purpose
- Design the components to work TOGETHER as a coherent app
- mockData: if this file is a page or renders a list, list the mock data arrays it should define
  e.g. ["MOCK_PRODUCTS: Product[]", "MOCK_CATEGORIES: string[]"]
  Mock data MUST be defined at module level, not inside components
  
- exports: list ALL named exports this file provides
  e.g. ["ProductCard", "ProductList"] for components
  e.g. ["CartContext", "CartProvider", "useCart"] for context files
  e.g. ["CATEGORIES", "API_BASE_URL"] for utils/constants files
  Hooks files: always ["default"] since hooks use default export

Also add to skeleton rules:
- Props that are arrays must be typed as: propName: ItemType[] — never just any[]
- Props that are numbers must include: propName: number — never optional unless truly optional
- If a component receives a product/item prop, its shape must be fully specified in props list
  e.g. ["product: { id: string; name: string; price: number; image: string }"]

- For src/utils/constants.ts specifically:
  - Its exports list MUST include every named export that ANY other file imports from it
  - Scan ALL other files imports sections and collect everything they need from constants
  - ALWAYS include mock data arrays named MOCK_[ENTITY] matching the app domain
    e.g. for ecommerce: ["MOCK_PRODUCTS", "MOCK_CATEGORIES"]
    e.g. for job board: ["MOCK_JOBS", "MOCK_COMPANIES", "JOB_CATEGORIES"]
    e.g. for streaming: ["MOCK_VIDEOS", "MOCK_CHANNELS", "VIDEO_CATEGORIES"]
  - Mock data shape MUST exactly match the props expected by components that use them
  - NEVER include API_ENDPOINTS — this app has no backend
  - Every MOCK_ array must have at least 4-6 realistic items fully typed

- For ALL files that import from constants:
  - Their imports list MUST use the exact same names listed in constants.ts exports
  - NEVER import a name that is not in constants.ts exports list
  - If a page needs mock data, import it from constants — do not redefine it locally

- App.tsx skeleton MUST follow these rules:
  - If Header.tsx is in the file list → imports MUST include "src/components/Header.tsx"
  - If Footer.tsx is in the file list → imports MUST include "src/components/Footer.tsx"
  - sections MUST include: "Header", "main content via AppRoutes", "Footer"
  - NEVER list sections as just ["Router setup", "AppRoutes"] — that is INVALID
  - exports: ["default"]

- Pages (HomePage, MovieDetailsPage, etc.) must NOT include Header or Footer in their imports
  - Header and Footer are global — rendered once in App.tsx only
  - Pages only render their own content
`
            },
            {
                role: "user",
                content: `
App idea: ${prompt}

Required features:
${features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Files to skeleton:
${files.join("\n")}

IMPORTANT — For src/utils/constants.ts:
Carefully look at EVERY other file in the list above.
Think about what data each file will need from constants.
The constants.ts exports list must include ALL of the following that are relevant:

- MOCK_[ENTITY] arrays for every data type the app uses
  e.g. MOCK_VIDEOS, MOCK_CHANNELS, MOCK_CATEGORIES, TRENDING_VIDEOS,
       RECOMMENDED_VIDEOS, RELATED_VIDEOS, CHANNEL_VIDEOS, MOCK_USERS,
       MOCK_PRODUCTS, MOCK_JOBS, MOCK_ORDERS — whatever fits this app
- Navigation arrays: NAV_LINKS, SIDEBAR_LINKS if Header/Sidebar exists
- Filter/category arrays: CATEGORIES, GENRES, TAGS if browsing/filtering exists
- Any shared config the app needs

For a video streaming app, constants.ts MUST export at minimum:
MOCK_VIDEOS, NAV_LINKS, MOCK_CATEGORIES, TRENDING_VIDEOS, RECOMMENDED_VIDEOS, RELATED_VIDEOS

For an ecommerce app, constants.ts MUST export at minimum:
MOCK_PRODUCTS, MOCK_CATEGORIES, NAV_LINKS, MOCK_ORDERS

For a job board app, constants.ts MUST export at minimum:
MOCK_JOBS, MOCK_COMPANIES, JOB_CATEGORIES, NAV_LINKS

Always err on the side of MORE exports from constants — it is better to export
something unused than to miss something needed.

Return the skeleton map for all files above.
`
            }
        ]
    });

    const raw = res.choices[0].message.content || "";
    const cleaned = cleanJSON(raw);
    const json = JSON.parse(cleaned);

    if (!json.skeletons || typeof json.skeletons !== "object") {
        throw new Error("Invalid skeleton response from LLM");
    }

    console.log("🦴 Skeletons generated:", Object.keys(json.skeletons).length, "files");
    setCachedSkeletons(prompt, json.skeletons);
    return json.skeletons as SkeletonMap;
}