import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // IMPORTANT
});

export async function streamLLM(prompt: string) {
  const stream = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    stream: true,
    messages: [
      {
        role: "system",
        content: `
You are a senior full stack developer.

Generate a complete Vite + React + Tailwind project.

STRICT RULES (VERY IMPORTANT):

- DO NOT use markdown
- DO NOT use backticks (\`\`\`)
- DO NOT wrap output in code blocks
- DO NOT add ** or formatting
- ONLY output plain text

FORMAT (STRICT):

START_FILE: package.json
{ file content }
END_FILE

START_FILE: src/App.tsx
{ file content }
END_FILE

If you break format, output is invalid.

ONLY output files.
NO explanations.
`
      },
      {
        role: "user",
        content: prompt,
      }
    ],
  });

  return stream;
}