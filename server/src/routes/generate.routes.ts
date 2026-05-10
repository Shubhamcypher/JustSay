import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { generateProject } from "../controller/generate.controller";
import { generateRaw } from "../controller/generateRawController";
import { followUpProject } from "../controller/followup.controller";


const router = express.Router();

router.post("/generate", authenticate, generateProject);
router.post("/generate/raw", authenticate, generateRaw);
router.post("/followup", authenticate, followUpProject);

export default router;