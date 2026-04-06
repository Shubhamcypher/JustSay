import { Request, Response } from "express";

export const generateProject = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Simulated streaming
  const fakeStream = [
    { type: "status", message: "Initializing project..." },
    { type: "status", message: "Creating package.json..." },
    {
      type: "file",
      path: "package.json",
      content: `{
  "name": "todo-app",
  "version": "1.0.0"
}`
    },
    { type: "status", message: "Creating App.tsx..." },
    {
      type: "file",
      path: "src/App.tsx",
      content: `export default function App() {
  return <h1>Todo App</h1>;
}`
    },
    { type: "status", message: "Project ready 🚀" }
  ];

  for (let i = 0; i < fakeStream.length; i++) {
    await new Promise((r) => setTimeout(r, 800));

    res.write(`data: ${JSON.stringify(fakeStream[i])}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
};