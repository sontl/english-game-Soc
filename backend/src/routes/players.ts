import { Router } from "express";
import { z } from "zod";
import { createPlayer, deletePlayer, listPlayers } from "../repositories/playersRepository";

const router = Router();

router.get("/", async (req, res) => {
  const parentId = req.query.parentId ? String(req.query.parentId) : undefined;
  const players = await listPlayers(parentId);
  res.json({ players });
});

router.post("/", async (req, res) => {
  const player = await createPlayer(req.body);
  res.status(201).json({ player });
});

router.patch("/:id", async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { updatePlayer } = await import("../repositories/playersRepository");
  const player = await updatePlayer(id, req.body);
  res.json({ player });
});

router.delete("/:id", async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  await deletePlayer(id);
  res.status(204).send();
});

export default router;
