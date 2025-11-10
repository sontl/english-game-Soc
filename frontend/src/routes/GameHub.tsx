import { useMemo } from "react";
import { useParams } from "react-router-dom";
import FlashGarden from "../games/FlashGarden";
import LittleExplorer from "../games/LittleExplorer";
import SoundSafari from "../games/SoundSafari";
import RaceSpell from "../games/RaceSpell";
import StickerStory from "../games/StickerStory";
import GiggleGooKitchen from "../games/GiggleGooKitchen";
import BubbleBounceBrigade from "../games/BubbleBounceBrigade";
import BalloonBandJam from "../games/BalloonBandJam";
import MysteryPicnicParade from "../games/MysteryPicnicParade";
import RocketRescueRelay from "../games/RocketRescueRelay";
import SkylineSpellDash from "../games/SkylineSpellDash";
import LuminousMazeEscape from "../games/LuminousMazeEscape";
import PrismTrailChase from "../games/PrismTrailChase";

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
      case "giggle-goo-kitchen":
        return <GiggleGooKitchen />;
      case "bubble-bounce-brigade":
        return <BubbleBounceBrigade />;
      case "balloon-band-jam":
        return <BalloonBandJam />;
      case "mystery-picnic-parade":
        return <MysteryPicnicParade />;
      case "rocket-rescue-relay":
        return <RocketRescueRelay />;
      case "skyline-spell-dash":
        return <SkylineSpellDash />;
      case "luminous-maze-escape":
        return <LuminousMazeEscape />;
      case "prism-trail-chase":
        return <PrismTrailChase />;
      default:
        return <p>Game not found.</p>;
    }
  }, [gameId]);

  return <div className="mx-auto max-w-5xl rounded-3xl bg-white/90 p-5 shadow-xl">{component}</div>;
};

export default GameHub;
