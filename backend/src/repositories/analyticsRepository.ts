import { randomUUID } from "crypto";
import { getConnection } from "../db/knex";
import { TABLES } from "../db/schema";
import { analyticsEventSchema } from "@english-game/shared";

export const recordEvent = async (payload: unknown) => {
  const parsed = analyticsEventSchema.parse(payload);
  const eventId = parsed.eventId ?? randomUUID();
  const db = getConnection();
  await db(TABLES.analytics).insert({
    event_id: eventId,
    player_id: parsed.playerId,
    game_id: parsed.gameId,
    type: parsed.type,
    payload: parsed
  });
  return { ...parsed, eventId };
};

export const listEvents = async (playerId?: string) => {
  const db = getConnection();
  let query = db(TABLES.analytics).select("*");
  if (playerId) {
    query = query.where({ player_id: playerId });
  }
  query = query.orderBy("created_at", "desc").limit(500);
  return query;
};
