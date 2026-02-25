import "dotenv/config";
// import { Pool } from "pg";
import express, { Request, Response } from "express";

import authRoutes from "./routes/auth.routes";
import { pool } from "./config/db";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Express server running",
  });
});

//auth routes
app.use("/auth", authRoutes);



pool.query("SELECT 1")
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB ERROR:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
