import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import type { Word } from "@english-game/shared";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playCelebration, playSound, playSuccessTone } from "../utils/sound";

interface ActiveToken {
  id: string;
  letter: string;
  correct: boolean;
  x: number;
  y: number;
  speed: number;
}

interface RoundData {
  id: string;
  word: string;
  audioUrl?: string;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const sanitize = (value: string) => value.replace(/[^a-z]/gi, "").toUpperCase();

const buildRounds = (words: Word[]): RoundData[] => {
  const candidates = words.filter((word) => sanitize(word.text).length >= 3);
  return shuffle(candidates)
    .slice(0, 5)
    .map((word) => ({
      id: word.id,
      word: sanitize(word.text),
      audioUrl: word.audioUrl
    } satisfies RoundData));
};

const createToken = (letter: string, correct: boolean): ActiveToken => ({
  id: `${letter}-${correct ? "t" : "f"}-${Math.random().toString(36).slice(2, 7)}`,
  letter,
  correct,
  x: 12 + Math.random() * 76,
  y: -10 - Math.random() * 40,
  speed: 0.4 + Math.random() * 0.4 + (correct ? 0.08 : 0)
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const SkylineSpellDash = () => {
  const { words } = useAppStore();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [progress, setProgress] = useState<string[]>([]);
  const [tokens, setTokens] = useState<ActiveToken[]>([]);
  const [status, setStatus] = useState("Slide the hoverboard to catch each letter in order!");
  const [shield, setShield] = useState(3);
  const [celebrated, setCelebrated] = useState(false);
  const [playerX, setPlayerX] = useState(50);

  const directionRef = useRef(0);
  const playerXRef = useRef(50);
  const frameRef = useRef<number | null>(null);
  const spawnCooldownRef = useRef(0);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const pointerActiveRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const currentRound = rounds[roundIndex];
  const targetLetter = currentRound?.word[progress.length];
  const finished = rounds.length > 0 && roundIndex >= rounds.length;

  useEffect(() => {
    setRoundIndex(0);
    setProgress([]);
    setShield(3);
    setTokens([]);
    setStatus(
      rounds.length === 0
        ? "Add words to soar through the skyline."
        : "Slide the hoverboard to catch each letter in order!"
    );
    setCelebrated(false);
  }, [rounds.length]);

  useEffect(() => {
    if (!currentRound) {
      setTokens([]);
      return;
    }
    setProgress([]);
    setShield(3);
    setCelebrated(false);
    setStatus("Catch the letters of the word in the right order!");
    setPlayerX(50);
    playerXRef.current = 50;
    spawnCooldownRef.current = 0;
    const initial: ActiveToken[] = [];
    if (currentRound.word.length > 0) {
      initial.push(createToken(currentRound.word[0], true));
    }
    while (initial.length < 5) {
      const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      initial.push(createToken(letter, false));
    }
    setTokens(initial);
  }, [currentRound]);

  const updatePlayerFromPointer = useCallback((clientX: number) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    if (rect.width === 0) return;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    const clamped = clamp(percent, 6, 94);
    playerXRef.current = clamped;
    setPlayerX(clamped);
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      pointerActiveRef.current = true;
      pointerIdRef.current = event.pointerId;
      directionRef.current = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
      updatePlayerFromPointer(event.clientX);
    },
    [updatePlayerFromPointer]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointerActiveRef.current) return;
      updatePlayerFromPointer(event.clientX);
    },
    [updatePlayerFromPointer]
  );

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerActiveRef.current = false;
    pointerIdRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (error) {
      // ignore release errors when pointer capture was not set
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        directionRef.current = -1;
      }
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        directionRef.current = 1;
      }
      if (event.key === " ") {
        event.preventDefault();
        setStatus(`Spell: ${progress.join("")}${targetLetter ?? ""}`);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)) {
        directionRef.current = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [progress, targetLetter]);

  useEffect(() => {
    if (!currentRound || finished || shield === 0) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min(48, time - lastTime);
      lastTime = time;
      const step = delta / 16.67;

      setPlayerX((prev) => {
        const next = clamp(prev + directionRef.current * step * 1.6, 6, 94);
        playerXRef.current = next;
        return next;
      });

      const collisions: ActiveToken[] = [];
      const misses: ActiveToken[] = [];

      setTokens((prevTokens) => {
        const updated: ActiveToken[] = [];
        let hasTarget = false;
        spawnCooldownRef.current += delta;

        prevTokens.forEach((token) => {
          const newY = token.y + token.speed * step * 2;
          const distance = Math.abs(token.x - playerXRef.current);
          if (newY >= 88 && distance < 9) {
            collisions.push({ ...token, y: newY });
            return;
          }
          if (newY > 104) {
            if (token.correct) {
              misses.push(token);
            }
            return;
          }
          if (token.correct && targetLetter && token.letter === targetLetter) {
            hasTarget = true;
          }
          updated.push({ ...token, y: newY });
        });

        if (!targetLetter) {
          return updated;
        }

        if (!hasTarget && shield > 0) {
          updated.push(createToken(targetLetter, true));
          hasTarget = true;
        }

        if (spawnCooldownRef.current > 600 && shield > 0) {
          const spawnCount = Math.max(1, 6 - updated.length);
          for (let index = 0; index < spawnCount; index += 1) {
            const makeCorrect = !hasTarget ? true : Math.random() > 0.7;
            const letter = makeCorrect ? targetLetter : LETTERS[Math.floor(Math.random() * LETTERS.length)];
            const token = createToken(letter, makeCorrect && letter === targetLetter);
            if (token.correct && token.letter === targetLetter) {
              hasTarget = true;
            }
            updated.push(token);
          }
          spawnCooldownRef.current = 0;
        }

        return updated.slice(0, 9);
      });

      if (collisions.length > 0) {
        collisions.forEach((token) => {
          if (!targetLetter) return;
          if (token.correct && token.letter === targetLetter) {
            playSuccessTone();
            setProgress((prev) => [...prev, token.letter]);
            setStatus(`Nice catch! Keep spelling ${currentRound.word}.`);
          } else {
            let depleted = false;
            let nextShieldValue = shield;
            setShield((prev) => {
              const next = Math.max(0, prev - 1);
              nextShieldValue = next;
              if (next === 0) {
                depleted = true;
              }
              return next;
            });
            if (depleted) {
              setTokens([]);
              setStatus("Shield depleted! The skyline patrol is returning to base.");
            } else {
              setStatus(`Oops! ${token.letter} wasn't next. Shield ${"💠".repeat(nextShieldValue)}.`);
            }
          }
        });
      }

      if (misses.some((token) => token.correct)) {
        setStatus(`You missed a key letter! Focus on ${targetLetter ?? "the next letter"}.`);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [currentRound, finished, shield, targetLetter]);

  useEffect(() => {
    if (!currentRound) return;
    if (shield === 0) {
      setStatus(`Mission over! The word was ${currentRound.word}. Tap restart to try again.`);
    }
  }, [shield, currentRound]);

  useEffect(() => {
    if (!currentRound) return;
    if (progress.length === currentRound.word.length) {
      setStatus(`Skyline secured! ${currentRound.word} is fully spelled.`);
      setTokens([]);
      setTimeout(() => {
        setRoundIndex((prev) => prev + 1);
      }, 1000);
    }
  }, [progress, currentRound]);

  useEffect(() => {
    if (finished && !celebrated) {
      setCelebrated(true);
      setStatus("Supersonic! Every skyline patrol caught their letters.");
      playCelebration();
    }
  }, [celebrated, finished]);

  const handlePlaySound = () => {
    if (!currentRound) return;
    playSound(currentRound.audioUrl, currentRound.word);
    setStatus(`Listen carefully: ${currentRound.word}.`);
  };

  const handleRestart = () => {
    if (!currentRound) return;
    setProgress([]);
    setShield(3);
    setPlayerX(50);
    playerXRef.current = 50;
    directionRef.current = 0;
    spawnCooldownRef.current = 0;
    setTokens([
      createToken(currentRound.word[0], true),
      createToken(LETTERS[Math.floor(Math.random() * LETTERS.length)], false),
      createToken(LETTERS[Math.floor(Math.random() * LETTERS.length)], false),
      createToken(LETTERS[Math.floor(Math.random() * LETTERS.length)], false),
      createToken(LETTERS[Math.floor(Math.random() * LETTERS.length)], false)
    ]);
    setStatus("Fresh hoverboard! Catch the letters in order.");
  };

  const handleDirection = (value: number) => {
    directionRef.current = value;
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Skyline Spell Dash</h2>
          <p className="text-sm text-slate-600">
            Glide left and right to snatch each letter in order before it passes the hover deck.
          </p>
        </div>
        {currentRound && (
          <span className="rounded-full bg-secondary/20 px-4 py-2 text-sm font-semibold text-slate-700">
            Patrol {roundIndex + 1} / {rounds.length}
          </span>
        )}
      </header>

      <section className="rounded-3xl bg-gradient-to-b from-indigo-100 via-white to-sky-200 p-6 shadow">
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
                onClick={handleRestart}
                className="rounded-full border-2 border-primary px-5 py-2 text-sm font-bold text-primary"
              >
                Restart
              </button>
            )}
          </div>
        </div>
        {currentRound && (
          <div className="mt-3 flex flex-wrap gap-2">
            {currentRound.word.split("").map((letter, index) => (
              <span
                key={`${currentRound.id}-${index}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg font-bold transition-colors ${
                  index < progress.length
                    ? "border-success bg-success/20 text-success"
                    : index === progress.length
                      ? "border-primary bg-primary/25 text-primary"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {letter}
              </span>
            ))}
          </div>
        )}
      </section>

      {finished && (
        <section className="rounded-3xl bg-success/20 p-6 text-lg font-bold text-success shadow">
          Skyline legend! Every patrol completed their word.
        </section>
      )}

      {!finished && currentRound && (
        <section className="relative overflow-hidden rounded-3xl bg-slate-900/90 p-6 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)]" />
          <div
            ref={arenaRef}
            className="relative h-[420px] w-full"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
          >
            {tokens.map((token) => (
              <motion.div
                key={token.id}
                className={`absolute flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl font-bold shadow-lg ${
                  token.correct
                    ? "border-amber-300 bg-amber-200/80 text-amber-900"
                    : "border-slate-500 bg-slate-600/80 text-white"
                }`}
                style={{
                  left: `${token.x}%`,
                  top: `${token.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
                animate={{ y: `${token.y}%` }}
                transition={{ duration: 0.2, ease: "linear" }}
              >
                {token.letter}
              </motion.div>
            ))}

            <motion.div
              className="absolute bottom-4 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-4 border-primary bg-gradient-to-br from-primary/20 via-primary/50 to-primary text-3xl shadow-2xl"
              animate={{ x: `${playerX - 50}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
            >
              🛹
            </motion.div>

            <div className="absolute bottom-2 left-4 flex gap-2 text-lg text-white">
              Shield:
              <span className="flex items-center gap-1">
                {Array.from({ length: shield }).map((_, index) => (
                  <span key={index}>💠</span>
                ))}
              </span>
            </div>
          </div>

          <div className="relative mt-5 flex items-center justify-center gap-6">
            <button
              type="button"
              onMouseDown={() => handleDirection(-1)}
              onMouseUp={() => handleDirection(0)}
              onTouchStart={() => handleDirection(-1)}
              onTouchEnd={() => handleDirection(0)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-white/20 text-2xl text-white shadow"
            >
              ←
            </button>
            <button
              type="button"
              onMouseDown={() => handleDirection(0)}
              onMouseUp={() => handleDirection(0)}
              onTouchStart={() => handleDirection(0)}
              onTouchEnd={() => handleDirection(0)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-white/20 text-2xl text-white shadow"
            >
              ⬤
            </button>
            <button
              type="button"
              onMouseDown={() => handleDirection(1)}
              onMouseUp={() => handleDirection(0)}
              onTouchStart={() => handleDirection(1)}
              onTouchEnd={() => handleDirection(0)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-white/20 text-2xl text-white shadow"
            >
              →
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default SkylineSpellDash;
