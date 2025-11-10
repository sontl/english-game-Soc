import { randomUUID } from "crypto";
import { z } from "zod";
import { getConnection } from "../db/knex";
import { TABLES } from "../db/schema";
import { playerSchema } from "@english-game/shared";

const dbRowToPlayer = (row: Record<string, unknown>) => ({
  id: String(row.id),
  name: String(row.name),
  parentId: String(row.parent_id),
  avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
  createdAt: new Date(String(row.created_at ?? new Date())).toISOString()
});

export const listPlayers = async (parentId?: string) => {
  const db = getConnection();
  let query = db(TABLES.players).select("*");
  if (parentId) {
    query = query.where({ parent_id: parentId });
  }
  const rows = await query.orderBy("created_at", "desc");
  return rows.map(dbRowToPlayer);
};

export const createPlayer = async (payload: unknown) => {
  const parsed = playerSchema
    .extend({ id: z.string().uuid().default(() => randomUUID()) })
    .parse(payload);

  const db = getConnection();
  const [inserted] = await db(TABLES.players)
    .insert({
      id: parsed.id,
      name: parsed.name,
      parent_id: parsed.parentId ?? randomUUID(),
      avatar_url: parsed.avatarUrl
    })
    .returning("*");

  return dbRowToPlayer(inserted);
};

export const updatePlayer = async (id: string, payload: unknown) => {
  const parsed = playerSchema.partial().parse(payload);

  const db = getConnection();
  const updateData: Record<string, unknown> = {};
  if (parsed.name !== undefined) updateData.name = parsed.name;
  if (parsed.avatarUrl !== undefined) updateData.avatar_url = parsed.avatarUrl;

  const [updated] = await db(TABLES.players)
    .where({ id })
    .update(updateData)
    .returning("*");

  if (!updated) {
    throw new Error("Player not found");
  }

  return dbRowToPlayer(updated);
};

export const deletePlayer = async (id: string) => {
  const db = getConnection();
  return db(TABLES.players).where({ id }).del();
};
