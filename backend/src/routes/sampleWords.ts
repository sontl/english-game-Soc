import { Router } from "express";
import multer from "multer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import type { Word } from "@english-game/shared";

const SAMPLE_WORDS_PATH = path.resolve(process.cwd(), "../frontend/public/words.sample.json");
const UPLOADS_DIR = path.resolve(process.cwd(), "../frontend/public/uploads");

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        await mkdir(UPLOADS_DIR, { recursive: true });
        cb(null, UPLOADS_DIR);
      } catch (error) {
        cb(error as Error, UPLOADS_DIR);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      const safeExt = ext.length <= 8 ? ext : ext.slice(0, 8);
      cb(null, `${req.params.id}-${Date.now()}${safeExt}`);
    }
  })
});

type SampleWordInput = Omit<Word, "id" | "createdAt" | "updatedAt" | "imageUrl" | "audioUrl"> & {
  imageUrl?: string;
  audioUrl?: string;
};

const wordBodySchema = z.object({
  text: z.string().min(1),
  transcription: z.string().optional().default(""),
  exampleSentence: z.string().optional().default(""),
  level: z.number().int().min(1),
  term: z.number().int().min(1).optional(),
  week: z.number().int().min(1).optional(),
  pos: z.string(),
  aiGenerated: z.boolean().default(false),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional()
});

const readWords = async (): Promise<Word[]> => {
  const file = await readFile(SAMPLE_WORDS_PATH, "utf8");
  const parsed = JSON.parse(file);
  return parsed.words as Word[];
};

const writeWords = async (words: Word[]) => {
  await writeFile(
    SAMPLE_WORDS_PATH,
    JSON.stringify(
      {
        words
      },
      null,
      2
    ) + "\n"
  );
};

const router = Router();

router.get("/", async (_req, res) => {
  const words = await readWords();
  res.json({ words });
});

router.post("/", async (req, res) => {
  const body = wordBodySchema.parse(req.body);
  const words = await readWords();
  const now = new Date().toISOString();

  const newWord: Word = {
    id: uuid(),
    text: body.text,
    transcription: body.transcription ?? "",
    exampleSentence: body.exampleSentence ?? "",
    pos: body.pos as SampleWordInput["pos"],
    level: body.level,
    term: body.term,
    week: body.week,
    imageUrl: body.imageUrl,
    audioUrl: body.audioUrl,
    aiGenerated: body.aiGenerated,
    createdAt: now,
    updatedAt: now
  };

  await writeWords([...words, newWord]);
  res.status(201).json({ word: newWord });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const body = wordBodySchema.partial().parse(req.body);
  const words = await readWords();
  const index = words.findIndex((word) => word.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "NotFound" });
  }

  const updated: Word = {
    ...words[index],
    ...body,
    updatedAt: new Date().toISOString()
  };

  words[index] = updated;
  await writeWords(words);
  return res.json({ word: updated });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const words = await readWords();
  const filtered = words.filter((word) => word.id !== id);
  if (filtered.length === words.length) {
    return res.status(404).json({ error: "NotFound" });
  }

  await writeWords(filtered);
  return res.status(204).send();
});

router.post("/:id/image", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "FileMissing" });
  }

  const { id } = req.params;
  const words = await readWords();
  const index = words.findIndex((word) => word.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "NotFound" });
  }

  const relativeUrl = `/uploads/${req.file.filename}`;
  const updated: Word = {
    ...words[index],
    imageUrl: relativeUrl,
    updatedAt: new Date().toISOString()
  };

  words[index] = updated;
  await writeWords(words);
  return res.json({ word: updated });
});

router.post("/:id/audio", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "FileMissing" });
  }

  const { id } = req.params;
  const words = await readWords();
  const index = words.findIndex((word) => word.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "NotFound" });
  }

  const relativeUrl = `/uploads/${req.file.filename}`;
  const updated: Word = {
    ...words[index],
    audioUrl: relativeUrl,
    updatedAt: new Date().toISOString()
  };

  words[index] = updated;
  await writeWords(words);
  return res.json({ word: updated });
});

export default router;
