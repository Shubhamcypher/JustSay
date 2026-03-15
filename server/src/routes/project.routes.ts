import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createProject, deleteProject, getProjectById, getProjects, startProject, stopProject } from "../controller/project.controller";

const router = Router();


router.post("/", authenticate, createProject);
router.get("/", authenticate, getProjects);
router.get("/:id", authenticate, getProjectById);
router.delete("/:id", authenticate, deleteProject);


router.post("/:id/start", authenticate, startProject);
router.post("/:id/stop", authenticate, stopProject);

export default router;