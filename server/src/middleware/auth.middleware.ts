import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as any;

    req.user = { userId: decoded.userId };

    next();
  } catch(e:any) {
    console.log(e);
    
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}