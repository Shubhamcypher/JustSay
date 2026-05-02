// src/services/generateSkeletons.service.ts

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanJSON(text: string) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export interface FileSkeleton {
  componentName: string;
  purpose: string;
  props: string[];
  sections: string[];
  imports: string[];
}

export type SkeletonMap = Record<string, FileSkeleton>;

export async function generateSkeletons(
  files: string[],
  prompt: string,
  features: string[]
): Promise<SkeletonMap> {
  console.log("🦴 Generating skeletons for", files.length, "files");

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: `
You are a senior React architect.

Your job is to design the STRUCTURE of a React + TypeScript app — not the full code.

For each file, return a skeleton describing:
- componentName: the exported component or function name
- purpose: one sentence of what it does
- props: list of TypeScript prop names it will accept
- sections: list of visual/logical sections it will contain (e.g. "hero banner", "stats row", "feature cards")
- imports: list of other files in this project it will import from

Return ONLY valid JSON, no markdown, no backticks:

{
  "skeletons": {
    "src/App.tsx": {
      "componentName": "App",
      "purpose": "Root component, sets up routing and global providers",
      "props": [],
      "sections": ["Router setup", "AppRoutes", "Global layout"],
      "imports": ["src/routes/AppRoutes.tsx", "src/context/AppContext.tsx"]
    }
  }
}

Rules:
- Every file in the input list MUST have a skeleton entry
- Sections should be specific to the app — not generic like "header, body, footer"
- Imports must only reference other files in the input list
- Props must be realistic for the component's purpose
- Design the components to work TOGETHER as a coherent app
`
      },
      {
        role: "user",
        content: `
App idea: ${prompt}

Required features:
${features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Files to skeleton:
${files.join("\n")}

Return the skeleton map for all files above.
`
      }
    ]
  });

  const raw = res.choices[0].message.content || "";
  const cleaned = cleanJSON(raw);
  const json = JSON.parse(cleaned);

  if (!json.skeletons || typeof json.skeletons !== "object") {
    throw new Error("Invalid skeleton response from LLM");
  }

  console.log("🦴 Skeletons generated:", Object.keys(json.skeletons).length, "files");
  return json.skeletons as SkeletonMap;
}