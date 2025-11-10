import { Router } from "express";
import { recordEvent, listEvents } from "../repositories/analyticsRepository";

const router = Router();

router.get("/", async (req, res) => {
  const events = await listEvents(req.query.playerId ? String(req.query.playerId) : undefined);
  res.json({ events });
});

router.post("/", async (req, res) => {
  const event = await recordEvent(req.body);
  res.status(201).json({ event });
});

export default router;
