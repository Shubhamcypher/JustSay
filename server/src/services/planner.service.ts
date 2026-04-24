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

export async function planProject(prompt: string) {
    console.log("DEV_MODE:", process.env.DEV_MODE);
    const cacheKey = prompt;
    if (process.env.DEV_MODE === "true") {
        const cached = getCache("planner", cacheKey);
        if (cached) {
            console.log("⚡ Using cached planner");
            return cached;
        }
    }
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await openai.chat.completions.create({
                model: "gpt-4o-mini", //open ai model for planner
                // model: "google/gemma-3-12b-it:free", // llama model works freely but too scratchy
                temperature: 0,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `
You are an expert frontend architect.

Your job is to decide ALL required files for the project.

Return JSON:

{
  "files": ["..."]
}

Rules:
- Include ALL necessary files to run the app
- NEVER return empty array
- DO NOT include webpack.config.js
  Use Vite only
- Always include at least:
  - package.json
  - index.html
  - src/main.tsx
  - src/App.tsx
-Do not include binary files like .png, .jpg, .ico.
  - Use external URLs instead.

IMPORTANT STYLING RULE:

- DO NOT create ANY .css files
- DO NOT include files inside src/styles except:
  - src/styles/tailwind-lite.css (this is handled by the system)

- All styling MUST be done using utility classes inside JSX

FAIL CONDITION:
If any .css file (other than tailwind-lite.css) is included, the output is invalid

No explanation. Only JSON.
`
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });
            console.log("Planning done");


            const raw = res.choices[0].message.content || "";
            console.log("RAW PLANNER OUTPUT:", raw);
            const json = JSON.parse(raw);

            if (!Array.isArray(json.files)) {
                throw new Error("Invalid format");
            }
            // ✅ SAVE CACHE
            setCache("planner", cacheKey, json);
            return json;
        } catch (err) {
            console.log("Planning error: ", err);

            console.warn(`⚠️ Planner retry ${attempt + 1}`);
        }
    }

    throw new Error("Planner failed");
}