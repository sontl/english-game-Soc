import { useMemo, useState } from "react";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playSound } from "../utils/sound";

interface CardData {
  id: string;
  type: "text" | "image" | "audio";
  wordId: string;
  label: string;
  mediaUrl?: string;
}

const FlashGarden = () => {
  const { words } = useAppStore();
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [status, setStatus] = useState("Tap two cards to find a match!");

  const cards = useMemo<CardData[]>(() => {
    const selection = shuffle(words).slice(0, 6);
    const generated: CardData[] = selection.flatMap((word) => {
      const base = word.text.charAt(0).toUpperCase() + word.text.slice(1);
      const items: CardData[] = [
        { id: `${word.id}-text`, type: "text", wordId: word.id, label: base }
      ];
      if (word.imageUrl) {
        items.push({
          id: `${word.id}-image`,
          type: "image",
          wordId: word.id,
          label: "",
          mediaUrl: word.imageUrl
        });
      }
      if (word.audioUrl) {
        items.push({
          id: `${word.id}-audio`,
          type: "audio",
          wordId: word.id,
          label: "🔊"
        });
      }
      if (items.length === 1) {
        items.push({
          id: `${word.id}-shadow`,
          type: "image",
          wordId: word.id,
          label: "",
          mediaUrl: `https://dummyimage.com/256x256/ffd180/333&text=${encodeURIComponent(base)}`
        });
      }
      return items.slice(0, 2);
    });
    return shuffle(generated);
  }, [words]);

  const checkMatch = (ids: string[]) => {
    if (ids.length < 2) return;
    const [first, second] = ids;
    const firstCard = cards.find((card) => card.id === first);
    const secondCard = cards.find((card) => card.id === second);
    if (!firstCard || !secondCard) return;

    if (firstCard.wordId === secondCard.wordId && firstCard.id !== secondCard.id) {
      setMatchedIds((prev) => [...prev, firstCard.wordId]);
      setStatus("Great job! Flower blooming!");
      setTimeout(() => setFlippedIds([]), 800);
    } else {
      setStatus("Oops! Try another pair.");
      setTimeout(() => setFlippedIds([]), 800);
    }
  };

  const handleFlip = (card: CardData) => {
    if (matchedIds.includes(card.wordId) || flippedIds.includes(card.id)) {
      if (card.type === "audio" && card.mediaUrl) {
        playSound(card.mediaUrl);
      }
      return;
    }

    if (card.type === "audio" && card.mediaUrl) {
      playSound(card.mediaUrl);
    }

    const next = [...flippedIds, card.id];
    setFlippedIds(next);
    if (next.length === 2) {
      checkMatch(next);
    }
  };

  const completion = matchedIds.length === cards.length / 2;

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Flash Garden</h2>
          <p className="text-sm text-slate-600">Match pairs to plant flowers.</p>
        </div>
        <span className="rounded-full bg-success px-4 py-2 text-sm font-semibold">
          Matches: {matchedIds.length} / {cards.length / 2}
        </span>
      </header>
      <p className="mb-3 text-base font-semibold text-slate-700">{status}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {cards.map((card) => {
          const flipped = flippedIds.includes(card.id) || matchedIds.includes(card.wordId);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(card)}
              className={`aspect-square w-full rounded-3xl border-4 border-transparent p-3 text-lg font-bold shadow-inner transition-transform ${
                flipped ? "bg-secondary/80" : "bg-white"
              }`}
            >
              {flipped ? (
                card.type === "image" ? (
                  <img
                    src={card.mediaUrl}
                    alt="Word visual"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-2xl">{card.label}</span>
                )
              ) : (
                <span className="text-3xl">🌱</span>
              )}
            </button>
          );
        })}
      </div>
      {completion && <p className="mt-4 text-lg font-bold text-success">Garden is blooming!</p>}
    </div>
  );
};

export default FlashGarden;
