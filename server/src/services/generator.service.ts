import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

function cleanFileOutput(text: string) {
    // remove markdown
    text = text.replace(/```[\s\S]*?```/g, "");

    // remove bash-like lines
    if (text.includes("mkdir") || text.includes("echo ")) {
        throw new Error("Invalid file: contains bash script");
    }

    // remove accidental JSON wrappers
    if (text.trim().startsWith("{") && text.includes("dependencies")) {
        // allow only if it's package.json
        return text;
    }

    return text.trim();
}


const systemPrompt = `
  You are a strict file generator.
  
  You generate ONLY ONE file.
  
  STRICT RULES:
  
  - Output ONLY the file content
  - NO markdown (no backticks)
  - NO explanations
  - NO comments like // filename
  - NO bash commands
  - NO multiple files
  - NO JSON (unless file is package.json)
  - NO repetition
  
  You MUST ONLY generate the content of THIS file:
  {FILE_PATH}
  
  If you output anything else, the system will reject it.
  `;


export async function generateFile(
    filePath: string,
    prompt: string,
    allFiles: string[]
) {
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await openai.chat.completions.create({
            model: "nvidia/nemotron-3-super-120b-a12b:free",
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: systemPrompt.replace("{FILE_PATH}", filePath),
                },
                {
                    role: "user",
                    content: `
  User request:
  ${prompt}
  
  File to generate:
  ${filePath}
  
  All project files:
  ${allFiles.join("\n")}
            `,
                },
            ],
        });

        let raw = res.choices[0].message.content || "";

        try {
            const cleaned = cleanFileOutput(raw);

            // 🔥 BASIC VALIDATION
            if (cleaned.length < 20) {
                throw new Error("File too small");
            }

            if (cleaned.includes("mkdir") || cleaned.includes("echo ")) {
                throw new Error("Invalid content");
            }

            if (
                cleaned.includes("useState<") &&
                !cleaned.includes(");")
            ) {
                throw new Error("Truncated file detected");
            }

            return cleaned;
        } catch (err) {
            console.warn(`⚠️ File generation failed for ${filePath}, retrying...`);
        }
    }

    throw new Error(`Failed to generate ${filePath}`);
}