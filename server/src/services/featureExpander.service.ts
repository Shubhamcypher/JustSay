import OpenAI from "openai";
import { getCachedFeatures, setCachedFeatures } from "../utils/cacheAiResponse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function expandFeatures(prompt: string) {
  const cached = await getCachedFeatures(prompt);
  if (cached) return cached;
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are a senior product engineer.

Expand the given app idea into a LEVEL 4 feature set.

Return JSON:
{
  "features": ["..."]
}

Rules:
- Add real-world UX features
- Add interactivity
- Add edge cases
- Add polish (loading, empty states, feedback)
- Add multi-page or navigation if applicable
`
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const result = JSON.parse(res.choices[0].message.content || "{}");
  await setCachedFeatures(prompt, result);
  return result;

}