import { pool } from "../config/db";

export async function generateReactTemplate(projectId: string, client: any) {

//   const files = [
//     {
//       path: "/package.json",
//       content: `{
//   "name": "app",
//   "version": "1.0.0",
//   "scripts": {
//     "dev": "vite"
//   }
// }`
//     },
//     {
//       path: "/index.html",
//       content: `<div id="root"></div>`
//     },
//     {
//       path: "/src/main.tsx",
//       content: `import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";

// ReactDOM.createRoot(document.getElementById("root")!).render(<App />);`
//     },
//     {
//       path: "/src/App.tsx",
//       content: `export default function App() {
//   return <h1>Hello from JustSay</h1>;
// }`
//     }
//   ];

const files = [
  {
    path: "package.json",
    content: `{
  "name": "app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0"
  }
}`
  },
  {
    path: "vite.config.ts",
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
});`
  },
  {
    path: "index.html",
    content: `<!DOCTYPE html>
<html>
  <head>
    <title>JustSay App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  },
  {
    path: "src/main.tsx",
    content: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
  },
  {
    path: "src/App.tsx",
    content: `export default function App() {
  return <h1>Hello from JustSay 🚀</h1>;
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