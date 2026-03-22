import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createFile, deleteFile, getFiles, updateFile } from "../controller/file.controller";

const router = Router();

router.post("/", authenticate, createFile);
router.get("/:projectId", authenticate, getFiles);
router.put("/:id", authenticate, updateFile);
router.delete("/:id", authenticate, deleteFile);
router.put("/:projectId", updateFile);

export default router;