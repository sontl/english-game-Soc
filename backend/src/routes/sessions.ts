import { Router } from "express";
import { z } from "zod";
import { createSession, updateSession } from "../repositories/sessionsRepository";

const router = Router();

router.post("/", async (req, res) => {
  const session = await createSession(req.body);
  res.status(201).json({ session });
});

router.patch("/:id", async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const session = await updateSession(id, req.body);
  res.json({ session });
});

export default router;
