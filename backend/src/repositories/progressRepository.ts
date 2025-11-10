import { randomUUID } from "crypto";
import { z } from "zod";
import { getConnection } from "../db/knex";
import { TABLES } from "../db/schema";
import { ProgressEntry, progressSchema } from "@english-game/shared";

const rowToProgress = (row: Record<string, unknown>): ProgressEntry => ({
  id: String(row.id),
  playerId: String(row.player_id),
  wordId: String(row.word_id),
  correctCount: Number(row.correct_count ?? 0),
  incorrectCount: Number(row.incorrect_count ?? 0),
  lastSeen: row.last_seen
    ? new Date(String(row.last_seen)).toISOString()
    : new Date().toISOString()
});

export const getProgressForPlayer = async (playerId: string) => {
  const db = getConnection();
  const rows = await db(TABLES.progress).where({ player_id: playerId });
  return rows.map(rowToProgress);
};

export const upsertProgress = async (payload: unknown): Promise<ProgressEntry> => {
  const db = getConnection();
  const parsed = progressSchema
    .extend({ id: z.string().uuid().default(() => randomUUID()) })
    .parse(payload);

  const [result] = await db(TABLES.progress)
    .insert({
      id: parsed.id,
      player_id: parsed.playerId,
      word_id: parsed.wordId,
      correct_count: parsed.correctCount,
      incorrect_count: parsed.incorrectCount,
      last_seen: parsed.lastSeen ?? new Date().toISOString()
    })
    .onConflict(["player_id", "word_id"])
    .merge({
      correct_count: parsed.correctCount,
      incorrect_count: parsed.incorrectCount,
      last_seen: parsed.lastSeen ?? new Date().toISOString()
    })
    .returning("*");

  return rowToProgress(result);
};
