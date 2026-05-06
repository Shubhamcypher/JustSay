import { Request, Response } from "express";
import { pool } from "../config/db";
import { planProject } from "../services/planner.service";
import { generateFilesBatch } from "../services/genrateFilesBatch.service";
import { injectImages } from "../utils/injectImages";
import { normalizeFiles } from "../utils/normalizeFiles";
import { fixCommonBugs } from "../utils/fixCommonBugs";
import { runStage } from "../utils/runStage";
import { enforceFileStructure } from "../utils/enforceFileStructure";
import { loadTemplate } from "../utils/loadTemplate";
import { expandFeatures } from "../services/featureExpander.service";
import { enhanceUX } from "../services/enhanceUX.service";
import { generateSkeletons, SkeletonMap } from "../services/generateSkeletons.service";
// import { streamLLM } from "../services/ai.service";
// import { parseStream } from "../utils/streamParser";
// import { enhanceFiles } from "../utils/enhanceFiles";
// import { fixTailwind } from "../utils/fixTailwind";
// import { fixGeneratedCode } from "../services/fixGeneratedCode.service";
// import { generateFile } from "../services/generator.service";

type ProjectPlan = {
    files: string[];
};

const isBinaryFile = (filePath: string) => {
    return /\.(ico|png|jpg|jpeg|gif|svg|webp)$/i.test(filePath);
};

export const generateProject = async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!prompt) {
        return res.status(400).json({ message: "Prompt required" });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let projectId = "";

    try {
        console.log(prompt);

        //Create project
        const projectRes = await pool.query(
            `INSERT INTO projects (name, stack, status, owner_id, prompt)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
            [
                prompt.slice(0, 30), // template name
                "vite-react",
                "generating",
                req.user.userId,
                prompt
            ]
        );

        projectId = projectRes.rows[0].id;

        // Send projectId to frontend
        res.write(
            `data: ${JSON.stringify({
                type: "project",
                projectId
            })}\n\n`
        );



        //Generate in chunk
        async function generateInChunks(
            files: string[],
            prompt: string,
            features: string[],
            chunkSize: number,
            skeletons: SkeletonMap,
            res: Response,
            streamedPaths: Set<string>   // 👈 from Fix 4 — pass in to track what's been sent
        ) {
            const chunks: string[][] = [];
            const NEVER_STREAM_FROM_AI = new Set([
                "package.json",
                "vite.config.ts",
                "tailwind.config.js",
                "postcss.config.js",
                "index.html",
                "src/index.css",
                "src/main.tsx"
            ]);
            for (let i = 0; i < files.length; i += chunkSize) {
                chunks.push(files.slice(i, i + chunkSize));
            }

            let allFiles: Record<string, any> = {};

            for (const chunk of chunks) {
                console.log(`Generating chunk (${chunk.length} files): ${chunk.join(", ")}`);

                const enrichedPrompt = `
          User Prompt:
          ${prompt}
          
          Features to include:
          ${features.join("\n")}
              `;

                const result = await generateFilesBatch(
                    chunk,
                    enrichedPrompt,
                    skeletons       // 👈 pass the full skeleton map
                );


                if (result?.files) {
                    for (const [path, content] of Object.entries(result.files)) {
                        if (NEVER_STREAM_FROM_AI.has(path)) {
                            console.log(`🔒 Blocked AI stream of protected file: ${path}`);
                            allFiles[path] = content;
                            continue;
                        }
                        res.write(
                            `data: ${JSON.stringify({ type: "file", path, content })}\n\n`
                        );
                        streamedPaths.add(path);
                        allFiles[path] = content;
                    }
                }
            }

            return { files: allFiles };
        }

        // Planning phase — now parallel (Fix 5 preview)
        const [plan, featureData] = await Promise.all([
            planProject(prompt),
            expandFeatures(prompt)
        ]);

        plan.files = plan.files.filter((f: string) => !isBinaryFile(f));

        if (!plan.files || !Array.isArray(plan.files)) {
            throw new Error("Invalid plan from LLM");
        }

        const textFiles = plan.files.filter((f: string) => !isBinaryFile(f));
        const features = featureData.features || [];

        // 🦴 NEW: Generate skeletons ONCE for all files
        const skeletons = await generateSkeletons(textFiles, prompt, features);

        // Track streamed paths to prevent double-streaming (Fix 4)
        const streamedPaths = new Set<string>();

        // Generate in chunks of 5 with full skeleton context
        const result = await generateInChunks(
            textFiles,
            prompt,
            features,
            5,            // 👈 was 2, now 5
            skeletons,
            res,
            streamedPaths
        );

        const preFixSnapshot: Record<string, string> = {};
        for (const [p, f] of Object.entries(result.files)) {
            preFixSnapshot[p] = typeof f === "string" ? f : (f as any)?.content || "";
        }


        let files = await runStage("normalizeFiles (initial)", () =>
            normalizeFiles(result.files)
        );

        files = enforceFileStructure(files, "normalizeFiles initial");

        // files = await runStage("fixGeneratedCode", async () => {
        //     const fixed = await fixGeneratedCode(files);

        //     if (!fixed.files) throw new Error("Fixer failed");

        //     return fixed.files;
        // });

        // files = enforceFileStructure(files, "fixGeneratedCode");

        files = await runStage("normalizeFiles (after fixer)", () =>
            normalizeFiles(files)
        );

        files = enforceFileStructure(files, "normalizeFiles after fixer");

        files = await runStage("fixCommonBugs", () =>
            fixCommonBugs(files)
        );

        files = enforceFileStructure(files, "fixCommonBugs");


        files = await runStage("enhanceUX", async () => {
            const enhanced = await enhanceUX(files);
            return enhanced.files;
        });


        files = await runStage("fixAfterEnhance", () =>
            fixCommonBugs(files)
        );

        files = enforceFileStructure(files, "fixAfterEnhance");


        // files = await runStage("enhanceFiles", () =>
        //     enhanceFiles(files)
        // );

        // files = enforceFileStructure(files, "enhanceFiles");

        for (const [filePath, file] of Object.entries(files)) {
            const fixedContent = typeof file === "string" ? file : (file as any)?.content || "";
            const originalContent = preFixSnapshot[filePath] || "";
            if (fixedContent !== originalContent) {
                streamedPaths.delete(filePath);
                console.log(`🔄 Re-streaming changed file: ${filePath}`);
            }
        }

        files = await runStage("injectImages", () =>
            injectImages(files, prompt)
        );

        files = enforceFileStructure(files, "injectImages");


        const TEMPLATE_OVERRIDE_FILES = new Set([
            "package.json",
            "vite.config.ts",
            "tailwind.config.js",
            "postcss.config.js",
            "index.html",
            "src/index.css",
            "src/main.tsx"
        ]);

        const template = loadTemplate();
        const safeTemplate: Record<string, any> = {};

        for (const [path, value] of Object.entries(template)) {
            if (TEMPLATE_OVERRIDE_FILES.has(path)) {
                safeTemplate[path] = value;
            }
        }

        files = { ...files, ...safeTemplate };
        files = enforceFileStructure(files, "template merge");

        // 🔥 LOOP ONLY FOR SAVING + STREAMING
        const allPaths = Object.keys(files);
        // ✅ Only stream if NOT already sent during generation
        for (const filePath of allPaths) {
            let content = "";

            if (isBinaryFile(filePath)) {
                console.log(`⏭️ Skipping binary file: ${filePath}`);
            } else {
                content = files?.[filePath]?.content || "";
            }

            // Always save to DB
            await pool.query(
                `INSERT INTO project_files (project_id, path, content)
         VALUES ($1,$2,$3)`,
                [projectId, filePath, content]
            );

            // Only stream if not already sent
            if (!streamedPaths.has(filePath)) {
                res.write(
                    `data: ${JSON.stringify({ type: "file", path: filePath, content })}\n\n`
                );
            }
        }


        // Mark project completed
        await pool.query(
            `UPDATE projects SET status=$1 WHERE id=$2`,
            ["completed", projectId]
        );

        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();

    } catch (err) {
        console.error("GENERATION ERROR:", err);

        if (projectId) {
            await pool.query(
                `UPDATE projects SET status=$1 WHERE id=$2`,
                ["failed", projectId]
            );
        }

        res.write(`data: ${JSON.stringify({ type: "error" })}\n\n`);
        res.end();
    }
};