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
You are a senior frontend engineer + UI/UX expert.

Generate a COMPLETE modern production-level React + TypeScript app.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No backticks
- No explanation

FORMAT:
{
  "files": {
    "filePath": "content"
  }
}

========================
UI/UX REQUIREMENTS
========================

- Use modern layouts (flex/grid)
- Use TailwindCSS ONLY (no plain CSS files unless necessary)
- Design must look like a real SaaS / startup UI
- Add spacing, hierarchy, and visual balance

- Components must look like:
  - cards
  - sections
  - hero banners
  - navbars

- Use:
  - rounded-xl
  - shadow-md
  - hover effects
  - transitions

- Buttons MUST look premium:
  px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500

- Use max-width layouts:
  max-w-6xl mx-auto


========================
UI & STYLING RULES (VERY IMPORTANT):
========================

- ALWAYS use Tailwind CSS for styling
- NEVER rely on plain CSS files unless necessary
- Prefer utility classes over custom CSS

TAILWIND SETUP:

You MUST ensure the project is fully configured for Tailwind:

- Include:
  - tailwind.config.js
  - postcss.config.js

- index.html MUST NOT include any manual CSS links
- All styles must be imported via:
  import './styles/global.css';

- global.css MUST contain:
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

FAIL CONDITIONS (DO NOT DO THIS):
- Missing Tailwind config files
- Using CSS without Tailwind
- Using <link rel="stylesheet"> for styles

The app must render correctly with Tailwind styles applied.


TAILWIND RULES:
- Do NOT use @tailwindcss/vite or postcss
- Do NOT add tailwindcss to dependencies at all
- Tailwind is loaded via CDN in index.html automatically
- Just use Tailwind utility classes freely in JSX
- vite.config.ts should only have the react plugin

========================
IMAGES (VERY IMPORTANT)
========================

- ALWAYS use direct URLs from:
  https://images.unsplash.com/

- NEVER use:
  - source.unsplash.com
  - picsum.photos

- Each image MUST be:
  - different
  - context-aware

Example:
shoes → sneakers image  
food → dish image  

========================
STRUCTURE
========================

- Split UI into components
- Use reusable components
- No empty UI

========================

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