import { pool } from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { Request, Response } from "express";
import { generateReactTemplate } from "../services/ai.service";
import { writeProjectToDisk } from "../services/fileSystem.service";
import docker, { buildProjectImage, runProjectContainer } from "../services/docker.service";
import { getNextPort } from "../utils/port.util";

export async function createProject(req: AuthRequest, res: Response) {
    const { name, stack } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO projects (name, stack, status, owner_id)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [name, stack, "stopped", req.user?.userId]
      );
  
      const project = result.rows[0];

      // 👇 generate starter files
      if (stack === "react") {
        await generateReactTemplate(project.id);
      }
  
      res.status(201).json(project)
  
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  }

  export async function getProjects(req: AuthRequest, res: Response) {
    const result = await pool.query(
      "SELECT * FROM projects WHERE owner_id=$1 ORDER BY created_at DESC",
      [req.user?.userId]
    );
  
    res.json(result.rows);
  }

  export async function getProjectById(req: AuthRequest, res: Response) {
    const { id } = req.params;
  
    const result = await pool.query(
      "SELECT * FROM projects WHERE id=$1 AND owner_id=$2",
      [id, req.user?.userId]
    );
  
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
  
    res.json(result.rows[0]);
  }

  export async function deleteProject(req: AuthRequest, res: Response) {
    const { id } = req.params;
  
    await pool.query(
      "DELETE FROM projects WHERE id=$1 AND owner_id=$2",
      [id, req.user?.userId]
    );
  
    res.json({ message: "Project deleted" });
  }

  export async function startProject(req: AuthRequest, res: Response) {

    const projectId = req.params.id;
  
    try {
  
      // 1️⃣ Write project files
      const projectPath = await writeProjectToDisk(projectId);
  
      // 2️⃣ Build docker image
      await buildProjectImage(projectPath, projectId);
  
      // 3️⃣ Allocate port
      const port = getNextPort();
  
      // 4️⃣ Run container
      const containerId = await runProjectContainer(projectId, port);

      //Insert into DB
      await pool.query(
        `INSERT INTO containers (project_id, container_id, port, status)
         VALUES ($1,$2,$3,$4)`,
        [projectId, containerId, port, "running"]
      );
  
      // 5️⃣ Return preview URL
      res.json({
        message: "Project running",
        preview: `http://localhost:${port}`,
        containerId
      });
  
    } catch (error) {
      res.status(500).json({ message: "Failed to start project" });
    }
  }
  

  export async function stopProject(req: AuthRequest, res: Response) {

    const projectId = req.params.id;
  
    try {
  
      const result = await pool.query(
        "SELECT container_id FROM containers WHERE project_id=$1 AND status='running'",
        [projectId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "No running container" });
      }
  
      const containerId = result.rows[0].container_id;
  
      const container = docker.getContainer(containerId);
  
      await container.stop();
      await container.remove();
  
      await pool.query(
        "UPDATE containers SET status='stopped' WHERE container_id=$1",
        [containerId]
      );
  
      res.json({
        message: "Project stopped"
      });
  
    } catch (error) {
      res.status(500).json({ message: "Failed to stop project" });
    }
  }