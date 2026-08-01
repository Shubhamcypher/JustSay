import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as any;


    req.user = { userId: decoded.userId };

    next();
  } catch(e:any) {    
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}