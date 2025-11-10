import { Howl } from "howler";
import { useEffect, useRef } from "react";

export const useAudio = (src?: string) => {
  const soundRef = useRef<Howl>();

  useEffect(() => {
    if (!src) {
      soundRef.current = undefined;
      return;
    }

    soundRef.current = new Howl({ src: [src] });

    return () => {
      soundRef.current?.unload();
    };
  }, [src]);

  const play = () => {
    soundRef.current?.play();
  };

  return { play };
};
