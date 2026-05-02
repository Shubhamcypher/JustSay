// src/services/enhanceUX.service.ts

import OpenAI from "openai";
import {
  REFERENCE_NAVBAR,
  REFERENCE_HERO,
  REFERENCE_CARD_GRID,
} from "../utils/referenceComponents";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanJSON(text: string) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

// Step 2 — Key file filter (scopes enhanceUX to only high-impact files)
export function selectFilesForEnhancement(
  files: Record<string, any>
): Record<string, any> {
  const HIGH_IMPACT_PATTERNS = [
    /^src\/App\.tsx$/,
    /^src\/pages\//,
    /^src\/components\//,
  ];

  const selected: Record<string, any> = {};

  for (const [path, value] of Object.entries(files)) {
    if (HIGH_IMPACT_PATTERNS.some(pattern => pattern.test(path))) {
      selected[path] = value;
    }
  }

  console.log(
    `🎨 enhanceUX scoped to ${Object.keys(selected).length} of ${Object.keys(files).length} files:`,
    Object.keys(selected)
  );

  return selected;
}

// In enhanceUX.service.ts — replace single call with batched calls

export async function enhanceUX(
  files: Record<string, any>
): Promise<{ files: Record<string, any> }> {

  const scopedFiles = selectFilesForEnhancement(files);

  if (Object.keys(scopedFiles).length === 0) {
    console.warn("⚠️ enhanceUX: no files matched scope filter, skipping");
    return { files };
  }

  // Split into batches of 4 to stay within token limits
  const entries = Object.entries(scopedFiles);
  const BATCH_SIZE = 4;
  const batches: [string, any][][] = [];
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    batches.push(entries.slice(i, i + BATCH_SIZE));
  }

  console.log(`🎨 enhanceUX: ${entries.length} files split into ${batches.length} batches`);

  let allEnhanced: Record<string, any> = {};

  for (let i = 0; i < batches.length; i++) {
    const batch = Object.fromEntries(batches[i]);
    console.log(`🎨 enhanceUX batch ${i + 1}/${batches.length}:`, Object.keys(batch));

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 16000,   // enough for 4 files
      messages: [
        {
          role: "system",
          content: `
You are a UI/UX expert specializing in React + Tailwind applications.

Your job is to take existing React components and elevate their visual quality
to match or exceed the reference components below.

========================
REFERENCE QUALITY BAR
========================

// --- Navbar reference ---
${REFERENCE_NAVBAR}

// --- Hero reference ---
${REFERENCE_HERO}

// --- Card grid reference ---
${REFERENCE_CARD_GRID}

========================
WHAT TO IMPROVE
========================

1. VISUAL HIERARCHY
   - Headings: text-4xl → text-2xl → text-lg
   - Section spacing: py-16, py-24
   - Containers: max-w-6xl mx-auto px-4

2. COLOR CONSISTENCY
   - Background: gray-950 pages, gray-900 sections, gray-800/60 cards
   - Text: white headings, gray-400 body, gray-500 captions
   - Accent: indigo-600 primary, indigo-400 highlights

3. INTERACTIVE POLISH
   - Every clickable element: hover + transition
   - Buttons: hover:bg-indigo-500 transition-colors
   - Cards: hover:border-indigo-500/50 hover:bg-gray-800 transition-all duration-200

4. LOADING / EMPTY / ERROR STATES
   - Loading: animate-pulse bg-gray-800 rounded skeleton
   - Empty: centered icon + message + CTA
   - Error: red-tinted card with retry button

5. RESPONSIVE LAYOUT
   - Mobile first, md: for 2-col, lg: for 3-col

========================
STRICT RULES
========================

- Return ONLY valid JSON — no markdown, no backticks
- Output format:
{
  "files": {
    "filePath": "updated full content"
  }
}
- Return EVERY file you received, even if unchanged
- DO NOT rename files or change component names
- DO NOT change any logic, routing, or state management
- DO NOT add new imports that don't exist in the project
- DO NOT add @tailwind directives or config files
`
        },
        {
          role: "user",
          content: `
Improve the UI/UX of these React components.
Return every file with its full updated content.

Files to enhance:
${JSON.stringify(batch, null, 2)}
`
        }
      ]
    });

    const raw = res.choices[0].message.content || "";
    const cleaned = cleanJSON(raw);

    try {
      const json = JSON.parse(cleaned);
      if (!json.files || typeof json.files !== "object") {
        throw new Error("Invalid shape");
      }
      allEnhanced = { ...allEnhanced, ...json.files };
      console.log(`✅ enhanceUX batch ${i + 1} done`);
    } catch (err) {
      console.error(`❌ enhanceUX batch ${i + 1} JSON parse failed:`, err);
      // On failure, keep originals for this batch
      allEnhanced = { ...allEnhanced, ...batch };
    }
  }

  // Merge enhanced files back into the full set
  const merged = { ...files, ...allEnhanced };
  console.log(`✅ enhanceUX complete — ${Object.keys(allEnhanced).length} files enhanced`);
  return { files: merged };
}