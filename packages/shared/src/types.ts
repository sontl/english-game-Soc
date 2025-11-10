export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "particle"
  | "pronoun"
  | "determiner";

export interface Word {
  id: string;
  text: string;
  pos: PartOfSpeech;
  transcription: string;
  exampleSentence?: string;
  level: number;
  term?: number;
  week?: number;
  imageUrl?: string;
  audioUrl?: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  parentId: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ProgressEntry {
  id: string;
  playerId: string;
  wordId: string;
  correctCount: number;
  incorrectCount: number;
  lastSeen: string;
}

export interface PracticeSession {
  id: string;
  playerId: string;
  startedAt: string;
  endedAt?: string;
  score?: number;
  details?: Record<string, unknown>;
}

export type GameId =
  | "flash-garden"
  | "little-explorer"
  | "sound-safari"
  | "race-spell"
  | "sticker-story"
  | "giggle-goo-kitchen";

export interface AnalyticsEventBase {
  eventId: string;
  playerId: string;
  gameId: GameId;
  timestamp: string;
}

export interface WordSeenEvent extends AnalyticsEventBase {
  type: "word_seen";
  wordId: string;
  result: "correct" | "incorrect";
}

export interface PlayedGameEvent extends AnalyticsEventBase {
  type: "played_game";
  timeSpentMs: number;
  score?: number;
}

export interface ReplayAudioEvent extends AnalyticsEventBase {
  type: "replay_audio";
  wordId: string;
}

export type AnalyticsEvent =
  | WordSeenEvent
  | PlayedGameEvent
  | ReplayAudioEvent;
