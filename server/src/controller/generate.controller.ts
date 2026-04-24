import { Request, Response } from "express";
import { pool } from "../config/db";
// import { streamLLM } from "../services/ai.service";
// import { parseStream } from "../utils/streamParser";
import { planProject } from "../services/planner.service";
// import { generateFile } from "../services/generator.service";
import { generateFilesBatch } from "../services/genrateFilesBatch.service";
import { injectImages } from "../utils/injectImages";
import { enhanceFiles } from "../utils/enhanceFiles";
import { fixTailwind } from "../utils/fixTailwind";
import { normalizeFiles } from "../utils/normalizeFiles";

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
            `INSERT INTO projects (name, stack, status, owner_id)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
            [
                prompt.slice(0, 30), // template name
                "vite-react",
                "generating",
                req.user.userId
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

        let buffer = "";
        // 🔥 PLAN
        const plan: ProjectPlan = await planProject(prompt);
        plan.files = plan.files.filter(f => !isBinaryFile(f));

        if (!plan.files || !Array.isArray(plan.files)) {
            throw new Error("Invalid plan from LLM");
        }

        // 🔥 FILTER TEXT FILES ONLY
        const textFiles = plan.files.filter(f => !isBinaryFile(f));

        // 🔥 SINGLE API CALL
        const result = await generateFilesBatch(textFiles, prompt);

        let files = normalizeFiles(result.files);

        files = fixTailwind(files);      // FIRST
        files = enhanceFiles(files);     // THEN
        files = injectImages(files, prompt); // LAST

        // 🔥 LOOP ONLY FOR SAVING + STREAMING
        const allPaths = Object.keys(files);
        for (const filePath of allPaths) {

            let content = "";

            if (isBinaryFile(filePath)) {
                console.log(`⏭️ Skipping binary file: ${filePath}`);
            } else {
                content = files?.[filePath]?.content || "";
            }

            // save
            await pool.query(
                `INSERT INTO project_files (project_id, path, content)
         VALUES ($1,$2,$3)`,
                [projectId, filePath, content]
            );

            // stream
            res.write(
                `data: ${JSON.stringify({
                    type: "file",
                    path: filePath,
                    content,
                })}\n\n`
            );
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