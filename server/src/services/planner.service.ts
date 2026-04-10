import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });

function extractFilesJSON(text: string) {
    text = text.replace(/```json/g, "").replace(/```/g, "");

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new Error("No JSON found");
    }

    const json = JSON.parse(text.slice(start, end + 1));

    // 🔥 STRICT VALIDATION
    if (!json.files || !Array.isArray(json.files)) {
        throw new Error("Invalid format: missing files array");
    }

    // ❌ reject if extra keys exist
    const allowedKeys = ["files"];
    const extraKeys = Object.keys(json).filter(k => !allowedKeys.includes(k));

    if (extraKeys.length > 0) {
        throw new Error("Invalid JSON: extra fields detected");
    }

    return json;
}

export async function planProject(prompt: string) {
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await openai.chat.completions.create({
            model: "meta-llama/llama-3-8b-instruct",
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: `
            You are a strict JSON generator.
            
            Your job is ONLY to return a JSON object.
            
            DO NOT include:
            - markdown
            - code blocks
            - explanations
            - multiple JSON objects
            - any text before or after JSON
            
            RETURN EXACTLY THIS FORMAT:
            
            {
              "files": [
                "package.json",
                "index.html",
                "src/main.tsx",
                "src/App.tsx"
              ]
            }
            
            Rules:
            - ONLY include "files"
            - DO NOT include dependencies
            - DO NOT include scripts
            - DO NOT include code
            - DO NOT include comments
            
            If you fail, the system will reject your output.
            `
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const raw = res.choices[0].message.content || "";

        try {
            return extractFilesJSON(raw);
        } catch (err) {
            console.warn(`⚠️ Planner failed (attempt ${attempt + 1})`);
        }
    }

    throw new Error("Planner failed after 3 attempts");
}