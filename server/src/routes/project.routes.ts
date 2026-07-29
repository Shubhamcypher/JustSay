import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createProject, deleteProject, getProjectById, getProjectFiles, getProjects, startProject, stopProject, screenshotProject, saveProject } from "../controller/project.controller";

const router = Router();


router.post("/", authenticate, createProject);
router.get("/", authenticate, getProjects);
router.post("/save", authenticate, saveProject);
router.get("/:id", authenticate, getProjectById);
router.delete("/:id", authenticate, deleteProject);


router.post("/:id/start", authenticate, startProject);
router.post("/:id/stop", authenticate, stopProject);

router.get("/:id/files", authenticate, getProjectFiles);

router.post("/:id/screenshot", authenticate, screenshotProject);


export default router;