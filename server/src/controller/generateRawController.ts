import { Request, Response } from "express";
import { streamLLM } from "../services/ai.service";

export const generateRaw = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await streamLLM(prompt);

    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content || "";
      if (!text) continue;

      // 👇 SEND RAW TOKENS
      res.write(`data: ${JSON.stringify({
        type: "raw",
        chunk: text
      })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();

  } catch (err) {
    console.error(err);
    res.end();
  }
};