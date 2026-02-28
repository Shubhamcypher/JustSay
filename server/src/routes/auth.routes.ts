import { Router } from "express";
import { register, login, refresh, logout } from "../controller/auth.controller";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { pool } from "../config/db";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, created_at FROM users WHERE id = $1",
      [req.user?.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
