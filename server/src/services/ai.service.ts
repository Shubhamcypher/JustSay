import { pool } from "../config/db";

export async function generateReactTemplate(projectId: string, client: any) {

  const files = [
    {
      path: "/package.json",
      content: `{
  "name": "app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite"
  }
}`
    },
    {
      path: "/index.html",
      content: `<div id="root"></div>`
    },
    {
      path: "/src/main.tsx",
      content: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);`
    },
    {
      path: "/src/App.tsx",
      content: `export default function App() {
  return <h1>Hello from JustSay</h1>;
}`
    }
  ];

  for (const file of files) {
    await pool.query(
      `INSERT INTO project_files (project_id, path, content)
       VALUES ($1,$2,$3)`,
      [projectId, file.path, file.content]
    );
  }
}