import { Request, Response } from "express";
import { describeApp, summarizeChanges } from "../services/ai.service";

export async function describeAppController(
    req: Request,
    res: Response
) {
    try {
        const { prompt, fileList } = req.body;

        if (!prompt || !Array.isArray(fileList)) {
            return res.status(400).json({
                message: "prompt and fileList are required",
            });
        }

        const stream = await describeApp(prompt, fileList);

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;

            if (content) {
                res.write(
                    `data: ${JSON.stringify({
                        choices: [
                            {
                                delta: {
                                    content,
                                },
                            },
                        ],
                    })}\n\n`
                );
            }
        }

        res.write("data: [DONE]\n\n");
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to describe app",
        });
    }
}

export async function summarizeChangesController(
    req: Request,
    res: Response
) {
    try {
        const { followUpPrompt, diffMap } = req.body;

        const summary = await summarizeChanges(
            followUpPrompt,
            diffMap
        );

        res.json({
            summary,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to summarize changes",
        });
    }
}