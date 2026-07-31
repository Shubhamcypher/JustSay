import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { generateProject } from "../controller/generate.controller";
import { followUpProject } from "../controller/followup.controller";


const router = express.Router();

router.post("/generate", authenticate, generateProject);

router.post("/followup", authenticate, followUpProject);

export default router;