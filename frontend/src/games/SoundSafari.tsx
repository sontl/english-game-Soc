import { useMemo, useState } from "react";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playSound } from "../utils/sound";

const SoundSafari = () => {
  const { words } = useAppStore();
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState("Tap the speaker to hear the word.");

  const rounds = useMemo(() => {
    const selection = shuffle(words).slice(0, 5);
    return selection.map((word) => {
      const options = shuffle(words.filter((candidate) => candidate.id !== word.id))
        .slice(0, 2)
        .concat(word);
      return {
        word,
        options: shuffle(options)
      };
    });
  }, [words]);

  const currentRound = rounds[currentIndex];

  const handleOption = (wordId: string) => {
    if (!currentRound) return;
    if (wordId === currentRound.word.id) {
      setScore((prev) => prev + 1);
      setMessage("Awesome listening! Next animal incoming.");
    } else {
      setMessage("Try again! Listen closely.");
    }
    setCurrentIndex((prev) => (prev + 1) % rounds.length);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Sound Safari</h2>
          <p className="text-sm text-slate-600">Listen and tap the matching picture.</p>
        </div>
        <span className="rounded-full bg-accent px-4 py-2 text-white">Score: {score}</span>
      </header>
      <div className="rounded-3xl bg-gradient-to-br from-secondary/20 via-white to-accent/20 p-6 text-center">
        <button
          type="button"
          onClick={() => playSound(currentRound?.word.audioUrl)}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl text-white shadow"
          aria-label="Play word audio"
        >
          🔊
        </button>
        <p className="mt-3 text-base font-semibold text-slate-700">{message}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {currentRound?.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleOption(option.id)}
            className="flex flex-col items-center gap-2 rounded-3xl bg-white p-4 shadow transition hover:-translate-y-1"
          >
            <div className="h-32 w-full rounded-2xl bg-secondary/40">
              {option.imageUrl ? (
                <img
                  src={option.imageUrl}
                  alt={option.text}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-lg font-semibold text-slate-600">
                  {option.text}
                </div>
              )}
            </div>
            <span className="text-lg font-bold text-primary">{option.text}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Timer placeholder: integrate optional friendly timer with progress ring for challenge.
      </p>
    </div>
  );
};

export default SoundSafari;
