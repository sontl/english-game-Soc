import { describe, expect, it } from "vitest";
import { wordSchema } from "./schemas";

describe("wordSchema", () => {
  it("validates minimal payload", () => {
    const result = wordSchema.parse({
      text: "apple",
      pos: "noun",
      transcription: "ˈæpəl",
      level: 1
    });

    expect(result.text).toBe("apple");
  });
});
