import { z } from "zod";
export const uuidSchema = z.string().uuid();
export const wordSchema = z.object({
    id: uuidSchema.optional(),
    text: z.string().min(1),
    pos: z.string().min(1),
    transcription: z.string().min(1),
    exampleSentence: z.string().optional(),
    level: z.number().int().nonnegative(),
    imageUrl: z.string().url().optional(),
    audioUrl: z.string().url().optional(),
    aiGenerated: z.boolean().optional().default(false)
});
export const playerSchema = z.object({
    id: uuidSchema.optional(),
    name: z.string().min(1),
    parentId: uuidSchema.optional(),
    avatarUrl: z.string().url().optional()
});
export const sessionSchema = z.object({
    id: uuidSchema.optional(),
    playerId: uuidSchema,
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date().optional(),
    score: z.number().optional(),
    details: z.record(z.unknown()).optional()
});
export const progressSchema = z.object({
    id: uuidSchema.optional(),
    playerId: uuidSchema,
    wordId: uuidSchema,
    correctCount: z.number().int().nonnegative().default(0),
    incorrectCount: z.number().int().nonnegative().default(0),
    lastSeen: z.coerce.date().optional()
});
export const analyticsEventSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("word_seen"),
        eventId: uuidSchema.optional(),
        playerId: uuidSchema,
        gameId: z.string(),
        timestamp: z.string(),
        wordId: uuidSchema,
        result: z.enum(["correct", "incorrect"])
    }),
    z.object({
        type: z.literal("played_game"),
        eventId: uuidSchema.optional(),
        playerId: uuidSchema,
        gameId: z.string(),
        timestamp: z.string(),
        timeSpentMs: z.number().nonnegative(),
        score: z.number().optional()
    }),
    z.object({
        type: z.literal("replay_audio"),
        eventId: uuidSchema.optional(),
        playerId: uuidSchema,
        gameId: z.string(),
        timestamp: z.string(),
        wordId: uuidSchema
    })
]);
export const wordsPayloadSchema = z.object({
    words: z.array(wordSchema)
});
//# sourceMappingURL=schemas.js.map