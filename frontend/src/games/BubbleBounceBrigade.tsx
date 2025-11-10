import { useEffect, useMemo, useState } from "react";
import type { Word } from "@english-game/shared";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playCelebration, playSound, playSuccessTone } from "../utils/sound";

interface BubbleOption {
  id: string;
  letter: string;
  top: number;
  left: number;
}

interface RoundData {
  id: string;
  display: string[];
  missingIndex: number;
  missingLetter: string;
  options: BubbleOption[];
  prettyWord: string;
  audioUrl?: string;
  clue: string;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const sanitize = (value: string) => value.replace(/[^a-z]/gi, "").toUpperCase();

const createOptions = (target: string, missing: string) => {
  const distractorCount = 5;
  const letters: string[] = [];
  while (letters.length < distractorCount) {
    const pick = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (pick !== missing) {
      letters.push(pick);
    }
  }
  const pool = shuffle([missing, ...letters.slice(0, 4)]);
  return pool.map((letter, index) => ({
    id: `${target}-${letter}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    letter,
    top: 12 + Math.random() * 60,
    left: 8 + Math.random() * 70
  } satisfies BubbleOption));
};

const buildRounds = (words: Word[]): RoundData[] => {
  const candidates = words.filter((word) => sanitize(word.text).length >= 3);
  const selected = shuffle(candidates).slice(0, 6);
  return selected.map((word) => {
    const clean = sanitize(word.text);
    const minIndex = clean.length > 4 ? 1 : 0;
    const maxIndex = clean.length > 4 ? clean.length - 2 : clean.length - 1;
    const missingIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
    const letters = clean.split("");
    const missingLetter = letters[missingIndex];
    const display = letters.map((letter, index) => (index === missingIndex ? "_" : letter));
    const clue = word.exampleSentence
      ? word.exampleSentence.replace(new RegExp(word.text, "i"), "_____")
      : `Bounce the letter to finish ${word.text}!`;
    return {
      id: word.id,
      display,
      missingIndex,
      missingLetter,
      options: createOptions(clean, missingLetter),
      prettyWord: word.text,
      audioUrl: word.audioUrl,
      clue
    } satisfies RoundData;
  });
};

const BubbleBounceBrigade = () => {
  const { words } = useAppStore();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [status, setStatus] = useState("Pop the right bubble to fill the blank!");
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [filledLetters, setFilledLetters] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);

  const currentRound = rounds[roundIndex];
  const finished = rounds.length > 0 && roundIndex >= rounds.length;

  useEffect(() => {
    if (finished) {
      setStatus("Bubble brigade complete! The word garden sparkles.");
      playCelebration();
      return;
    }
    if (!currentRound) {
      setStatus("Add more words to launch the bubble brigade.");
      return;
    }
    setStatus("Pop the right bubble to fill the blank!");
    setPoppedId(null);
    setWrongId(null);
    setFilledLetters(Array(currentRound.display.length).fill(""));
  }, [currentRound, finished]);

  const handleHearClue = () => {
    if (!currentRound) return;
    playSound(currentRound.audioUrl, currentRound.prettyWord);
    setStatus(`Listen closely: ${currentRound.prettyWord}!`);
  };

  const handleOption = (option: BubbleOption) => {
    if (!currentRound || finished) return;
    if (poppedId) return;

    if (option.letter === currentRound.missingLetter) {
      playSuccessTone();
      setPoppedId(option.id);
      setVisited((prev) => [...prev, currentRound.prettyWord]);
      setFilledLetters((prev) => {
        const next = [...prev];
        next[currentRound.missingIndex] = option.letter;
        return next;
      });
      setStatus(`Bounce brilliant! ${currentRound.prettyWord} is complete.`);
      setTimeout(() => {
        setRoundIndex((prev) => prev + 1);
      }, 900);
      return;
    }

    setWrongId(option.id);
    setStatus(`Uh-oh! ${option.letter} splashed the wrong pond.`);
    setTimeout(() => {
      setWrongId(null);
      setStatus("Try another bubble!");
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Bubble Bounce Brigade</h2>
          <p className="text-sm text-slate-600">
            Fill in the floating blanks before the bubbles drift away.
          </p>
        </div>
        {currentRound && (
          <span className="rounded-full bg-accent/20 px-4 py-2 text-sm font-semibold text-slate-700">
            Word {roundIndex + 1} / {rounds.length}
          </span>
        )}
      </header>

      <section className="rounded-3xl bg-gradient-to-tr from-sky-100 via-white to-indigo-100 p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-semibold text-slate-800">{status}</p>
          {currentRound && (
            <button
              type="button"
              onClick={handleHearClue}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow"
            >
              Hear word
            </button>
          )}
        </div>
        {currentRound && (
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-primary">
              {currentRound.display.map((letter, index) => (
                <span
                  key={`${currentRound.id}-slot-${index}`}
                  className={`flex h-14 w-12 items-center justify-center rounded-2xl border-4 text-center ${
                    filledLetters[index]
                      ? "border-success bg-success/10 text-success"
                      : letter === "_"
                        ? "border-dashed border-primary bg-white text-slate-400"
                        : "border-transparent bg-white text-primary"
                  }`}
                >
                  {filledLetters[index] || (letter === "_" ? "?" : letter)}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-600">{currentRound.clue}</p>
          </div>
        )}
      </section>

      {finished && (
        <section className="rounded-3xl bg-success/20 p-6 text-lg font-bold text-success shadow">
          The brigade is complete! You popped every bubble spelled treat.
        </section>
      )}

      {!finished && currentRound && (
        <section className="relative h-[360px] overflow-hidden rounded-3xl bg-white/90 p-4 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.35),_transparent_70%)]" />
          <div className="relative h-full w-full">
            {currentRound.options.map((option) => {
              const isPopped = option.id === poppedId;
              const isWrong = option.id === wrongId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOption(option)}
                  className={`absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 text-xl font-extrabold shadow transition-all duration-300 ${
                    isPopped
                      ? "border-success bg-success/30 text-success scale-110"
                      : isWrong
                        ? "border-rose-400 bg-rose-200 text-rose-600 scale-95"
                        : "border-primary/40 bg-primary/20 text-primary hover:scale-110"
                  } motion-safe:animate-bounce`}
                  style={{ top: `${option.top}%`, left: `${option.left}%` }}
                  disabled={Boolean(poppedId)}
                >
                  {option.letter}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {visited.length > 0 && (
        <section className="rounded-3xl bg-white/80 p-5 shadow">
          <h3 className="text-lg font-bold text-slate-800">Rescued words</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {visited.map((item) => (
              <span
                key={item}
                className="rounded-full bg-gradient-to-r from-primary/10 via-white to-secondary/10 px-4 py-1 text-sm font-semibold text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BubbleBounceBrigade;
