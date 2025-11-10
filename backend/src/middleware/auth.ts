import { Request, Response, NextFunction } from "express";
import { loadEnv } from "../config/env";

const env = loadEnv();

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!env.PARENT_AUTH_SECRET) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer", "").trim();
  if (token !== env.PARENT_AUTH_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return next();
};
