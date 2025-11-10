import { z } from "zod";
export declare const uuidSchema: z.ZodString;
export declare const wordSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    text: z.ZodString;
    pos: z.ZodString;
    transcription: z.ZodString;
    exampleSentence: z.ZodOptional<z.ZodString>;
    level: z.ZodNumber;
    imageUrl: z.ZodOptional<z.ZodString>;
    audioUrl: z.ZodOptional<z.ZodString>;
    aiGenerated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    text: string;
    pos: string;
    transcription: string;
    level: number;
    aiGenerated: boolean;
    id?: string | undefined;
    exampleSentence?: string | undefined;
    imageUrl?: string | undefined;
    audioUrl?: string | undefined;
}, {
    text: string;
    pos: string;
    transcription: string;
    level: number;
    id?: string | undefined;
    exampleSentence?: string | undefined;
    imageUrl?: string | undefined;
    audioUrl?: string | undefined;
    aiGenerated?: boolean | undefined;
}>;
export declare const playerSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id?: string | undefined;
    parentId?: string | undefined;
    avatarUrl?: string | undefined;
}, {
    name: string;
    id?: string | undefined;
    parentId?: string | undefined;
    avatarUrl?: string | undefined;
}>;
export declare const sessionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    playerId: z.ZodString;
    startedAt: z.ZodDate;
    endedAt: z.ZodOptional<z.ZodDate>;
    score: z.ZodOptional<z.ZodNumber>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    playerId: string;
    startedAt: Date;
    id?: string | undefined;
    endedAt?: Date | undefined;
    score?: number | undefined;
    details?: Record<string, unknown> | undefined;
}, {
    playerId: string;
    startedAt: Date;
    id?: string | undefined;
    endedAt?: Date | undefined;
    score?: number | undefined;
    details?: Record<string, unknown> | undefined;
}>;
export declare const progressSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    playerId: z.ZodString;
    wordId: z.ZodString;
    correctCount: z.ZodDefault<z.ZodNumber>;
    incorrectCount: z.ZodDefault<z.ZodNumber>;
    lastSeen: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    playerId: string;
    wordId: string;
    correctCount: number;
    incorrectCount: number;
    id?: string | undefined;
    lastSeen?: Date | undefined;
}, {
    playerId: string;
    wordId: string;
    id?: string | undefined;
    correctCount?: number | undefined;
    incorrectCount?: number | undefined;
    lastSeen?: Date | undefined;
}>;
export declare const analyticsEventSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"word_seen">;
    eventId: z.ZodOptional<z.ZodString>;
    playerId: z.ZodString;
    gameId: z.ZodString;
    timestamp: z.ZodString;
    wordId: z.ZodString;
    result: z.ZodEnum<["correct", "incorrect"]>;
}, "strip", z.ZodTypeAny, {
    type: "word_seen";
    playerId: string;
    wordId: string;
    gameId: string;
    timestamp: string;
    result: "correct" | "incorrect";
    eventId?: string | undefined;
}, {
    type: "word_seen";
    playerId: string;
    wordId: string;
    gameId: string;
    timestamp: string;
    result: "correct" | "incorrect";
    eventId?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"played_game">;
    eventId: z.ZodOptional<z.ZodString>;
    playerId: z.ZodString;
    gameId: z.ZodString;
    timestamp: z.ZodString;
    timeSpentMs: z.ZodNumber;
    score: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "played_game";
    playerId: string;
    gameId: string;
    timestamp: string;
    timeSpentMs: number;
    score?: number | undefined;
    eventId?: string | undefined;
}, {
    type: "played_game";
    playerId: string;
    gameId: string;
    timestamp: string;
    timeSpentMs: number;
    score?: number | undefined;
    eventId?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"replay_audio">;
    eventId: z.ZodOptional<z.ZodString>;
    playerId: z.ZodString;
    gameId: z.ZodString;
    timestamp: z.ZodString;
    wordId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "replay_audio";
    playerId: string;
    wordId: string;
    gameId: string;
    timestamp: string;
    eventId?: string | undefined;
}, {
    type: "replay_audio";
    playerId: string;
    wordId: string;
    gameId: string;
    timestamp: string;
    eventId?: string | undefined;
}>]>;
export declare const wordsPayloadSchema: z.ZodObject<{
    words: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
        pos: z.ZodString;
        transcription: z.ZodString;
        exampleSentence: z.ZodOptional<z.ZodString>;
        level: z.ZodNumber;
        imageUrl: z.ZodOptional<z.ZodString>;
        audioUrl: z.ZodOptional<z.ZodString>;
        aiGenerated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        pos: string;
        transcription: string;
        level: number;
        aiGenerated: boolean;
        id?: string | undefined;
        exampleSentence?: string | undefined;
        imageUrl?: string | undefined;
        audioUrl?: string | undefined;
    }, {
        text: string;
        pos: string;
        transcription: string;
        level: number;
        id?: string | undefined;
        exampleSentence?: string | undefined;
        imageUrl?: string | undefined;
        audioUrl?: string | undefined;
        aiGenerated?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    words: {
        text: string;
        pos: string;
        transcription: string;
        level: number;
        aiGenerated: boolean;
        id?: string | undefined;
        exampleSentence?: string | undefined;
        imageUrl?: string | undefined;
        audioUrl?: string | undefined;
    }[];
}, {
    words: {
        text: string;
        pos: string;
        transcription: string;
        level: number;
        id?: string | undefined;
        exampleSentence?: string | undefined;
        imageUrl?: string | undefined;
        audioUrl?: string | undefined;
        aiGenerated?: boolean | undefined;
    }[];
}>;
//# sourceMappingURL=schemas.d.ts.map