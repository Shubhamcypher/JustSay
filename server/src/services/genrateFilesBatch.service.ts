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

* Use ONLY Tailwind-style utility classes in JSX

* DO NOT create or use:

  * tailwind.config.js
  * postcss.config.js
  * @tailwind directives
  * any Tailwind dependency
  * any CSS framework setup

* DO NOT include:

  * <link rel="stylesheet">
  * CDN scripts

IMPORTANT:

* Styling is already handled by the platform
* Just use Tailwind-style utility classes in className

Example:

<div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-xl">

* Avoid creating CSS files unless absolutely necessary
* Prefer utility classes over custom CSS

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
=========

* Split UI into reusable components

* Keep code modular and clean

* Use functional components

* Use React hooks where needed

* Ensure file structure is logical:

* Ensure arrow function is like : () => {}, not like () = {}

  * components/
  * hooks/
  * utils/
  * types/

========================
FUNCTIONALITY
=============

* Include interactive UI elements
* Buttons must perform actions (state updates, UI changes, etc.)
* Use useState / useEffect where needed
* Avoid static-only UI

========================
FINAL OUTPUT RULES
==================

* The app must be complete and usable
* No broken imports
* No missing files
* No invalid code
* No placeholder-only UI

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