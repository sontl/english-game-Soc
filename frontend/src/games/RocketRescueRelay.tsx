import { useEffect, useMemo, useState } from "react";
import type { Word } from "@english-game/shared";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playCelebration, playSound, playSuccessTone } from "../utils/sound";

interface StageOption {
  id: string;
  letter: string;
}

interface Stage {
  id: string;
  expected: string;
  options: StageOption[];
}

interface RoundData {
  id: string;
  pretty: string;
  stages: Stage[];
  audioUrl?: string;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const sanitize = (value: string) => value.replace(/[^a-z]/gi, "").toUpperCase();

const createStageOptions = (expected: string) => {
  const pool = new Set<string>([expected]);
  while (pool.size < 3) {
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    pool.add(letter);
  }
  return shuffle(Array.from(pool)).map((letter, index) => ({
    id: `${expected}-${letter}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    letter
  } satisfies StageOption));
};

const buildRounds = (words: Word[]): RoundData[] => {
  const candidates = words.filter((word) => sanitize(word.text).length >= 3);
  const selected = shuffle(candidates).slice(0, 5);
  return selected.map((word) => {
    const clean = sanitize(word.text);
    const stages = clean.split("").map((letter, index) => ({
      id: `${word.id}-stage-${index}`,
      expected: letter,
      options: createStageOptions(letter)
    }));
    return {
      id: word.id,
      pretty: word.text,
      stages,
      audioUrl: word.audioUrl
    } satisfies RoundData;
  });
};

const RocketRescueRelay = () => {
  const { words } = useAppStore();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [fuel, setFuel] = useState(90);
  const [status, setStatus] = useState("Select the next letter to fuel the rocket!");
  const [rescued, setRescued] = useState<string[]>([]);
  const [isDrained, setIsDrained] = useState(false);

  const currentRound = rounds[roundIndex];
  const currentStage = currentRound?.stages[stageIndex];
  const finished = rounds.length > 0 && roundIndex >= rounds.length;

  useEffect(() => {
    setRoundIndex(0);
    setStageIndex(0);
    setFuel(90);
    setRescued([]);
    setIsDrained(false);
    if (rounds.length === 0) {
      setStatus("Add more words to launch rescue rockets.");
    } else {
      setStatus("Select the next letter to fuel the rocket!");
    }
  }, [rounds.length]);

  useEffect(() => {
    if (finished) {
      setStatus("Mission accomplished! Every word rocket reached the stars.");
      playCelebration();
      return;
    }
    if (!currentRound) {
      if (rounds.length === 0) {
        setStatus("Add more words to launch rescue rockets.");
      }
      return;
    }
    setStageIndex(0);
    setFuel(90);
    setIsDrained(false);
    setStatus("Select the next letter to fuel the rocket!");
  }, [currentRound, finished, rounds.length]);

  useEffect(() => {
    if (!currentRound || finished) return;
    if (isDrained) return;
    const timer = window.setInterval(() => {
      setFuel((prev) => {
        if (prev <= 0) {
          setIsDrained(true);
          setStatus("Fuel empty! Tap the correct letter to refuel.");
          return 0;
        }
        return Math.max(0, prev - 1);
      });
    }, 600);
    return () => window.clearInterval(timer);
  }, [currentRound, finished, isDrained]);

  const adjustFuel = (delta: number) => {
    setFuel((prev) => Math.min(100, Math.max(0, prev + delta)));
  };

  const handlePlaySound = () => {
    if (!currentRound) return;
    playSound(currentRound.audioUrl, currentRound.pretty);
    setStatus(`Mission control says: ${currentRound.pretty}!`);
  };

  const handleOption = (option: StageOption) => {
    if (!currentRound || !currentStage || finished) return;

    if (option.letter === currentStage.expected) {
      playSuccessTone();
      adjustFuel(12);
      setStageIndex((prev) => prev + 1);
      setIsDrained(false);
      setStatus("Boost successful! Keep the rocket steady.");
      if (stageIndex + 1 === currentRound.stages.length) {
        setRescued((prev) => [...prev, currentRound.pretty]);
        setTimeout(() => {
          setRoundIndex((prev) => prev + 1);
        }, 900);
      }
      return;
    }

    adjustFuel(-15);
    setStatus(`Wrong booster! ${option.letter} drained fuel.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Rocket Rescue Relay</h2>
          <p className="text-sm text-slate-600">
            Choose the next letter to keep the rocket fueled and rescue the word.
          </p>
        </div>
        {currentRound && (
          <span className="rounded-full bg-secondary/20 px-4 py-2 text-sm font-semibold text-slate-700">
            Launch {roundIndex + 1} / {rounds.length}
          </span>
        )}
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-cyan-100 p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-semibold text-slate-800">{status}</p>
          {currentRound && (
            <button
              type="button"
              onClick={handlePlaySound}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow"
            >
              Call mission control
            </button>
          )}
        </div>
        {currentRound && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${fuel}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Fuel level: {fuel}% — Word length {currentRound.stages.length}
            </p>
          </div>
        )}
      </section>

      {finished && (
        <section className="rounded-3xl bg-success/20 p-6 text-lg font-bold text-success shadow">
          Stellar piloting! Every stranded word is safe.
        </section>
      )}

      {!finished && currentRound && currentStage && (
        <section className="rounded-3xl bg-white/90 p-6 shadow-inner">
          <h3 className="text-lg font-bold text-slate-800">Booster selection</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {currentStage.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOption(option)}
                className="flex h-28 flex-col items-center justify-center gap-3 rounded-3xl border-4 border-primary/30 bg-gradient-to-br from-white via-indigo-50 to-cyan-100 text-2xl font-extrabold text-primary shadow transition-transform hover:-translate-y-1"
              >
                <span className="text-4xl">🚀</span>
                <span>{option.letter}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {currentRound.stages.map((stage, index) => (
              <span
                key={stage.id}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold ${
                  index < stageIndex
                    ? "border-success bg-success/20 text-success"
                    : index === stageIndex
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {stage.expected}
              </span>
            ))}
          </div>
        </section>
      )}

      {rescued.length > 0 && (
        <section className="rounded-3xl bg-white/80 p-5 shadow">
          <h3 className="text-lg font-bold text-slate-800">Rescued words</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {rescued.map((item) => (
              <span
                key={item}
                className="rounded-full bg-gradient-to-r from-cyan-100 via-white to-indigo-100 px-4 py-1 text-sm font-semibold text-slate-700"
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

export default RocketRescueRelay;
