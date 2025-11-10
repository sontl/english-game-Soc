import { randomUUID } from "crypto";
import type { Knex } from "knex";
import { z } from "zod";
import { TABLES } from "../db/schema";
import { getConnection } from "../db/knex";
import { mapWordRowToWord } from "../utils/mappers";
import { Word, wordSchema } from "@english-game/shared";

export const listWords = async (filters?: { week?: number }): Promise<Word[]> => {
  const db = getConnection();
  let query = db(TABLES.words).select("*");
  if (filters?.week !== undefined) {
    query = query.where({ level: filters.week });
  }
  query = query.orderBy("text");
  const rows = await query;
  return rows.map(mapWordRowToWord);
};

export const getWordById = async (id: string): Promise<Word | undefined> => {
  const db = getConnection();
  const row = await db(TABLES.words).where({ id }).first();
  return row ? mapWordRowToWord(row) : undefined;
};

export const createWord = async (payload: unknown): Promise<Word> => {
  const db = getConnection();
  const parsed = wordSchema.extend({
    id: z.string().uuid().default(() => randomUUID()),
    aiGenerated: z.boolean().default(false)
  }).parse(payload);

  const [inserted] = await db(TABLES.words)
    .insert({
      id: parsed.id,
      text: parsed.text,
      pos: parsed.pos,
      transcription: parsed.transcription,
      example_sentence: parsed.exampleSentence,
      level: parsed.level,
      image_url: parsed.imageUrl,
      audio_url: parsed.audioUrl,
      ai_generated: parsed.aiGenerated
    })
    .returning("*");

  return mapWordRowToWord(inserted);
};

export const upsertWordsBulk = async (
  payload: unknown,
  trx?: Knex.Transaction
): Promise<Word[]> => {
  const db = trx ?? getConnection();
  const { words } = z.object({ words: z.array(wordSchema.partial()) }).parse(payload);

  const sanitized = words.map((word) => ({
    id: word.id ?? randomUUID(),
    text: word.text ?? "",
    pos: word.pos ?? "noun",
    transcription: word.transcription ?? "",
    example_sentence: word.exampleSentence,
    level: word.level ?? 0,
    image_url: word.imageUrl,
    audio_url: word.audioUrl,
    ai_generated: word.aiGenerated ?? false
  }));

  const inserted = await db(TABLES.words)
    .insert(sanitized)
    .onConflict("id")
    .merge()
    .returning("*");

  return inserted.map(mapWordRowToWord);
};

export const deleteWord = async (id: string): Promise<number> => {
  const db = getConnection();
  return db(TABLES.words).where({ id }).del();
};
