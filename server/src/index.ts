import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/project.routes"
import fileRoutes from "./routes/file.routes";

import { pool } from "./config/db";
import passport from "./config/passport"

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware
app.use(express.json());

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




//user routes
app.use("/api/users", userRoutes);

//project routes
app.use("/api/projects", projectRoutes)

//file routes
app.use("/api/files", fileRoutes);



pool.query("SELECT 1")
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB ERROR:", err));

// Start server
app.listen(5000,'0.0.0.0', () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
