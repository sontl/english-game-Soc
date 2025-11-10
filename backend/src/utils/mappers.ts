import { Word } from "@english-game/shared";

export const mapWordRowToWord = (row: Record<string, unknown>): Word => {
  return {
    id: String(row.id),
    text: String(row.text),
    pos: String(row.pos) as Word["pos"],
    transcription: String(row.transcription),
    exampleSentence: row.example_sentence ? String(row.example_sentence) : undefined,
    level: Number(row.level ?? 0),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    audioUrl: row.audio_url ? String(row.audio_url) : undefined,
    aiGenerated: Boolean(row.ai_generated),
    createdAt: new Date(String(row.created_at ?? new Date())).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? new Date())).toISOString()
  };
};
