import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/project.routes"
import fileRoutes from "./routes/file.routes";

import { pool } from "./config/db";
import passport from "./config/passport"
import generateRoutes from "./routes/generate.routes";
import aiRoutes from "./routes/ai.routes";

const app = express();
app.set("trust proxy", true);
const PORT = Number(process.env.PORT) || 5000;


app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

//cookie parser
app.use(cookieParser());

// Middleware
app.use(express.json({limit: "10mb"}));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Express server running",
  });
});

//passport js
app.use(passport.initialize());

//auth routes
app.use("/api/auth", authRoutes);

//generate routes for testing
app.use("/api", generateRoutes);

//user routes
app.use("/api/users", userRoutes);

//project routes
app.use("/api/projects", projectRoutes)

//file routes
app.use("/api/files", fileRoutes);

//ai routes
app.use("/api/ai", aiRoutes);

pool.query("SELECT 1")
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB ERROR:", err));

// Start server
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
