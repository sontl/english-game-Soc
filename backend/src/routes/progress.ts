import { Router } from "express";
import { z } from "zod";
import { getProgressForPlayer, upsertProgress } from "../repositories/progressRepository";
import { scheduleWords } from "../services/adaptiveScheduler";

const router = Router();

router.get("/:playerId", async (req, res) => {
  const playerId = z.string().uuid().parse(req.params.playerId);
  const progress = await getProgressForPlayer(playerId);
  res.json({ progress });
});

router.patch("/", async (req, res) => {
  const progress = await upsertProgress(req.body);
  res.json({ progress });
});

router.post("/schedule", async (req, res) => {
  const schema = z.object({
    playerId: z.string().uuid(),
    limit: z.number().int().positive().max(20).optional()
  });
  const payload = schema.parse(req.body);
  const progress = await getProgressForPlayer(payload.playerId);
  const schedule = scheduleWords({ progress, limit: payload.limit });
  res.json({ schedule });
});

export default router;
