import { useEffect, useMemo, useState } from "react";
import type { Word } from "@english-game/shared";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playCelebration, playSuccessTone } from "../utils/sound";

interface ChunkOption {
  id: string;
  value: string;
}

interface RoundData {
  id: string;
  pretty: string;
  chunks: string[];
  options: ChunkOption[];
  clue: string;
}

const sanitize = (value: string) => value.replace(/[^a-z]/gi, "").toUpperCase();

const chunkWord = (word: string) => {
  const clean = sanitize(word);
  if (clean.length <= 4) return clean.split("");
  const result: string[] = [];
  let index = 0;
  while (index < clean.length) {
    const remaining = clean.length - index;
    const size = remaining <= 3 ? remaining : 2;
    result.push(clean.slice(index, index + size));
    index += size;
  }
  return result;
};

const pickClue = (word: Word) => {
  if (word.exampleSentence) {
    return word.exampleSentence.replace(new RegExp(word.text, "i"), "a tasty mystery");
  }
  return `Pack the picnic basket with the word "${word.text}".`;
};

const buildRounds = (words: Word[]): RoundData[] => {
  const valid = words.filter((word) => sanitize(word.text).length >= 3);
  const chosen = shuffle(valid).slice(0, 5);
  return chosen.map((word) => {
    const chunks = chunkWord(word.text);
    const decoyChunks = shuffle(
      valid
        .filter((item) => item.id !== word.id)
        .flatMap((item) => chunkWord(item.text))
    ).slice(0, 4);
    const options = shuffle([
      ...chunks.map((value, index) => ({
        id: `${word.id}-chunk-${index}`,
        value
      })),
      ...decoyChunks.map((value, index) => ({
        id: `${word.id}-decoy-${index}`,
        value
      }))
    ]);
    return {
      id: word.id,
      pretty: word.text,
      chunks,
      options,
      clue: pickClue(word)
    } satisfies RoundData;
  });
};

const hamperIcons = ["🧺", "🥪", "🍓", "🧀", "🥕", "🍇", "🍋", "🥐"];

const MysteryPicnicParade = () => {
  const { words } = useAppStore();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [basket, setBasket] = useState<string[]>([]);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("Collect the word in order to join the parade!");
  const [picnicList, setPicnicList] = useState<string[]>([]);

  const currentRound = rounds[roundIndex];
  const finished = rounds.length > 0 && roundIndex >= rounds.length;

  useEffect(() => {
    setRoundIndex(0);
    setPicnicList([]);
    setBasket([]);
    setUsed(new Set());
    if (rounds.length === 0) {
      setMessage("Add more words to fill the picnic baskets.");
    } else {
      setMessage("Collect the word in order to join the parade!");
    }
  }, [rounds.length]);

  useEffect(() => {
    if (finished) {
      setMessage("Picnic baskets ready! Parade magic unlocked.");
      playCelebration();
      return;
    }
    if (!currentRound) {
      if (rounds.length === 0) {
        setMessage("Add more words to fill the picnic baskets.");
      }
      return;
    }
    setBasket([]);
    setUsed(new Set());
    setMessage("Collect the word in order to join the parade!");
  }, [currentRound, finished, rounds.length]);

  const handlePick = (option: ChunkOption) => {
    if (!currentRound || finished) return;
    if (used.has(option.id)) return;
    const expected = currentRound.chunks[basket.length];
    const updated = new Set(used);

    if (option.value === expected) {
      updated.add(option.id);
      playSuccessTone();
      setBasket((prev) => [...prev, option.value]);
      setUsed(updated);
      if (basket.length + 1 === currentRound.chunks.length) {
        setPicnicList((prev) => [...prev, currentRound.pretty]);
        setMessage(`${currentRound.pretty} is packed! Ready for the parade.`);
        setTimeout(() => {
          setRoundIndex((prev) => prev + 1);
        }, 900);
      } else {
        setMessage("Yum! Grab the next chunk.");
      }
      return;
    }

    updated.add(option.id);
    setUsed(updated);
    setMessage("That treat belongs in another basket. Try again!");
    setTimeout(() => {
      updated.delete(option.id);
      setUsed(new Set(updated));
    }, 700);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Mystery Picnic Parade</h2>
          <p className="text-sm text-slate-600">
            Choose word chunks in the right order to pack the picnic basket.
          </p>
        </div>
        {currentRound && (
          <span className="rounded-full bg-secondary/30 px-4 py-2 text-sm font-semibold text-slate-700">
            Basket {roundIndex + 1} / {rounds.length}
          </span>
        )}
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-lime-100 via-white to-emerald-100 p-6 shadow">
        <p className="text-lg font-semibold text-slate-800">{message}</p>
        {currentRound && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-sm font-semibold text-slate-600">
            <span>🧺</span>
            <span>{currentRound.clue}</span>
          </p>
        )}
      </section>

      {finished && (
        <section className="rounded-3xl bg-success/20 p-6 text-lg font-bold text-success shadow">
          Every picnic basket is packed! Lead the parade with pride.
        </section>
      )}

      {!finished && currentRound && (
        <>
          <section className="rounded-3xl bg-white/90 p-6 shadow-inner">
            <h3 className="text-lg font-bold text-slate-800">Basket assembly</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {currentRound.chunks.map((chunk, index) => (
                <span
                  key={`${currentRound.id}-slot-${index}`}
                  className={`flex h-16 min-w-[70px] items-center justify-center rounded-2xl border-4 text-xl font-extrabold ${
                    basket[index]
                      ? "border-success bg-success/20 text-success"
                      : "border-dashed border-secondary bg-white text-slate-400"
                  }`}
                >
                  {basket[index] ?? "?"}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-secondary/20 p-6 shadow">
            <h3 className="text-lg font-bold text-slate-800">Picnic pantry</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentRound.options.map((option, index) => {
                const isUsed = used.has(option.id) && basket.includes(option.value);
                const tempLocked = used.has(option.id) && !basket.includes(option.value);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handlePick(option)}
                    className={`flex h-24 flex-col items-center justify-center gap-2 rounded-3xl border-4 text-xl font-extrabold shadow transition-all ${
                      isUsed
                        ? "border-success bg-success/10 text-success"
                        : tempLocked
                          ? "border-rose-300 bg-rose-100 text-rose-500"
                          : "border-primary/30 bg-gradient-to-br from-white via-lime-50 to-green-100 text-primary hover:-translate-y-1"
                    }`}
                  >
                    <span className="text-3xl">{hamperIcons[index % hamperIcons.length]}</span>
                    <span>{option.value}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {picnicList.length > 0 && (
        <section className="rounded-3xl bg-white/80 p-5 shadow">
          <h3 className="text-lg font-bold text-slate-800">Parade line-up</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {picnicList.map((item) => (
              <span
                key={item}
                className="rounded-full bg-gradient-to-r from-green-100 via-white to-primary/10 px-4 py-1 text-sm font-semibold text-slate-700"
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

export default MysteryPicnicParade;
