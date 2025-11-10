import { Word } from "@english-game/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

const getAuthHeaders = (): Record<string, string> => {
  const token = import.meta.env.VITE_API_AUTH_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchWords = async (week?: number): Promise<Word[]> => {
  const url = new URL(`${API_BASE}/words`);
  if (week !== undefined) {
    url.searchParams.set("week", String(week));
  }

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        ...getAuthHeaders()
      }
    });
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
    const words = data.words as Word[];
    if (week === undefined) {
      return words;
    }

    return words.filter((word) => {
      if (word.term !== undefined && word.week !== undefined) {
        return word.term * 100 + word.week === week;
      }
      return word.level === week;
    });
  }
};

export const createWord = async (payload: Partial<Word>) => {
  const response = await fetch(`${API_BASE}/words`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ prompt, voice })
  });
  if (!response.ok) {
    throw new Error("Failed to generate audio");
  }
  return response.json();
};

export const fetchSampleWords = async (): Promise<Word[]> => {
  const response = await fetch(`${API_BASE}/sample-words`, {
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!response.ok) {
    throw new Error("Failed to load sample words");
  }

  const data = await response.json();
  return data.words as Word[];
};

export const createSampleWord = async (payload: Partial<Word>) => {
  const response = await fetch(`${API_BASE}/sample-words`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create sample word");
  }

  const data = await response.json();
  return data.word as Word;
};

export const updateSampleWord = async (id: string, payload: Partial<Word>) => {
  const response = await fetch(`${API_BASE}/sample-words/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to update sample word");
  }

  const data = await response.json();
  return data.word as Word;
};

export const deleteSampleWord = async (id: string) => {
  const response = await fetch(`${API_BASE}/sample-words/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!response.ok) {
    throw new Error("Failed to delete sample word");
  }
};

export const uploadSampleWordMedia = async (
  id: string,
  file: File,
  type: "image" | "audio"
): Promise<Word> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/sample-words/${id}/${type}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders()
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${type}`);
  }

  const data = await response.json();
  return data.word as Word;
};

export interface PlayerProfile {
  id: string;
  name: string;
  parentId: string;
  avatarUrl?: string;
  createdAt: string;
}

export const fetchPlayers = async (parentId?: string): Promise<PlayerProfile[]> => {
  const url = new URL(`${API_BASE}/players`);
  if (parentId) {
    url.searchParams.set("parentId", parentId);
  }

  const response = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch players");
  }

  const data = await response.json();
  return data.players as PlayerProfile[];
};

export const createPlayer = async (payload: {
  name: string;
  parentId?: string;
  avatarUrl?: string;
}): Promise<PlayerProfile> => {
  const response = await fetch(`${API_BASE}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create player");
  }

  const data = await response.json();
  return data.player as PlayerProfile;
};

export const updatePlayer = async (
  id: string,
  payload: { name?: string; avatarUrl?: string }
): Promise<PlayerProfile> => {
  const response = await fetch(`${API_BASE}/players/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to update player");
  }

  const data = await response.json();
  return data.player as PlayerProfile;
};

export const deletePlayer = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/players/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!response.ok) {
    throw new Error("Failed to delete player");
  }
};
