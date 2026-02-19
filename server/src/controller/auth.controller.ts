import { Request, Response } from "express";
import { pool } from "../config/db";
import { hashPassword, generateAccessToken, generateRefreshToken } from "../utils/auth";
import bcrypt from "bcrypt";
import { comparePassword } from "../utils/auth";
import { verifyRefreshToken } from "../utils/auth";


export async function register(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await hashPassword(password);

    const userResult = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
      [email, hashed]
    );

    const user = userResult.rows[0];

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // store hashed refresh token
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    await pool.query(
      "INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)",
      [hashedRefresh, user.id]
    );

    return res.status(201).json({
      accessToken,
      refreshToken,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT id, password FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    await pool.query(
      "INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)",
      [hashedRefresh, user.id]
    );

    return res.json({
      accessToken,
      refreshToken,
    });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken) as any;

    const tokens = await pool.query(
      "SELECT token FROM refresh_tokens WHERE user_id = $1",
      [decoded.userId]
    );

    let valid = false;

    for (const row of tokens.rows) {
      const match = await bcrypt.compare(refreshToken, row.token);
      if (match) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({ userId: decoded.userId });

    return res.json({ accessToken: newAccessToken });

  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(204);

  const decoded = verifyRefreshToken(refreshToken) as any;

  await pool.query(
    "DELETE FROM refresh_tokens WHERE user_id = $1",
    [decoded.userId]
  );

  return res.json({ message: "Logged out" });
}



