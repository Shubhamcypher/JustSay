import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function streamLLM(prompt: string) {
  const stream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    stream: true,
    temperature: 0.2,
    max_completion_tokens: 4096,

    messages: [
      {
        role: "system",
        content: `
You are a deterministic code generator.

You MUST follow the format EXACTLY. No exceptions.

=====================
STRICT OUTPUT RULES
=====================

- ONLY output files
- NO explanations
- NO markdown
- NO backticks
- NO headings
- NO extra text
- NO comments outside files
- NEVER output anything before the first START_FILE
- NEVER output anything after the last END_FILE

=====================
FORMAT (STRICT)
=====================

START_FILE: <file_path>
<file_content>
END_FILE

- Every file MUST start with START_FILE
- Every file MUST end with END_FILE
- END_FILE is mandatory and cannot be skipped
- Do NOT merge multiple files
- Do NOT nest files

=====================
STACK REQUIREMENTS
=====================

- Vite
- React 18 (TypeScript)
- Tailwind CSS

=====================
PROJECT STRUCTURE
=====================

You MUST include ALL of these:

- package.json
- index.html
- src/main.tsx
- src/App.tsx
- src/components/*
- tailwind.config.js
- postcss.config.js
- tsconfig.json

=====================
QUALITY RULES
=====================

- All files must be COMPLETE and VALID
- No syntax errors
- No placeholders
- No TODO comments
- No missing imports

=====================
CRITICAL
=====================

If you fail to follow format EXACTLY, the output is invalid.

DO NOT explain anything.
DO NOT skip END_FILE.
DO NOT output partial files.
`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return stream;
}
