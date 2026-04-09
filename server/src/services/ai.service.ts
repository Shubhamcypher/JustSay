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

ALWAYS include a valid package.json with:

- react, react-dom in dependencies
- vite, typescript, tailwindcss, postcss, autoprefixer in devDependencies

Example:

{
  "name": "app",
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^4.0.0",
    "typescript": "^4.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}

=====================
TAILWIND REQUIREMENTS (MANDATORY)
=====================

You MUST include proper Tailwind CSS setup:

Create file: src/index.css
src/index.css MUST contain:

@tailwind base;
@tailwind components;
@tailwind utilities;

src/main.tsx MUST import the CSS file:

import "./index.css";

tailwind.config.js MUST include:

content: [
"./index.html",
"./src/**/*.{js,ts,jsx,tsx}"
]

postcss.config.js MUST include:

plugins: {
tailwindcss: {},
autoprefixer: {}
}
- NEVER use @apply with Tailwind utility classes that have the same name
- NEVER redefine Tailwind built-in classes (e.g., max-w-md, flex, text-center)
- @apply MUST only be used inside custom classes (e.g., .btn, .card)
- DO NOT create classes like .max-w-md, .flex, etc.

VALID example:
.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded;
}

INVALID example:
.max-w-md {
  @apply max-w-md;
}

=====================
DEPENDENCY RULES (CRITICAL)
=====================

- DO NOT use external libraries unless explicitly required
- DO NOT import packages not listed in package.json
- Prefer native browser APIs (e.g., crypto.randomUUID instead of uuid)


=====================
HTML RULES (CRITICAL):
=====================

- index.html MUST contain ONLY valid HTML
- NEVER include React code or JSX inside index.html
- NEVER use {} expressions inside index.html
- NEVER use onClick, onChange, or any JS logic in index.html
- React code MUST ONLY be inside .tsx or .jsx files

index.html MUST ONLY include:

- a root div with id="root"
- a script tag pointing to /src/main.tsx

=====================
IMPORT RULES:
=====================

- All component imports MUST use correct relative paths
- If a component is inside src/components/, imports MUST be:

  import X from "./components/X"

- NEVER import from "./X" if file is not in same folder

- All imports must match actual file structure EXACTLY

=====================
REACT IMPORT RULE (CRITICAL):
=====================

- ALWAYS include:
  import React from "react";

- EVEN if using React 18
- DO NOT rely on automatic JSX runtime



=====================
REACT ROUTER RULES:
=====================
- If using react-router-dom:
  - MUST import like:
    import { Link } from "react-router-dom"
  - NEVER use default import

- MUST include react-router-dom in dependencies



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
