import { describe, expect, it } from "vitest";
import { scheduleWords } from "./adaptiveScheduler";

describe("scheduleWords", () => {
  it("prioritizes words with higher incorrect counts", () => {
    const schedule = scheduleWords({
      progress: [
        {
          id: "1",
          playerId: "p1",
          wordId: "w1",
          correctCount: 1,
          incorrectCount: 5,
          lastSeen: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: "2",
          playerId: "p1",
          wordId: "w2",
          correctCount: 4,
          incorrectCount: 0,
          lastSeen: new Date().toISOString()
        }
      ]
    });

    expect(schedule[0]?.wordId).toBe("w1");
  });
});
