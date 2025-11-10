import { useMemo } from "react";
import { useParams } from "react-router-dom";
import FlashGarden from "../games/FlashGarden";
import LittleExplorer from "../games/LittleExplorer";
import SoundSafari from "../games/SoundSafari";
import RaceSpell from "../games/RaceSpell";
import StickerStory from "../games/StickerStory";

const GameHub = () => {
  const { gameId } = useParams();

  const component = useMemo(() => {
    switch (gameId) {
      case "flash-garden":
        return <FlashGarden />;
      case "little-explorer":
        return <LittleExplorer />;
      case "sound-safari":
        return <SoundSafari />;
      case "race-spell":
        return <RaceSpell />;
      case "sticker-story":
        return <StickerStory />;
      default:
        return <p>Game not found.</p>;
    }
  }, [gameId]);

  return <div className="mx-auto max-w-5xl rounded-3xl bg-white/90 p-5 shadow-xl">{component}</div>;
};

export default GameHub;
