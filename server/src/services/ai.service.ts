// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function describeApp(
  prompt: string,
  fileList: string[]
) {
  const stream = await groq.chat.completions.create({
    // model: "gpt-4o-mini",
    model: "llama-3.3-70b-versatile",
    stream: true,
    max_tokens: 120,
    messages: [
      {
        role: "user",
        content: `The user asked: "${prompt}".
                  You just built a React app with these files: ${fileList.join(", ")}.
                  Write 2–3 sentences describing what you built, what key features it has, and the design style.
                  Be specific, natural, first-person. No fluff.`,
      },
    ],
  });

  return stream;
}


export async function summarizeChanges(
  followUpPrompt: string,
  diffMap: Record<string, { added: number; removed: number }>
) {
  const diffLines = Object.entries(diffMap)
    .map(([path, { added, removed }]) => {
      const name =
        path.split("/").pop()?.replace(/\.(tsx|ts)$/, "") ?? path;

      const parts = [];

      if (added > 0) parts.push(`+${added} lines`);
      if (removed > 0) parts.push(`-${removed} lines`);

      return `${name} (${parts.join(", ")})`;
    })
    .join("; ");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    max_tokens: 80,
    messages: [
      {
        role: "user",
        content: `User asked: "${followUpPrompt}"

Changes made:
${diffLines}

Write one short friendly sentence describing what was updated and what the main change was.

Max 20 words.
No technical jargon.`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim()
    ?? "Done! Changes applied.";
}