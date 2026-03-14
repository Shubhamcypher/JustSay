import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

export async function createFile(req: AuthRequest, res: Response) {
    const { projectId, path, content } = req.body;
  
    const result = await pool.query(
      `INSERT INTO project_files (project_id, path, content)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [projectId, path, content]
    );
  
    res.status(201).json(result.rows[0]);
  }