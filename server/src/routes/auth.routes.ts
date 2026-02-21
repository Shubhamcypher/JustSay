import { Router } from "express";
import { register, login, refresh, logout } from "../controller/auth.controller";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authenticate, async (req: AuthRequest, res) => {
    res.json({
      message: "You are authenticated",
      userId: req.user?.userId,
    });
  });

export default router;
