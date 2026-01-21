import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Express server running 🚀",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});
