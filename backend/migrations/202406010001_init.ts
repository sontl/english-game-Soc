import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasWords = await knex.schema.hasTable("words");
  if (!hasWords) {
    await knex.schema.createTable("words", (table) => {
      table.uuid("id").primary();
      table.string("text").notNullable();
      table.string("pos").notNullable();
      table.string("transcription").notNullable();
      table.text("example_sentence");
      table.smallint("level").defaultTo(0);
      table.text("image_url");
      table.text("audio_url");
      table.boolean("ai_generated").defaultTo(false);
      table.timestamps(true, true);
    });
  }

  const hasPlayers = await knex.schema.hasTable("players");
  if (!hasPlayers) {
    await knex.schema.createTable("players", (table) => {
      table.uuid("id").primary();
      table.string("name").notNullable();
      table.uuid("parent_id").notNullable();
      table.text("avatar_url");
      table.timestamps(true, true);
    });
  }

  const hasSessions = await knex.schema.hasTable("sessions");
  if (!hasSessions) {
    await knex.schema.createTable("sessions", (table) => {
      table.uuid("id").primary();
      table.uuid("player_id").references("id").inTable("players");
      table.timestamp("started_at").notNullable();
      table.timestamp("ended_at");
      table.integer("score");
      table.jsonb("details");
      table.timestamps(true, true);
    });
  }

  const hasProgress = await knex.schema.hasTable("progress");
  if (!hasProgress) {
    await knex.schema.createTable("progress", (table) => {
      table.uuid("id").primary();
      table.uuid("player_id").references("id").inTable("players").onDelete("CASCADE");
      table.uuid("word_id").references("id").inTable("words").onDelete("CASCADE");
      table.integer("correct_count").defaultTo(0);
      table.integer("incorrect_count").defaultTo(0);
      table.timestamp("last_seen");
      table.timestamps(true, true);
      table.unique(["player_id", "word_id"]);
    });
  }

  const hasAnalytics = await knex.schema.hasTable("analytics_events");
  if (!hasAnalytics) {
    await knex.schema.createTable("analytics_events", (table) => {
      table.uuid("event_id").primary();
      table.uuid("player_id").notNullable();
      table.string("game_id").notNullable();
      table.string("type").notNullable();
      table.jsonb("payload").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("analytics_events");
  await knex.schema.dropTableIfExists("progress");
  await knex.schema.dropTableIfExists("sessions");
  await knex.schema.dropTableIfExists("players");
  await knex.schema.dropTableIfExists("words");
}
