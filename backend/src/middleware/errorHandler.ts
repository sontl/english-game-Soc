import { Request, Response } from "express";
import { ZodError } from "zod";

export const createErrorHandler = () =>
  (err: unknown, _req: Request, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "ValidationError",
        details: err.flatten()
      });
    }

    if (err instanceof Error) {
      return res.status(500).json({
        error: err.name,
        message: err.message
      });
    }

    return res.status(500).json({
      error: "UnknownError"
    });
  };
