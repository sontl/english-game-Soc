import { randomUUID } from "crypto";
import { loadEnv } from "../config/env";

const env = loadEnv();

interface GenerateImageInput {
  prompt: string;
  style?: string;
}

interface GenerateAudioInput {
  prompt: string;
  voice?: string;
}

export const generateImage = async ({ prompt, style }: GenerateImageInput) => {
  if (!env.CLOUD_FLARE_ACCOUNT_ID || !env.CLOUD_FLARE_API_TOKEN) {
    return {
      id: randomUUID(),
      prompt,
      style,
      url: `https://example.com/placeholder/${encodeURIComponent(prompt)}.png`,
      status: "stubbed"
    } as const;
  }

  // Placeholders for actual Cloudflare Images / AI integration.
  return {
    id: randomUUID(),
    prompt,
    style,
    url: "https://api.cloudflare.com/account/image-id",
    status: "pending"
  } as const;
};

export const generateAudio = async ({ prompt, voice }: GenerateAudioInput) => {
  if (!env.CLOUD_FLARE_API_TOKEN) {
    return {
      id: randomUUID(),
      prompt,
      voice,
      url: `https://example.com/placeholder/${encodeURIComponent(prompt)}.mp3`,
      status: "stubbed"
    } as const;
  }

  return {
    id: randomUUID(),
    prompt,
    voice,
    url: "https://api.cloudflare.com/account/audio-id",
    status: "pending"
  } as const;
};
