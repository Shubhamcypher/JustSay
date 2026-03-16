import fs from "fs/promises";
import path from "path";
import { pool } from "../config/db";

const STORAGE_PATH = path.join(process.cwd(), "project-storage");

export async function writeProjectToDisk(projectId: string) {

  const projectPath = path.join(STORAGE_PATH, projectId);

  // create project directory
  await fs.mkdir(projectPath, { recursive: true });

  // get files from database
  const result = await pool.query(
    "SELECT path, content FROM project_files WHERE project_id=$1",
    [projectId]
  );

  for (const file of result.rows) {

    const filePath = path.join(projectPath, file.path);

    // ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // write file
    await fs.writeFile(filePath, file.content);
  }

    // 👇 create Dockerfile automatically
    const dockerfile = `
    FROM node:20
    
    WORKDIR /app
    
    COPY . .
    
    RUN npm install
    
    EXPOSE 5173
    
    CMD ["npm", "run", "dev", "--", "--host"]
    `;
    
      await fs.writeFile(
        path.join(projectPath, "Dockerfile"),
        dockerfile
      );

  return projectPath;
}