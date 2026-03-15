import { pool } from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { Request, Response } from "express";
import { generateReactTemplate } from "../services/ai.service";

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