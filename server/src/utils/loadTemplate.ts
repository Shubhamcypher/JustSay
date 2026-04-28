import fs from "fs";
import path from "path";

export function loadTemplate() {
  const basePath = path.join(__dirname, "../../templates/vite-react-tailwind");

  const templateFiles: Record<string, { content: string }> = {};

  function readDir(dir: string, prefix = "") {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relPath = path.join(prefix, item);

      if (fs.statSync(fullPath).isDirectory()) {
        readDir(fullPath, relPath);
      } else {
        templateFiles[relPath.replace(/\\/g, "/")] = {
          content: fs.readFileSync(fullPath, "utf-8"),
        };
      }
    }
  }

  readDir(basePath);
  return templateFiles;
}