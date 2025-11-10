import { useEffect, useMemo, useState } from "react";
import type { Word } from "@english-game/shared";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playCelebration, playSound, playSuccessTone } from "../utils/sound";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const START_LINES = [
  "Chef Giggle is craving a {word} smoothie!",
  "Blend-a-bot is chanting for {word}! Grab each letter in order.",
  "Gloopster the monster wants a {word} slush with extra sprinkles!"
];

const SUCCESS_LINES = [
  "Slurp! {word} goo unlocked!",
  "Yum! The blender burped a {word} shake!",
  "Fizz-buzz! {word} just turned neon and giggly!"
];

const OOPS_LINES = [
  "Giggle goo spit out {letter}! Try again.",
  "The blender made a raspberry noise at {letter}!",
  "Whoops! {letter} was a pickle, not a giggle."
];

interface LetterTile {
  id: string;
  letter: string;
}

interface RoundData {
  id: string;
  target: string;
  pretty: string;
  spoken: string;
  pool: LetterTile[];
  audioUrl?: string;
  imageUrl?: string;
}

const sanitizeWord = (value: string) => value.replace(/[^a-z]/gi, "").toUpperCase();

const toTitleCase = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const pickLine = (lines: string[], replacements: Record<string, string>) => {
  if (lines.length === 0) return "";
  const chosen = lines[Math.floor(Math.random() * lines.length)];
  return Object.entries(replacements).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, "g"), value),
    chosen
  );
};

const buildRounds = (words: Word[]): RoundData[] => {
  const prepared = words
    .map((word) => {
      const cleaned = sanitizeWord(word.text);
      if (!cleaned) return null;
      const letters = cleaned.split("");
      const distractorCount = Math.min(6, Math.max(3, Math.ceil(letters.length / 1.5)));
      const distractors: string[] = [];
      while (distractors.length < distractorCount) {
        const pick = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        distractors.push(pick);
      }
      const poolLetters = shuffle([...letters, ...distractors]);
      const pool: LetterTile[] = poolLetters.map((letter, index) => ({
        id: `${word.id}-${letter}-${index}`,
        letter
      }));
      return {
        id: word.id,
        target: cleaned,
        pretty: toTitleCase(word.text),
        spoken: word.text,
        pool,
        audioUrl: word.audioUrl,
        imageUrl: word.imageUrl
      } satisfies RoundData;
    })
    .filter((value): value is RoundData => Boolean(value));

  return shuffle(prepared).slice(0, Math.min(5, prepared.length));
};

const GiggleGooKitchen = () => {
  const { words } = useAppStore();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [disabled, setDisabled] = useState<Set<string>>(new Set());
  const [roundMistakes, setRoundMistakes] = useState(0);
  const [served, setServed] = useState<string[]>([]);
  const [message, setMessage] = useState("Pick letters to start blending silliness!");

  const finished = rounds.length > 0 && roundIndex >= rounds.length;
  const currentRound = roundIndex < rounds.length ? rounds[roundIndex] : undefined;
  const progress = currentRound ? typed.length / currentRound.target.length : 0;

  useEffect(() => {
    setRoundIndex(0);
    setServed([]);
    setTyped([]);
    setDisabled(new Set());
    setRoundMistakes(0);
    if (rounds.length === 0) {
      setMessage("Add words in the parent dashboard to feed the giggle monsters.");
    }
  }, [rounds.length]);

  useEffect(() => {
    if (!currentRound) {
      if (finished) {
        setMessage("Goo-lorious victory! Every monster is happily slurping.");
        playCelebration();
      }
      return;
    }
    setTyped([]);
    setDisabled(new Set());
    setRoundMistakes(0);
    setMessage(pickLine(START_LINES, { word: currentRound.pretty }));
  }, [currentRound, finished]);

  const handleHearWord = () => {
    if (!currentRound) return;
    playSound(currentRound.audioUrl, currentRound.spoken);
    setMessage(`The blender whispers: "${currentRound.pretty}!"`);
  };

  const handleTileClick = (tile: LetterTile) => {
    if (!currentRound || finished) return;
    if (disabled.has(tile.id)) return;

    const expected = currentRound.target[typed.length];
    const updatedDisabled = new Set(disabled);

    if (tile.letter === expected) {
      playSuccessTone();
      updatedDisabled.add(tile.id);
      const nextTyped = [...typed, tile.letter];
      setTyped(nextTyped);
      setDisabled(updatedDisabled);
      setMessage(pickLine(SUCCESS_LINES, { word: currentRound.pretty }));

      if (nextTyped.length === currentRound.target.length) {
        setServed((prev) => [...prev, currentRound.pretty]);
        setTimeout(() => {
          setRoundIndex((prev) => prev + 1);
        }, 700);
      }
      return;
    }

    setRoundMistakes((prev) => prev + 1);
    setMessage(pickLine(OOPS_LINES, { letter: tile.letter }));
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Giggle Goo Kitchen</h2>
          <p className="text-sm text-slate-600">
            Click the letters in order to blend a word smoothie for the silliest monsters.
          </p>
        </div>
        {rounds.length > 0 && (
          <span className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-slate-800">
            Round {Math.min(roundIndex + 1, rounds.length)} / {rounds.length}
          </span>
        )}
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-secondary/20 via-white to-accent/20 p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-5xl md:h-28 md:w-28">
              <span role="img" aria-label="Giggling monster">
                🤪
              </span>
              <span className="absolute -bottom-3 text-xs font-semibold text-primary">
                Giggle meter: {roundMistakes}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-slate-800">{message}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
                />
              </div>
              <button
                type="button"
                onClick={handleHearWord}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow"
              >
                Hear word
              </button>
            </div>
          </div>
        </div>
      </section>

      {finished && (
        <section className="rounded-3xl bg-success/20 p-6 text-lg font-bold text-success shadow">
          Everyone is sticky and happy! Replay the word sounds to celebrate.
        </section>
      )}

      {!finished && !currentRound && (
        <section className="rounded-3xl bg-white/80 p-6 text-base text-slate-600 shadow">
          Not enough words yet. Add more in the dashboard to keep the kitchen open.
        </section>
      )}

      {currentRound && !finished && (
        <>
          <section className="rounded-3xl bg-white/90 p-6 shadow-inner">
            <h3 className="text-lg font-bold text-slate-800">Word mixing bowl</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {currentRound.target.split("").map((letter, index) => (
                <span
                  key={`${currentRound.id}-slot-${index}`}
                  className={`flex h-16 w-14 items-center justify-center rounded-2xl border-4 text-2xl font-extrabold transition-all ${
                    typed[index]
                      ? "border-success bg-success/20 text-success"
                      : "border-dashed border-secondary bg-white text-slate-500"
                  }`}
                >
                  {typed[index] ?? "?"}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-secondary/10 p-6 shadow">
            <h3 className="text-lg font-bold text-slate-800">Letter pantry</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {currentRound.pool.map((tile) => {
                const isUsed = disabled.has(tile.id);
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => handleTileClick(tile)}
                    className={`min-w-[60px] rounded-2xl px-4 py-3 text-xl font-extrabold shadow transition-transform ${
                      isUsed
                        ? "bg-slate-200 text-slate-400"
                        : "bg-primary text-white hover:-translate-y-1 hover:bg-primary/90"
                    }`}
                    disabled={isUsed}
                  >
                    {tile.letter}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {served.length > 0 && (
        <section className="rounded-3xl bg-white/80 p-5 shadow">
          <h3 className="text-lg font-bold text-slate-800">Giggle menu served</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {served.map((word) => (
              <span
                key={word}
                className="rounded-full bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {word}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default GiggleGooKitchen;
