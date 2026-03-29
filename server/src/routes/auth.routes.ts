import { Router } from "express";
import { register, login, refresh, logout } from "../controller/auth.controller";
import passport from "../config/passport"


const router = Router();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Step 1: Redirect to Google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Callback
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
    }),
    (req, res) => {
        const userData = req.user as {
            accessToken: string;
            refreshToken: string;
        };
        res.redirect(
            `${CLIENT_URL}/oauth-success?accessToken=${encodeURIComponent(userData.accessToken)}&refreshToken=${encodeURIComponent(userData.refreshToken)}`
        );
    }
);


export default router;
