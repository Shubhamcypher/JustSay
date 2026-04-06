import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createProject } from "../controller/project.controller";


const router = express.Router();

router.post("/generate", authenticate, createProject);

export default router;