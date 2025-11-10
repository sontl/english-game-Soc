import { randomUUID } from "crypto";
import { z } from "zod";
import { getConnection } from "../db/knex";
import { TABLES } from "../db/schema";
import { sessionSchema } from "@english-game/shared";

const rowToSession = (row: Record<string, unknown>) => ({
  id: String(row.id),
  playerId: String(row.player_id),
  startedAt: new Date(String(row.started_at)).toISOString(),
  endedAt: row.ended_at ? new Date(String(row.ended_at)).toISOString() : undefined,
  score: row.score ? Number(row.score) : undefined,
  details: (row.details ?? {}) as Record<string, unknown>
});

export const createSession = async (payload: unknown) => {
  const parsed = sessionSchema
    .extend({ id: z.string().uuid().default(() => randomUUID()) })
    .parse(payload);

  const db = getConnection();
  const [inserted] = await db(TABLES.sessions)
    .insert({
      id: parsed.id,
      player_id: parsed.playerId,
      started_at: parsed.startedAt,
      ended_at: parsed.endedAt,
      score: parsed.score,
      details: parsed.details ?? {}
    })
    .returning("*");

  return rowToSession(inserted);
};

export const updateSession = async (id: string, payload: unknown) => {
  const parsed = sessionSchema.partial().parse(payload);
  const db = getConnection();
  const [updated] = await db(TABLES.sessions)
    .where({ id })
    .update({
      ended_at: parsed.endedAt,
      score: parsed.score,
      details: parsed.details ?? {}
    })
    .returning("*");

  return rowToSession(updated);
};
