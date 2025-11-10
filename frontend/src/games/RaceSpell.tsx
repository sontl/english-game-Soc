import { useMemo, useState } from "react";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";

const RaceSpell = () => {
  const { words } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [trail, setTrail] = useState<string[]>([]);
  const [message, setMessage] = useState("Tap letters in order to spell the word!");

  const targetWord = useMemo(() => {
    const word = shuffle(words).find((item) => item.text.length >= 3) ?? {
      id: "fallback",
      text: "apple"
    };
    return word.text.toUpperCase();
  }, [words]);

  const letters = useMemo(() => {
    const extras = targetWord
      .split("")
      .map((char) => String.fromCharCode(((char.charCodeAt(0) - 65 + 5) % 26) + 65));
    return shuffle([...targetWord.split(""), ...extras]);
  }, [targetWord]);

  const handleLetter = (letter: string) => {
    const expected = targetWord[progress];
    if (letter === expected) {
      setProgress((prev) => prev + 1);
      setTrail((prev) => [...prev, letter]);
      setMessage("Great! Keep racing.");
    } else {
      setMessage("That letter bounces away! Try again.");
    }
  };

  const completed = progress >= targetWord.length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Race & Spell</h2>
          <p className="text-sm text-slate-600">Collect letters in order to reach the finish.</p>
        </div>
        <span className="rounded-full bg-primary px-4 py-2 text-white">
          Word: {targetWord}
        </span>
      </header>
      <div className="relative h-40 overflow-hidden rounded-3xl bg-gradient-to-r from-accent/20 via-white to-success/30 p-4">
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <span className="text-4xl">🏁</span>
          <span className="text-4xl">🚗</span>
        </div>
        <div
          className="absolute bottom-6 left-6 h-4 rounded-full bg-white/60"
          style={{
            width: "calc(100% - 3rem)",
            border: "2px solid #8C9EFF"
          }}
        >
          <div
            className="h-full rounded-full bg-success"
            style={{ width: `${(progress / targetWord.length) * 100}%` }}
          />
        </div>
        <p className="absolute bottom-2 left-6 text-sm font-semibold text-slate-700">{message}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {letters.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            onClick={() => handleLetter(letter)}
            className="h-16 w-16 rounded-2xl bg-white text-2xl font-bold text-primary shadow transition hover:-translate-y-1"
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white/80 p-4 text-lg font-semibold text-slate-700">
        <span className="mr-2 text-primary">Collected:</span>
        {trail.join(" ")}
      </div>
      {completed && (
        <div className="rounded-2xl bg-success/20 p-4 text-xl font-bold text-success">
          You spelled {targetWord}! Character celebrates with fireworks.
        </div>
      )}
    </div>
  );
};

export default RaceSpell;
