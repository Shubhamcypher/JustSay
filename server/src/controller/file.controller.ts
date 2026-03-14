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

  export async function getFiles(req: AuthRequest, res: Response) {
    const { projectId } = req.params;
  
    const result = await pool.query(
      "SELECT * FROM project_files WHERE project_id=$1",
      [projectId]
    );
  
    res.json(result.rows);
  }

  export async function updateFile(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { content } = req.body;
  
    const result = await pool.query(
      `UPDATE project_files
       SET content=$1, updated_at=now()
       WHERE id=$2
       RETURNING *`,
      [content, id]
    );
  
    res.json(result.rows[0]);
  }