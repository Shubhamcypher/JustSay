import { Request, Response } from "express";
import { pool } from "../config/db";
import { streamLLM } from "../services/ai.service";
import { parseStream } from "../utils/streamParser";
import { planProject } from "../services/planner.service";
import { generateFile } from "../services/generator.service";

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
        const plan = await planProject(prompt);

        if (!plan.files || !Array.isArray(plan.files)) {
            throw new Error("Invalid plan from LLM");
        }

        for (const filePath of plan.files) {
            const content = await generateFile(filePath, prompt, plan.files);

            await pool.query(
                `INSERT INTO project_files (project_id, path, content)
     VALUES ($1,$2,$3)`,
                [projectId, filePath, content]
            );

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