import { Router } from "express";
import { z } from "zod";
import { generateAudio, generateImage } from "../services/aiService";

const router = Router();

router.post("/generate-image", async (req, res) => {
  const schema = z.object({
    prompt: z.string().min(1),
    style: z.string().optional()
  });

  const payload = schema.parse(req.body);
  const result = await generateImage(payload);
  res.json({ image: result });
});

router.post("/generate-audio", async (req, res) => {
  const schema = z.object({
    prompt: z.string().min(1),
    voice: z.string().optional()
  });

  const payload = schema.parse(req.body);
  const result = await generateAudio(payload);
  res.json({ audio: result });
});

export default router;
