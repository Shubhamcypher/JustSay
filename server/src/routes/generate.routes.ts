import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { generateProject } from "../controller/generate.controller";


const router = express.Router();

router.post("/generate", authenticate, generateProject);

export default router;