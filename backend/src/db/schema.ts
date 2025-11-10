export const TABLES = {
  words: "words",
  players: "players",
  sessions: "sessions",
  progress: "progress",
  analytics: "analytics_events"
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
