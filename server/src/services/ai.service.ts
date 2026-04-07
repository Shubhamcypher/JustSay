// import OpenAI from "openai";

// const client = new OpenAI({
//   apiKey: process.env.GROQ_API_KEY,
//   baseURL: "https://api.groq.com/openai/v1", // IMPORTANT
// });

// export async function streamLLM(prompt: string) {
//   const stream = await client.chat.completions.create({
//    model: "llama-3.3-70b-versatile",
//     stream: true,
//     messages: [
//       {
//         role: "system",
//         content: `
// You are a senior full stack developer.

// Generate a complete Vite + React + Tailwind project.

// STRICT RULES (VERY IMPORTANT):

// - DO NOT use markdown
// - DO NOT use backticks (\`\`\`)
// - DO NOT wrap output in code blocks
// - DO NOT add ** or formatting
// - ONLY output plain text

// FORMAT (STRICT):

// START_FILE: package.json
// { file content }
// END_FILE

// START_FILE: src/App.tsx
// { file content }
// END_FILE

// If you break format, output is invalid.

// ONLY output files.
// NO explanations.
// `
//       },
//       {
//         role: "user",
//         content: prompt,
//       }
//     ],
//   });

//   return stream;
// }



// import { Groq } from 'groq-sdk';

// const groq = new Groq();

// const chatCompletion = await groq.chat.completions.create({
//   "messages": [
//     {
//       "role": "user",
//       "content": "Build a to "
//     }
//   ],
//   "model": "llama-3.3-70b-versatile",
//   "temperature": 1,
//   "max_completion_tokens": 1024,
//   "top_p": 1,
//   "stream": true,
//   "stop": null
// });

// for await (const chunk of chatCompletion) {
//   process.stdout.write(chunk.choices[0]?.delta?.content || '');
// }


import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function streamLLM(prompt: string) {
  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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
