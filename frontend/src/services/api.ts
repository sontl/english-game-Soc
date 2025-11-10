import { Word } from "@english-game/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const fetchWords = async (week?: number): Promise<Word[]> => {
  const url = new URL(`${API_BASE}/words`);
  if (week !== undefined) {
    url.searchParams.set("week", String(week));
  }

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch words");
    }
    const data = await response.json();
    return data.words as Word[];
  } catch (error) {
    console.warn("Falling back to sample words.json", error);
    const response = await fetch("/words.sample.json");
    if (!response.ok) {
      throw new Error("Unable to fetch fallback words");
    }
    const data = await response.json();
    return data.words as Word[];
  }
};

export const createWord = async (payload: Partial<Word>) => {
  const response = await fetch(`${API_BASE}/words`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create word");
  }

  return response.json();
};

export const requestImage = async (prompt: string, style?: string) => {
  const response = await fetch(`${API_BASE}/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style })
  });
  if (!response.ok) {
    throw new Error("Failed to generate image");
  }
  return response.json();
};

export const requestAudio = async (prompt: string, voice?: string) => {
  const response = await fetch(`${API_BASE}/generate-audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, voice })
  });
  if (!response.ok) {
    throw new Error("Failed to generate audio");
  }
  return response.json();
};
