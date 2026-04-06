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

STRICT FORMAT:

START_FILE: <path>
<file content>
END_FILE

Only output files. No explanations.
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