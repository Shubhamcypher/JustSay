import OpenAI from "openai";


//for OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



export async function fixGeneratedCode(files: Record<string, any>) {
    const cacheKey = JSON.stringify(files);
  
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `
  You are a strict TypeScript + React compiler.
  
  Fix ALL syntax and runtime errors.
  
  DO NOT redesign UI.
  DO NOT change structure.
  ONLY fix code.
  
  CRITICAL RULES:
  
  - Fix arrow functions:
    () = {} ❌ → () => {} ✅
  
  - Fix event handlers:
    onClick must be valid
  
  - Remove invalid assignments like:
    className inside functions
  
  - Fix imports/exports
  
  - Ensure code compiles in Vite + React
  
  Return JSON:
  {
    "files": {
      "filePath": "fixed content"
    }
  }
  `
            },
            {
              role: "user",
              content: JSON.stringify(files)
            }
          ]
        });
  
        const raw = res.choices[0].message.content || "";
  
        // 🔥 LOG RAW OUTPUT (IMPORTANT)
        console.log("🛠️ FIXER RAW OUTPUT:", raw);
  
        const json = JSON.parse(raw);
  
        // 🔥 VALIDATION
        if (!json.files || typeof json.files !== "object") {
          throw new Error("Invalid fixer response");
        }
  
        console.log("✅ Fixer success");
        return json;
  
      } catch (err) {
        console.error("❌ Fixer error:", err);
        console.warn(`⚠️ Fixer retry ${attempt + 1}`);
      }
    }
  
    throw new Error("Fixer failed completely");
  }