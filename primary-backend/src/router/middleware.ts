import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

// Extend the Express Request interface to include the id property
declare global {
  namespace Express {
    interface Request {
      id?: number;
    }
  }
}

export function authMiddleware (req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization as unknown as string;
  try {
    const payload = jwt.verify(token, JWT_PASSWORD) as { id: number };
    req.id = payload.id
    next();
  } catch (err) {
    res.status(403).json({
      message: "You are not logged in"
    });
    return
  }
}