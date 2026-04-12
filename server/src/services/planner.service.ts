import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function planProject(prompt: string) {
    console.log("Jumped to plan");
    
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await openai.chat.completions.create({
                model: "gpt-4o-mini",
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

            return json;
        } catch (err) {
            console.log("Planning error: ",err);
            
            console.warn(`⚠️ Planner retry ${attempt + 1}`);
        }
    }

    throw new Error("Planner failed");
}