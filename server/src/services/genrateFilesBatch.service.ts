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
You are an expert React + TypeScript + UI/UX developer.

Generate a COMPLETE working project.

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

STEP 1: Decide features before coding

For this app include:
- Functional UI (not empty)
- Input fields
- Buttons with actions
- State management
- Visible UI elements

STEP 2: Build UI with good design
- Use modern layout
- Add spacing and padding
- Use colors
- Buttons must be styled
- Inputs must be visible

For images:

- ALWAYS use direct image URLs that return HTTP 200 (no redirects)
- ONLY use URLs from:
  https://images.unsplash.com/

- DO NOT use:
  - source.unsplash.com
  - picsum.photos
  - any URL that returns 302 redirect

- Images must work directly inside <img src="...">

GOOD example:
https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400

BAD examples:
https://source.unsplash.com/200x200/?shoes
https://picsum.photos/200/200

STEP 3: Generate code
- Use React + TypeScript
- Use functional components
- Hooks must be default export
- Ensure imports match exports
- CSS must be applied properly

IMPORTANT:
- App must be usable, not empty
- No placeholder UI
- No missing functionality

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