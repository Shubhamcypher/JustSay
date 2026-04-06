import { pool } from "../config/db";
import {Request, Response } from "express";


export async function updateProfile(req: Request, res: Response) {
    const { name } = req.body;
  
    try {
      const result = await pool.query(
        "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email",
        [name, req.user?.userId]
      );
  
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }