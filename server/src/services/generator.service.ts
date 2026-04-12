import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function cleanFileOutput(text: string) {
    // ✅ remove only backticks, keep content
    text = text.replace(/```(tsx|ts|js|json)?/g, "").replace(/```/g, "");

    if (text.includes("mkdir") || text.includes("echo ")) {
        throw new Error("Invalid bash content");
    }

    return text.trim();
}

function isValidFile(content: string) {
    if (content.length < 30) return false;

    // accept flexible valid code patterns
    const validIndicators = [
        "import",
        "export",
        "function",
        "const",
        "React",
        "<div",
        "{",
    ];

    return validIndicators.some(v => content.includes(v));
}



function getDynamicPrompt(filePath: string) {
    let base = `
You generate ONLY the file content.

Rules:
- No markdown
- No explanation
- No filename comments
- No multiple files
`;

    if (filePath === "package.json") {
        return base + `
Return valid JSON.
Include dependencies for React + Vite.
`;
    }

    if (filePath === "src/main.tsx") {
        return base + `
React entry file.
Use ReactDOM.createRoot and render <App />.
`;
    }

    if (filePath.endsWith(".tsx")) {
        return base + `
Use React + TypeScript.
Export default component.
`;
    }

    if (filePath.endsWith(".html")) {
        return base + `
Return valid HTML.
`;
    }

    return base;
}

export async function generateFile(
    filePath: string,
    prompt: string,
    allFiles: string[]
) {
    for (let attempt = 0; attempt < 1; attempt++) {
        try {
            const res = await openai.chat.completions.create({
                model: "gpt-4o",
                temperature: 0.2,
                max_tokens: 3000,
                messages: [
                    {
                        role: "system",
                        content: getDynamicPrompt(filePath),
                    },
                    {
                        role: "user",
                        content: `
User request:
${prompt}

File:
${filePath}

Project files:
${allFiles.join("\n")}
`,
                    },
                ],
            });

            const raw = res.choices[0].message.content || "";
            const cleaned = cleanFileOutput(raw);

            if (!isValidFile(cleaned)) {
                throw new Error("Invalid file");
            }

            return cleaned;
        } catch (err) {
            console.warn(`⚠️ Retry ${filePath} (${attempt + 1})`);
        }
    }

    throw new Error(`Failed to generate ${filePath}`);
}