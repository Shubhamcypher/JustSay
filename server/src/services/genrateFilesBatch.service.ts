import OpenAI from "openai";
import { getCache, setCache } from "../utils/cacheAiResponse";

//for OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


//for groq
// const openai = new OpenAI({
//     apiKey: process.env.GROQ_API_KEY,
//     baseURL: "https://api.groq.com/openai/v1",
// });

//for openRouter
// const openai = new OpenAI({
//     apiKey: process.env.OPENROUTER_API_KEY,
//     baseURL: "https://openrouter.ai/api/v1",
//     defaultHeaders: {
//         "HTTP-Referer": "http://localhost:3000",
//         "X-Title": "JustSay",
//     },
// });

function cleanJSON(text: string) {
    return text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
}



export async function generateFilesBatch(files: any, prompt: string) {
    const cacheKey = prompt + files.join(",");

    if (process.env.DEV_MODE === "true") {
        const cached = getCache("generator", cacheKey);
        if (cached) {
            console.log("⚡ Using cached generator");
            return cached;
        }
    }


    const res = await openai.chat.completions.create({
        model: "gpt-4o",  //open ai model for planner
        // model: "google/gemma-3-12b-it:free", // llama model works freely but too scratchy
        temperature: 0.2,
         max_tokens: 4096,
        messages: [
            {
                role: "system",
                content: `
You are a senior frontend engineer and UI/UX expert.

Your task is to generate a COMPLETE, production-quality React + TypeScript application.

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

Generate all required files listed below:

Files:
${files.join("\n")}

`
            },
            {
                role: "user",
                content: `
Prompt:
${prompt}

Files:
${files.join("\n")}

Return:
{
  "files": {
    "filePath": "content"
  }
}
`
            }
        ]
    });
    console.log("Received file in generate files batch:", res);
    const raw = res.choices[0].message.content || "";
    const cleaned = cleanJSON(raw);

    const json = JSON.parse(cleaned);
    try {
        if (!json.files || typeof json.files !== "object") {
            throw new Error("Invalid batch response");
        }

        setCache("generator", cacheKey, json);

        return json;
    }
    catch {
        console.warn("⚠️ JSON failed, retrying once...");
    }
}