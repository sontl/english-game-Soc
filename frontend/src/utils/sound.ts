import { Howl } from "howler";

const cache = new Map<string, Howl>();
let cachedVoice: SpeechSynthesisVoice | null = null;
let audioContext: AudioContext | null = null;

const speakText = (text: string) => {
  if (typeof window === "undefined" || !text.trim()) return;
  if (!("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  const selectVoice = () => {
    if (cachedVoice) return cachedVoice;
    const voices = synth.getVoices();
    const voice =
      voices.find((item) => item.lang.toLowerCase().startsWith("en-us")) ??
      voices.find((item) => item.lang.toLowerCase().startsWith("en")) ??
      voices[0];
    if (voice) {
      cachedVoice = voice;
    }
    return voice ?? null;
  };

  const utterance = new SpeechSynthesisUtterance(text.trim());
  const preferredVoice = selectVoice();
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  utterance.rate = 0.95;

  synth.cancel();
  synth.speak(utterance);
};

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  const Context =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return null;
  if (!audioContext) {
    audioContext = new Context();
    const unlock = () => {
      if (!audioContext) return;
      void audioContext.resume();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }
  void audioContext.resume();
  return audioContext;
};

const playBurst = (ctx: AudioContext, time: number) => {
  const duration = 0.22;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const envelope = Math.pow(1 - i / data.length, 3);
    const random = (Math.random() * 2 - 1) * (1 + Math.random() * 0.2);
    data[i] = random * envelope;
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.exponentialRampToValueAtTime(0.8, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  source.buffer = buffer;
  source.connect(gain).connect(ctx.destination);
  source.start(time);
};

const playTriad = (ctx: AudioContext, time: number) => {
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, time);
    const start = time + index * 0.05;
    const end = start + 0.7;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.4 / (index + 1), start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(end);
  });
};

export const playCelebration = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = ctx.currentTime + 0.05;
  playBurst(ctx, start);
  playBurst(ctx, start + 0.18);
  playBurst(ctx, start + 0.36);
  playTriad(ctx, start);
};

export const playSuccessTone = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime + 0.02;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.6, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.4);
};

export const playSound = (src?: string, fallbackText?: string) => {
  if (src) {
    if (!cache.has(src)) {
      cache.set(
        src,
        new Howl({
          src: [src],
          html5: true
        })
      );
    }

    const sound = cache.get(src);
    sound?.play();
    return;
  }

  if (fallbackText) {
    speakText(fallbackText);
  }
};
