import { Howl } from "howler";

const cache = new Map<string, Howl>();

export const playSound = (src?: string) => {
  if (!src) return;
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
};
