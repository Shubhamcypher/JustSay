import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createProject } from "../controller/project.controller";

const router = Router();


router.post("/", authenticate, createProject);
router.get("/", authenticate, getProjects);
router.get("/:id", authenticate, getProjectById);
router.delete("/:id", authenticate, deleteProject);