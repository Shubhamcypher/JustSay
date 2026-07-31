import express from "express";
import { describeAppController, summarizeChangesController } from "../controller/ai.controller";

const router = express.Router();

router.get("/test", (req, res) => {
    res.send("AI Route Working");
  });

router.post("/describe", describeAppController);
router.post("/summarize", summarizeChangesController);

export default router;