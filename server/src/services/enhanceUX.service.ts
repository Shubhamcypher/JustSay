import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function enhanceUX(files: Record<string, any>) {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
  You are a UI/UX improvement engine.

Improve the given React project.

Return ONLY valid JSON:

{
  "files": {
    "filePath": "updated content"
  }
}

Rules:
- Improve spacing, layout, and hierarchy
- Add hover states and transitions
- Improve responsiveness
- DO NOT change logic or structure
- DO NOT rename files

Output must be valid JSON only.
  `
        },
        {
          role: "user",
          content: JSON.stringify(files)
        }
      ]
    });
  
    return JSON.parse(res.choices[0].message.content || "{}");
  }