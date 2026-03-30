import { Router } from "express";
import { register, login, refresh, logout } from "../controller/auth.controller";
import passport from "../config/passport"


const router = Router();



router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Step 1: Redirect to Google
router.get("/google", (req, res, next) => {
    const clientUrl = req.query.clientUrl as string;

    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: clientUrl, // 🔥 pass frontend URL
    })(req, res, next);
});

// Step 2: Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const userData = req.user as {
            accessToken: string;
            refreshToken: string;
        };

        const clientUrl = req.query.state as string;
        console.log(clientUrl);
        
        res.redirect(
            `${clientUrl}/oauth-success?accessToken=${encodeURIComponent(
                userData.accessToken
            )}&refreshToken=${encodeURIComponent(userData.refreshToken)}`
        );
    }
);


export default router;
