import { Router } from "express";
import { pool } from "../config/db";
import { updateProfile } from "../controller/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();


router.get("/me", authenticate, async (req, res) => {
    try {
        
        const userId = (req.user as { userId: string }).userId;
        console.log(userId);

        
        const result = await pool.query(
            "SELECT id, email, created_at FROM users WHERE id = $1",
            [userId]
        );

        // console.log(result);
        

        

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (err) {
        console.log(err);
        
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/profile", authenticate, updateProfile);

export default router
