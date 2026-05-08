import OpenAI from "openai";
import { getCachedPlan, setCachedPlan } from "../utils/cacheAiResponse";


//for OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function planProject(prompt: string) {
  console.log("DEV_MODE:", process.env.DEV_MODE);
  const cached = getCachedPlan(prompt);
  if (cached) return cached;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini", //open ai model for planner
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
- The system already provides core infrastructure files:
  - package.json
  - index.html
  - src/main.tsx
  - Tailwind configuration

- You MUST include:
  - src/App.tsx
  - all additional components, hooks, contexts, and utilities required for the app

- Plan for a MULTI-PAGE app — always include:
  - src/routes/AppRoutes.tsx
  - at least 3 page components under src/pages/
  - at least 4 reusable components under src/components/
  - at least 1 context under src/context/
  - at least 1 custom hook under src/hooks/
- More files = more modular = better quality output
- Aim for 12-18 files minimum for any non-trivial app

- Do NOT rely on generating infrastructure files unless absolutely necessary
- Do not include binary files like .png, .jpg, .ico.
  - Use external URLs instead.

IMPORTANT STYLING RULE:

- Tailwind CSS is already pre-configured in the project template.

- DO NOT create:
  - tailwind.config.js
  - postcss.config.js
  - any CSS framework setup

- DO NOT include Tailwind CDN or external stylesheets

- DO NOT modify styling infrastructure

- ONLY use Tailwind utility classes inside JSX

- DO NOT create additional CSS files unless absolutely necessary

- All styling MUST be done using utility classes inside JSX


- If you include src/utils/constants.ts or any utility file, it MUST export
  everything that other files will need — treat it as the single source of truth
  for shared constants
- DO NOT plan files that import from packages not in this list:
  react, react-dom, react-router-dom
- NEVER plan usage of: axios, lodash, zustand, redux, moment, dayjs,
  @tanstack/react-query, or any other third-party package
- For HTTP requests: use native fetch() only
- For state: use React context + useState/useReducer only

FAIL CONDITION:
If Tailwind config files or CDN scripts are added, output is invalid

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
      setCachedPlan(prompt, json);
      return json;
    } catch (err) {
      console.log("Planning error: ", err);

      console.warn(`⚠️ Planner retry ${attempt + 1}`);
    }
  }

  throw new Error("Planner failed");
}