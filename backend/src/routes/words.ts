import { Router } from "express";
import { z } from "zod";
import {
  createWord,
  deleteWord,
  getWordById,
  listWords,
  upsertWordsBulk
} from "../repositories/wordsRepository";

const router = Router();

router.get("/", async (req, res) => {
  const week = req.query.week ? Number(req.query.week) : undefined;
  const words = await listWords({ week });
  res.json({ words });
});

router.get("/:id", async (req, res) => {
  const word = await getWordById(req.params.id);
  if (!word) {
    return res.status(404).json({ error: "NotFound" });
  }
  return res.json({ word });
});

router.post("/", async (req, res) => {
  const word = await createWord(req.body);
  res.status(201).json({ word });
});

router.post("/bulk", async (req, res) => {
  const words = await upsertWordsBulk(req.body);
  res.status(201).json({ words });
});

router.delete("/:id", async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  await deleteWord(id);
  res.status(204).send();
});

export default router;
