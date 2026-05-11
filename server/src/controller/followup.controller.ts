import { Request, Response } from "express";
import { pool } from "../config/db";
import OpenAI from "openai";
import { fixCommonBugs } from "../utils/fixCommonBugs";
import { enforceFileStructure } from "../utils/enforceFileStructure";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanJSON(text: string) {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export const followUpProject = async (req: Request, res: Response) => {
    const { followUpPrompt, originalPrompt, projectId, files } = req.body;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!followUpPrompt) return res.status(400).json({ message: "Follow-up prompt required" });
    if (!files || typeof files !== "object") return res.status(400).json({ message: "Files required" });

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {

        // ─── Step 1 — Identify which files need changing (cheap, mini model) ───
        const fileList = Object.keys(files);

        const identifyRes = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `
You are a senior React engineer.

Given a follow-up instruction and a list of project files, identify ONLY the files that need to be changed.

Return JSON:
{
  "filesToChange": ["src/pages/CartPage.tsx", "src/context/CartContext.tsx"]
}

Rules:
- Be minimal — only include files that MUST change
- If a new file needs to be created, include its path
- NEVER include package.json, vite.config.ts, index.html, src/main.tsx, tailwind.config.js
- Maximum 5 files per follow-up to keep costs low
- If the change is purely visual (colors, spacing), only include the affected component
- If the change is data/logic, include context + affected pages
`
                },
                {
                    role: "user",
                    content: `
Original app: ${originalPrompt || "A React application"}

Follow-up instruction: ${followUpPrompt}

All project files:
${fileList.join("\n")}

Which files need to change?
`
                }
            ]
        });

        const identifyRaw = identifyRes.choices[0].message.content || "{}";
        const identifyJson = JSON.parse(identifyRaw);
        const filesToChange: string[] = identifyJson.filesToChange || [];

        if (filesToChange.length === 0) {
            res.write(`data: ${JSON.stringify({ type: "error", message: "Could not identify files to change" })}\n\n`);
            res.end();
            return;
        }

        console.log("📝 Follow-up: files to change:", filesToChange);

        // Stream which files will be updated so frontend can show them
        res.write(`data: ${JSON.stringify({
            type: "plan",
            filesToChange
        })}\n\n`);

        // ─── Step 2 — Generate updated files (only the identified ones) ──────
        // Build context — only send the files that need changing + their direct imports
        const relevantFiles: Record<string, string> = {};
        for (const filePath of filesToChange) {
            if (files[filePath]) {
                relevantFiles[filePath] = typeof files[filePath] === "string"
                    ? files[filePath]
                    : files[filePath]?.content || "";
            }
        }

        const generateRes = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0.2,
            max_tokens: 16000,
            messages: [
                {
                    role: "system",
                    content: `
You are a senior React + TypeScript engineer.

You will receive existing file contents and a follow-up instruction.
Update ONLY what is necessary to implement the instruction.

Return ONLY valid JSON:
{
  "files": {
    "filePath": "complete updated file content"
  }
}

Rules:
- Return the COMPLETE file content — not just the changed parts
- Keep all existing functionality intact — only add/modify what the instruction asks
- Keep all existing imports, exports, and component names
- Use Tailwind CSS for styling — no new CSS files
- Mock data only — no fetch() or API calls
- DO NOT add new npm packages
- Every returned file must be complete and runnable
- If creating a new file, write it from scratch following the existing code style

DEFENSIVE CODING:
- Arrays must use ?? [] before .map()
- Numbers must use ?? 0
- Optional chaining on all object access
`
                },
                {
                    role: "user",
                    content: `
Original app context: ${originalPrompt || "A React application"}

Follow-up instruction: ${followUpPrompt}

Files to update:
${Object.entries(relevantFiles).map(([path, content]) => `
=== ${path} ===
${content}
`).join("\n")}

Return updated versions of all files listed above.
`
                }
            ]
        });

        const generateRaw = generateRes.choices[0].message.content || "";
        const generateCleaned = cleanJSON(generateRaw);
        const generateJson = JSON.parse(generateCleaned);

        if (!generateJson.files || typeof generateJson.files !== "object") {
            throw new Error("Invalid generation response");
        }

        // Run fixCommonBugs on generated files
        let fixedFiles = enforceFileStructure(generateJson.files, "followup");
        fixedFiles = fixCommonBugs(fixedFiles);
        fixedFiles = enforceFileStructure(fixedFiles, "followup-fixed");

        // Add before the for loop that streams patches
        console.log("📝 Follow-up generated files:", Object.keys(fixedFiles));
        for (const [filePath, file] of Object.entries(fixedFiles)) {
            const content = typeof file === "string" ? file : (file as any)?.content || "";
            console.log(`📄 ${filePath} (${content.length} chars):\n${content.slice(0, 200)}...`);
        }

        // Stream each changed file as a patch event
        for (const [filePath, file] of Object.entries(fixedFiles)) {
            const content = typeof file === "string" ? file : (file as any)?.content || "";

            res.write(`data: ${JSON.stringify({
                type: "patch",
                path: filePath,
                content
            })}\n\n`);

            // Save to DB if projectId provided
            if (projectId) {
                await pool.query(
                    `INSERT INTO project_files (project_id, path, content)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (project_id, path) DO UPDATE SET content = $3`,
                    [projectId, filePath, content]
                );
            }
        }

        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();

    } catch (err) {
        console.error("FOLLOW-UP ERROR:", err);
        res.write(`data: ${JSON.stringify({ type: "error" })}\n\n`);
        res.end();
    }
};