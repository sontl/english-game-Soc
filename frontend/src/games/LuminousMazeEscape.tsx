import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Word } from "@english-game/shared";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playCelebration, playSound, playSuccessTone } from "../utils/sound";

interface Position {
  x: number;
  y: number;
}

interface Crystal {
  letter: string;
  correct: boolean;
}

interface MazeData {
  width: number;
  height: number;
  start: Position;
  exit: Position;
  open: Set<string>;
  crystals: Record<string, Crystal>;
  path: Position[];
}

interface RoundData {
  id: string;
  word: string;
  audioUrl?: string;
  maze: MazeData;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const sanitize = (value: string) => value.replace(/[^a-z]/gi, "").toUpperCase();

const positionKey = (position: Position) => `${position.x}-${position.y}`;

const buildMaze = (word: string): MazeData => {
  const width = 9;
  const height = 9;
  const innerWidth = width - 2;
  const innerHeight = height - 2;
  const route: Position[] = [];
  const open = new Set<string>();

  for (let y = 1; y <= innerHeight; y += 1) {
    if (y % 2 === 1) {
      for (let x = 1; x <= innerWidth; x += 1) {
        const position = { x, y } satisfies Position;
        open.add(positionKey(position));
        route.push(position);
      }
    } else {
      for (let x = innerWidth; x >= 1; x -= 1) {
        const position = { x, y } satisfies Position;
        open.add(positionKey(position));
        route.push(position);
      }
    }
  }

  const start = route[0] ?? { x: 1, y: 1 };
  const exit = route[route.length - 1] ?? { x: innerWidth, y: innerHeight };

  const letters = word.split("");
  const spacing = Math.max(2, Math.floor(route.length / (letters.length + 3)));
  const reserved = new Set<string>([positionKey(start), positionKey(exit)]);
  const crystals: Record<string, Crystal> = {};

  let cursor = 2;
  letters.forEach((letter) => {
    while (cursor < route.length - 1 && reserved.has(positionKey(route[cursor]!))) {
      cursor += 1;
    }
    if (cursor >= route.length - 1) {
      cursor = Math.max(1, route.length - 2);
      while (cursor > 1 && reserved.has(positionKey(route[cursor]!))) {
        cursor -= 1;
      }
    }
    const spot = route[cursor] ?? exit;
    crystals[positionKey(spot)] = { letter, correct: true } satisfies Crystal;
    reserved.add(positionKey(spot));
    cursor += spacing;
  });

  const distractors = shuffle(
    LETTERS.split("").filter((letter) => !letters.includes(letter))
  ).slice(0, letters.length + 4);

  const trapCandidates = shuffle(
    route.filter((spot) => !reserved.has(positionKey(spot)))
  ).slice(0, Math.min(letters.length + 2, distractors.length));

  trapCandidates.forEach((spot, index) => {
    crystals[positionKey(spot)] = {
      letter: distractors[index % distractors.length],
      correct: false
    } satisfies Crystal;
  });

  return {
    width,
    height,
    start,
    exit,
    open,
    crystals,
    path: route
  } satisfies MazeData;
};

const buildRounds = (words: Word[]): RoundData[] => {
  const candidates = words.filter((word) => sanitize(word.text).length >= 3);
  return shuffle(candidates)
    .slice(0, 4)
    .map((word) => {
      const sanitized = sanitize(word.text);
      return {
        id: word.id,
        word: sanitized,
        audioUrl: word.audioUrl,
        maze: buildMaze(sanitized)
      } satisfies RoundData;
    });
};

const LuminousMazeEscape = () => {
  const { words } = useAppStore();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [crystals, setCrystals] = useState<Record<string, Crystal>>({});
  const [collected, setCollected] = useState<string[]>([]);
  const [torches, setTorches] = useState(3);
  const [goalUnlocked, setGoalUnlocked] = useState(false);
  const [status, setStatus] = useState("Navigate the glowing maze to collect letters in order.");
  const [celebrated, setCelebrated] = useState(false);

  const crystalsTemplateRef = useRef<Record<string, Crystal>>({});

  const currentRound = rounds[roundIndex];
  const targetLetter = currentRound?.word[collected.length];
  const finished = rounds.length > 0 && roundIndex >= rounds.length;

  useEffect(() => {
    setRoundIndex(0);
    setTorches(3);
    setCollected([]);
    setCrystals({});
    setGoalUnlocked(false);
    setStatus(
      rounds.length === 0
        ? "Add words to illuminate the maze."
        : "Navigate the glowing maze to collect letters in order."
    );
    setCelebrated(false);
  }, [rounds.length]);

  useEffect(() => {
    if (!currentRound) {
      setCrystals({});
      return;
    }
    const freshCrystals = Object.entries(currentRound.maze.crystals).reduce(
      (acc, [key, crystal]) => ({
        ...acc,
        [key]: { ...crystal }
      }),
      {} as Record<string, Crystal>
    );
    crystalsTemplateRef.current = freshCrystals;
    setCrystals(freshCrystals);
    setPlayerPos(currentRound.maze.start);
    setCollected([]);
    setTorches(3);
    setGoalUnlocked(false);
    setStatus("Follow the shimmering tiles and gather each crystal letter.");
  }, [currentRound]);

  useEffect(() => {
    if (!currentRound) return;
    if (collected.length === currentRound.word.length && !goalUnlocked) {
      setGoalUnlocked(true);
      setStatus("Every crystal glows! Find the exit portal to escape.");
    }
  }, [collected.length, currentRound, goalUnlocked]);

  const resetRound = useCallback(() => {
    if (!currentRound) return;
    setCrystals(
      Object.entries(crystalsTemplateRef.current).reduce(
        (acc, [key, crystal]) => ({
          ...acc,
          [key]: { ...crystal }
        }),
        {} as Record<string, Crystal>
      )
    );
    setPlayerPos(currentRound.maze.start);
    setCollected([]);
    setTorches(3);
    setGoalUnlocked(false);
    setStatus("Torches relit! Track the letters carefully this time.");
  }, [currentRound]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (!currentRound || finished || torches === 0) return;
      const maze = currentRound.maze;
      const nextPos = { x: playerPos.x + dx, y: playerPos.y + dy } satisfies Position;
      if (
        nextPos.x < 0 ||
        nextPos.y < 0 ||
        nextPos.x >= maze.width ||
        nextPos.y >= maze.height ||
        !maze.open.has(positionKey(nextPos))
      ) {
        setStatus("The crystal walls shimmer—no path that way.");
        return;
      }

      const tileKey = positionKey(nextPos);
      const crystal = crystals[tileKey];

      if (crystal) {
        if (crystal.correct) {
          if (crystal.letter === targetLetter) {
            playSuccessTone();
            setCollected((prev) => [...prev, crystal.letter]);
            setCrystals((prev) => {
              const next = { ...prev };
              delete next[tileKey];
              return next;
            });
            setStatus(`Crystal ${crystal.letter} secured!`);
          } else {
            setStatus(`${crystal.letter} glows, but it's not the next crystal yet.`);
            setPlayerPos(nextPos);
            return;
          }
        } else {
          let extinguished = false;
          let remaining = torches;
          setTorches((prev) => {
            const next = Math.max(0, prev - 1);
            remaining = next;
            if (next === 0) {
              extinguished = true;
            }
            return next;
          });
          setCrystals((prev) => {
            const next = { ...prev };
            delete next[tileKey];
            return next;
          });
          if (extinguished) {
            setStatus("Your torches faded! The maze is reshaping.");
            setTimeout(() => {
              resetRound();
            }, 600);
          } else {
            setStatus(`Trap crystal! Torches remaining: ${"🔥".repeat(remaining)}.`);
          }
        }
      }

      setPlayerPos(nextPos);

      if (goalUnlocked && nextPos.x === maze.exit.x && nextPos.y === maze.exit.y) {
        setStatus(`Maze mastered! ${currentRound.word} gleams in the sky.`);
        playCelebration();
        setTimeout(() => {
          setRoundIndex((prev) => prev + 1);
        }, 1000);
        return;
      }

      if (!crystal) {
        if (goalUnlocked) {
          setStatus("The exit shimmers nearby—make your way there!");
        } else if (targetLetter) {
          setStatus(`Seek the crystal marked ${targetLetter}.`);
        }
      }
    },
    [collected.length, currentRound, crystals, finished, goalUnlocked, playerPos, resetRound, targetLetter, torches]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          movePlayer(1, 0);
          break;
        case " ":
          event.preventDefault();
          if (currentRound) {
            playSound(currentRound.audioUrl, currentRound.word);
            setStatus(`Listen: ${currentRound.word}. Follow the echoes.`);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentRound, movePlayer]);

  useEffect(() => {
    if (finished && !celebrated) {
      setCelebrated(true);
      setStatus("Legendary explorer! Every maze now glows with your victory.");
      playCelebration();
    }
  }, [celebrated, finished]);

  const handlePlaySound = () => {
    if (!currentRound) return;
    playSound(currentRound.audioUrl, currentRound.word);
    setStatus(`Maze spirits whisper: ${currentRound.word}.`);
  };

  const renderGrid = () => {
    if (!currentRound) return null;
    const tiles: JSX.Element[] = [];
    const { width, height, open, exit } = currentRound.maze;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const key = `${x}-${y}`;
        const isPath = open.has(key);
        const crystal = crystals[key];
        const isExit = exit.x === x && exit.y === y;
        tiles.push(
          <div
            key={key}
            className={`relative flex items-center justify-center rounded-md border border-indigo-200/30 ${
              isPath ? "bg-indigo-100/10" : "bg-slate-900"
            } ${isExit ? "ring-2 ring-secondary/60" : ""}`}
          >
            {crystal && (
              <motion.span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shadow ${
                  crystal.correct
                    ? "bg-gradient-to-br from-amber-200 via-white to-amber-300 text-amber-900"
                    : "bg-gradient-to-br from-rose-200 via-white to-rose-300 text-rose-900"
                }`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {crystal.letter}
              </motion.span>
            )}
            {isExit && goalUnlocked && (
              <motion.span
                className="absolute inset-0 rounded-md bg-secondary/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              />
            )}
          </div>
        );
      }
    }

    return (
      <div
        className="relative grid gap-1 rounded-2xl bg-slate-950/80 p-4 shadow-inner"
        style={{ gridTemplateColumns: `repeat(${currentRound.maze.width}, minmax(0, 1fr))` }}
      >
        {tiles}
        <motion.div
          className="pointer-events-none absolute flex h-12 w-12 items-center justify-center rounded-full border-4 border-secondary bg-gradient-to-br from-secondary/30 via-secondary/60 to-secondary text-2xl shadow-2xl"
          animate={{
            x: `${(playerPos.x / (currentRound.maze.width - 1)) * 100}%`,
            y: `${(playerPos.y / (currentRound.maze.height - 1)) * 100}%`
          }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          style={{ transform: "translate(-50%, -50%)" }}
        >
          🧭
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Luminous Maze Escape</h2>
          <p className="text-sm text-slate-600">
            Navigate the enchanted maze, collect glowing letters, and unlock the exit portal.
          </p>
        </div>
        {currentRound && (
          <span className="rounded-full bg-secondary/20 px-4 py-2 text-sm font-semibold text-slate-700">
            Maze {roundIndex + 1} / {rounds.length}
          </span>
        )}
      </header>

      <section className="rounded-3xl bg-gradient-to-r from-violet-100 via-white to-sky-100 p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-semibold text-slate-800">{status}</p>
          <div className="flex items-center gap-3">
            {currentRound && (
              <button
                type="button"
                onClick={handlePlaySound}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow"
              >
                Play word
              </button>
            )}
            {currentRound && (
              <button
                type="button"
                onClick={resetRound}
                className="rounded-full border-2 border-primary px-5 py-2 text-sm font-bold text-primary"
              >
                Reset maze
              </button>
            )}
          </div>
        </div>
        {currentRound && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentRound.word.split("").map((letter, index) => (
              <span
                key={`${currentRound.id}-${letter}-${index}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg font-bold transition-colors ${
                  index < collected.length
                    ? "border-success bg-success/20 text-success"
                    : index === collected.length
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {letter}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span>Torches:</span>
          <span>
            {torches > 0 ? Array.from({ length: torches }).map((_, index) => <span key={index}>🔥</span>) : "Out"}
          </span>
        </div>
      </section>

      {finished && (
        <section className="rounded-3xl bg-success/20 p-6 text-lg font-bold text-success shadow">
          Brilliant explorer! Every maze crystal now sings your name.
        </section>
      )}

      {!finished && currentRound && (
        <section className="flex flex-col items-center gap-5 rounded-3xl bg-slate-900/90 p-6 shadow-inner">
          {renderGrid()}
          <div className="grid grid-cols-3 gap-4">
            <span />
            <button
              type="button"
              onClick={() => movePlayer(0, -1)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-secondary bg-white/10 text-2xl text-white shadow"
            >
              ↑
            </button>
            <span />
            <button
              type="button"
              onClick={() => movePlayer(-1, 0)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-secondary bg-white/10 text-2xl text-white shadow"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => movePlayer(0, 1)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-secondary bg-white/10 text-2xl text-white shadow"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => movePlayer(1, 0)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-secondary bg-white/10 text-2xl text-white shadow"
            >
              →
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default LuminousMazeEscape;
