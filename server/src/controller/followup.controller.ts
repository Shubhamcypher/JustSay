import { Request, Response } from "express";
import { pool } from "../config/db";
import OpenAI from "openai";
import { fixCommonBugs } from "../utils/fixCommonBugs";
import { enforceFileStructure } from "../utils/enforceFileStructure";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanJSON(text: string) {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

const PROTECTED_FILES = new Set([
    "package.json", "vite.config.ts", "index.html",
    "src/main.tsx", "tailwind.config.js", "postcss.config.js"
]);

export const followUpProject = async (req: Request, res: Response) => {
    const { followUpPrompt, originalPrompt, projectId, files } = req.body;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!followUpPrompt) return res.status(400).json({ message: "Follow-up prompt required" });
    if (!files || typeof files !== "object") return res.status(400).json({ message: "Files required" });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // ── Helper to safely end the stream ─────────────────────────────────────
    const sendEvent = (data: object) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    let keepAlive;

    try {
        // Keeps SSE connection alive during long LLM calls
        keepAlive = setInterval(() => {
            res.write(": ping\n\n"); // SSE comment — browsers ignore it, connection stays open
        }, 15_000);
        const fileList = Object.keys(files).filter(f => !PROTECTED_FILES.has(f));

        // ── Step 1: Identify files to change (gpt-4o-mini, cheap) ───────────
        const identifyRes = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `
You are a senior React engineer.

Given a follow-up instruction and a list of project files, return:
1. The files that need to be modified
2. Their direct dependencies that provide context (imports they rely on)

Return JSON:
{
  "filesToChange": ["src/pages/CartPage.tsx"],
  "contextFiles": ["src/context/CartContext.tsx", "src/utils/constants.ts"]
}

Rules:
- filesToChange: ONLY files that need actual edits (max 5)
- contextFiles: files that won't change but are needed as reference (imports, shared types, constants)
- Never include protected files: package.json, vite.config.ts, index.html, src/main.tsx
- If purely visual change → only the affected component in filesToChange
- If logic/data change → include context file + affected pages
- contextFiles should never overlap with filesToChange
`,
                },
                {
                    role: "user",
                    content: `
Original app: ${originalPrompt || "A React application"}
Follow-up instruction: ${followUpPrompt}

Project files (with content preview):
${fileList.map(f => {
                        const content = typeof files[f] === "string"
                            ? files[f]
                            : files[f]?.content || "";
                        const preview = content.slice(0, 500).replace(/\n/g, " ");
                        return `${f}: ${preview}`;
                    }).join("\n")}

Which files need to change, and which provide needed context?
`,
                },
            ],
        });

        const identifyJson = JSON.parse(identifyRes.choices[0].message.content || "{}");
        const filesToChange: string[] = (identifyJson.filesToChange || [])
            .filter((f: string) => !PROTECTED_FILES.has(f));
        const contextFiles: string[] = (identifyJson.contextFiles || [])
            .filter((f: string) => !PROTECTED_FILES.has(f) && !filesToChange.includes(f));

        if (filesToChange.length === 0) {
            sendEvent({ type: "error", message: "Could not identify files to change" });
            res.end();
            return;
        }

        console.log("📝 filesToChange:", filesToChange);
        console.log("📚 contextFiles:", contextFiles);

        sendEvent({ type: "plan", filesToChange });

        // ── Step 2: Build context-aware prompt ───────────────────────────────
        // Files being changed — full content
        const filesToChangeContent = filesToChange
            .map(f => {
                const content = typeof files[f] === "string"
                    ? files[f]
                    : files[f]?.content || "";
                return `=== ${f} (MODIFY THIS) ===\n${content}`;
            })
            .join("\n\n");

        // Context files — for reference only, don't modify
        const contextContent = contextFiles
            .map(f => {
                const content = typeof files[f] === "string"
                    ? files[f]
                    : files[f]?.content || "";
                return `=== ${f} (CONTEXT ONLY — do not return this file) ===\n${content}`;
            })
            .join("\n\n");

        // ── Step 3: Generate updated files (gpt-4o) ──────────────────────────
        const generateRes = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0.2,
            max_tokens: 16000,
            messages: [
                {
                    role: "system",
                    content: `
You are a senior React + TypeScript engineer making targeted edits to an existing codebase.

Return ONLY valid JSON — no markdown, no backticks:
{
  "files": {
    "filePath": "complete updated file content"
  }
}

Rules:
- Return COMPLETE file content — never partial snippets
- Only return files marked "MODIFY THIS" — never return context-only files
- Keep all existing imports, exports, and component names intact
- Only change what the instruction asks — preserve everything else
- Tailwind CSS only — no new CSS files
- No fetch() or API calls — mock data only
- No new npm packages
- Follow the same code style as the existing files

DEFENSIVE CODING:
- (array ?? []).map(...)
- (value ?? 0).toFixed(2)
- optional chaining: obj?.prop ?? fallback
`,
                },
                {
                    role: "user",
                    content: `
Original app: ${originalPrompt || "A React application"}
Follow-up instruction: "${followUpPrompt}"

${contextContent ? `CONTEXT (reference only — do not return these):\n${contextContent}\n\n` : ""}
FILES TO MODIFY:
${filesToChangeContent}

Return updated versions of the "MODIFY THIS" files only.
`,
                },
            ],
        });

        const raw = generateRes.choices[0].message.content || "";
        const generateJson = JSON.parse(cleanJSON(raw));

        if (!generateJson.files || typeof generateJson.files !== "object") {
            throw new Error("Invalid generation response");
        }

        // Strip any protected or context-only files the model returned anyway
        for (const key of Object.keys(generateJson.files)) {
            if (PROTECTED_FILES.has(key) || contextFiles.includes(key)) {
                console.warn(`⚠️ Stripping unexpected file from follow-up response: ${key}`);
                delete generateJson.files[key];
            }
        }

        // ── Step 4: Fix + stream ─────────────────────────────────────────────
        // AFTER — merge full project first so fixCommonBugs knows all components exist
        const fullProjectFiles: Record<string, { content: string }> = {};
        for (const [path, content] of Object.entries(files)) {
            fullProjectFiles[path] = {
                content: typeof content === "string" ? content : (content as any)?.content || ""
            };
        }

        // Merge: full project + AI changes (AI changes win)
        const mergedForFix = enforceFileStructure(
            { ...fullProjectFiles, ...generateJson.files },
            "followup-merge"
        );

        // Fix runs with full context — knows all components exist
        const allFixed = fixCommonBugs(mergedForFix);

        // Extract ONLY the changed files to stream back — not the whole project
        const fixedFiles: Record<string, { content: string }> = {};
        for (const changedPath of Object.keys(generateJson.files)) {
            if (allFixed[changedPath]) {
                fixedFiles[changedPath] = allFixed[changedPath];
            }
        }

        for (const [filePath, file] of Object.entries(fixedFiles)) {
            const content = typeof file === "string" ? file : (file as any)?.content || "";

            sendEvent({ type: "patch", path: filePath, content });

            if (projectId) {
                await pool.query(
                    `INSERT INTO project_files (project_id, path, content)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (project_id, path) DO UPDATE SET content = $3`,
                    [projectId, filePath, content]
                );
            }
        }

        sendEvent({ type: "done" });
        clearInterval(keepAlive);
        res.end();

    } catch (err) {
        console.error("FOLLOW-UP ERROR:", err);
        clearInterval(keepAlive);
        sendEvent({ type: "error" });
        res.end();
    }
};