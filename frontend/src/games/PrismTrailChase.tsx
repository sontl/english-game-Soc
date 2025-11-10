import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import type { Word } from "@english-game/shared";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playCelebration, playSound, playSuccessTone } from "../utils/sound";

interface Gate {
  id: string;
  laneSegments: string[];
  correctLane: number;
  segment: string;
  progress: number;
}

interface RoundData {
  id: string;
  word: string;
  segments: string[];
  audioUrl?: string;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LANES = 3;

const sanitize = (value: string) => value.replace(/[^a-z]/gi, "").toUpperCase();

const splitSegments = (word: string): string[] => {
  const segments: string[] = [];
  let index = 0;
  while (index < word.length) {
    const remaining = word.length - index;
    if (remaining >= 4) {
      segments.push(word.slice(index, index + 2));
      index += 2;
    } else if (remaining === 3) {
      segments.push(word.slice(index, index + 1));
      segments.push(word.slice(index + 1));
      index = word.length;
    } else {
      segments.push(word.slice(index));
      index = word.length;
    }
  }
  return segments;
};

const buildRounds = (words: Word[]): RoundData[] => {
  const candidates = words.filter((word) => sanitize(word.text).length >= 3);
  return shuffle(candidates)
    .slice(0, 5)
    .map((word) => {
      const sanitized = sanitize(word.text);
      return {
        id: word.id,
        word: sanitized,
        segments: splitSegments(sanitized),
        audioUrl: word.audioUrl
      } satisfies RoundData;
    });
};

const randomLane = () => Math.floor(Math.random() * LANES);

const randomSegment = (exclude: string[]): string => {
  const pool = LETTERS.split("")
    .map((letter, index) =>
      index < LETTERS.length - 1 ? `${letter}${LETTERS[index + 1] ?? ""}`.trim() : letter
    )
    .filter((candidate) => candidate && !exclude.includes(candidate));
  const sample = pool[Math.floor(Math.random() * pool.length)];
  return sample ?? "ZZ";
};

const PrismTrailChase = () => {
  const { words } = useAppStore();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [playerLane, setPlayerLane] = useState(1);
  const [energy, setEnergy] = useState(3);
  const [status, setStatus] = useState("Slide between prism lanes and catch the glowing segments in order!");
  const [gates, setGates] = useState<Gate[]>([]);
  const [collected, setCollected] = useState<string[]>([]);
  const [celebrated, setCelebrated] = useState(false);

  const nextSegmentRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const swipeActiveRef = useRef(false);
  const swipePointerIdRef = useRef<number | null>(null);
  const swipeLastXRef = useRef(0);
  const swipeAccumulatedRef = useRef(0);

  const currentRound = rounds[roundIndex];
  const targetSegment = currentRound?.segments[collected.length];
  const finished = rounds.length > 0 && roundIndex >= rounds.length;

  useEffect(() => {
    setRoundIndex(0);
    setPlayerLane(1);
    setEnergy(3);
    setGates([]);
    setCollected([]);
    setStatus(
      rounds.length === 0
        ? "Add words to power the prism highway."
        : "Slide between prism lanes and catch the glowing segments in order!"
    );
    setCelebrated(false);
    nextSegmentRef.current = 0;
    spawnTimerRef.current = 0;
  }, [rounds.length]);

  useEffect(() => {
    if (!currentRound) {
      setGates([]);
      return;
    }
    setPlayerLane(1);
    setEnergy(3);
    setGates([]);
    setCollected([]);
    setStatus("Surf the light rails and capture each segment in sequence!");
    nextSegmentRef.current = 0;
    spawnTimerRef.current = 0;
  }, [currentRound]);

  const handlePlaySound = useCallback(() => {
    if (!currentRound) return;
    playSound(currentRound.audioUrl, currentRound.word);
    setStatus(`Listen in: ${currentRound.word}. Align the prisms!`);
  }, [currentRound]);

  const handleRestart = useCallback(() => {
    if (!currentRound) return;
    setEnergy(3);
    setGates([]);
    setCollected([]);
    setPlayerLane(1);
    nextSegmentRef.current = 0;
    spawnTimerRef.current = 0;
    setStatus("Fresh energy surge! Catch each segment in order.");
  }, [currentRound]);

  useEffect(() => {
    if (!currentRound || finished || energy === 0) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min(48, time - lastTime);
      lastTime = time;
      const step = delta / 16.67;

      const evaluations: Gate[] = [];

      setGates((prev) => {
        const updated: Gate[] = [];
        prev.forEach((gate) => {
          const progress = gate.progress + step * 1.4;
          if (progress >= 98) {
            evaluations.push({ ...gate, progress });
            return;
          }
          updated.push({ ...gate, progress });
        });
        return updated;
      });

      spawnTimerRef.current += delta;

      if (spawnTimerRef.current > 900 && nextSegmentRef.current < currentRound.segments.length) {
        const segment = currentRound.segments[nextSegmentRef.current];
        const correctLane = randomLane();
        const distractors: string[] = [];
        while (distractors.length < LANES - 1) {
          const candidate = randomSegment([segment, ...distractors]);
          if (!distractors.includes(candidate)) {
            distractors.push(candidate);
          }
        }
        const laneSegments = Array.from({ length: LANES }, (_, lane) => {
          if (lane === correctLane) return segment;
          const next = distractors.shift();
          return next ?? randomSegment([segment]);
        });
        const gate: Gate = {
          id: `${segment}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          laneSegments,
          correctLane,
          segment,
          progress: 0
        };
        setGates((prev) => [...prev, gate]);
        nextSegmentRef.current += 1;
        spawnTimerRef.current = 0;
      }

      if (evaluations.length > 0) {
        evaluations.forEach((gate) => {
          if (!targetSegment) return;
          if (gate.segment !== targetSegment) {
            return;
          }
          if (playerLane === gate.correctLane) {
            playSuccessTone();
            setCollected((prev) => [...prev, gate.segment]);
            setStatus(`Segment ${gate.segment} locked in!`);
          } else {
            let drained = false;
            let nextEnergy = energy;
            setEnergy((prev) => {
              const next = Math.max(0, prev - 1);
              nextEnergy = next;
              if (next === 0) {
                drained = true;
              }
              return next;
            });
            if (drained) {
              setStatus("Energy core depleted! Restarting the light run.");
              setTimeout(() => {
                handleRestart();
              }, 800);
            } else {
              setStatus(`Missed lane! Energy ${"⚡".repeat(nextEnergy)}.`);
            }
          }
        });
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [currentRound, energy, finished, handleRestart, playerLane, targetSegment]);

  useEffect(() => {
    if (!currentRound) return;
    if (energy === 0) {
      setStatus(`Run failed! The word was ${currentRound.word}. Try again.`);
    }
  }, [energy, currentRound]);

  useEffect(() => {
    if (!currentRound) return;
    if (collected.length === currentRound.segments.length && currentRound.segments.length > 0) {
      setStatus(`Prism trail complete! ${currentRound.word} is fully forged.`);
      setGates([]);
      setEnergy(3);
      setTimeout(() => {
        setRoundIndex((prev) => prev + 1);
      }, 1000);
    }
  }, [collected, currentRound]);

  useEffect(() => {
    if (finished && !celebrated) {
      setCelebrated(true);
      setStatus("Champion rider! Every prism trail now echoes your wordsmithing.");
      playCelebration();
    }
  }, [celebrated, finished]);

  const shiftLane = useCallback((delta: number) => {
    setPlayerLane((prev) => Math.min(LANES - 1, Math.max(0, prev + delta)));
  }, []);

  const handleLanePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      swipeActiveRef.current = true;
      swipePointerIdRef.current = event.pointerId;
      swipeLastXRef.current = event.clientX;
      swipeAccumulatedRef.current = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    []
  );

  const handleLanePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!swipeActiveRef.current) return;
      const delta = event.clientX - swipeLastXRef.current;
      swipeLastXRef.current = event.clientX;
      swipeAccumulatedRef.current += delta;
      const threshold = 36;
      while (swipeAccumulatedRef.current >= threshold) {
        shiftLane(1);
        swipeAccumulatedRef.current -= threshold;
      }
      while (swipeAccumulatedRef.current <= -threshold) {
        shiftLane(-1);
        swipeAccumulatedRef.current += threshold;
      }
    },
    [shiftLane]
  );

  const handleLanePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeActiveRef.current || swipePointerIdRef.current !== event.pointerId) return;
    swipeActiveRef.current = false;
    swipePointerIdRef.current = null;
    swipeAccumulatedRef.current = 0;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (error) {
      // ignore release errors when pointer capture was not set
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          shiftLane(-1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          shiftLane(1);
          break;
        case " ":
          event.preventDefault();
          handlePlaySound();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlaySound, shiftLane]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Prism Trail Chase</h2>
          <p className="text-sm text-slate-600">
            Dash through three glowing lanes and catch each word segment exactly when it aligns.
          </p>
        </div>
        {currentRound && (
          <span className="rounded-full bg-secondary/20 px-4 py-2 text-sm font-semibold text-slate-700">
            Run {roundIndex + 1} / {rounds.length}
          </span>
        )}
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-cyan-100 via-white to-purple-100 p-6 shadow">
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
                Recharge
              </button>
            )}
          </div>
        </div>
        {currentRound && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentRound.segments.map((segment, index) => (
              <span
                key={`${currentRound.id}-${segment}-${index}`}
                className={`flex h-10 items-center justify-center rounded-full border-2 px-4 text-sm font-bold transition-colors ${
                  index < collected.length
                    ? "border-success bg-success/20 text-success"
                    : index === collected.length
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {segment}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span>Energy:</span>
          <span>{energy > 0 ? Array.from({ length: energy }).map((_, index) => <span key={index}>⚡</span>) : "Empty"}</span>
        </div>
      </section>

      {finished && (
        <section className="rounded-3xl bg-success/20 p-6 text-lg font-bold text-success shadow">
          Stellar rider! Every prism highway now hums with your words.
        </section>
      )}

      {!finished && currentRound && (
        <section
          className="relative overflow-hidden rounded-3xl bg-slate-900/90 p-6 shadow-inner"
          onPointerDown={handleLanePointerDown}
          onPointerMove={handleLanePointerMove}
          onPointerUp={handleLanePointerUp}
          onPointerLeave={handleLanePointerUp}
          onPointerCancel={handleLanePointerUp}
          style={{ touchAction: "pan-y" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative mx-auto flex h-[360px] max-w-3xl flex-col justify-end">
            <div className="absolute inset-0 grid grid-cols-3 gap-4">
              {Array.from({ length: LANES }).map((_, lane) => (
                <div
                  key={lane}
                  className={`relative rounded-3xl border border-cyan-200/30 bg-gradient-to-b from-cyan-200/10 via-slate-900 to-slate-900 ${
                    lane === playerLane ? "shadow-[0_0_30px_rgba(56,189,248,0.5)]" : ""
                  }`}
                >
                  {gates
                    .filter((gate) => gate.laneSegments[lane])
                    .map((gate) => (
                      <motion.div
                        key={`${gate.id}-${lane}`}
                        className={`absolute left-1/2 flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-2 text-sm font-bold shadow-lg ${
                          gate.correctLane === lane
                            ? "border-amber-300 bg-amber-200/80 text-amber-900"
                            : "border-purple-400 bg-purple-200/60 text-purple-900"
                        }`}
                        animate={{ top: `${gate.progress}%` }}
                        transition={{ duration: 0.16, ease: "linear" }}
                      >
                        <span>{gate.laneSegments[lane]}</span>
                        <motion.span
                          className="text-xs font-semibold"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          ✧
                        </motion.span>
                      </motion.div>
                    ))}
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 gap-4">
              {Array.from({ length: LANES }).map((_, lane) => (
                <div key={lane} className="relative flex items-center justify-center">
                  {lane === playerLane && (
                    <motion.div
                      className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-gradient-to-br from-primary/20 via-primary/60 to-primary text-3xl shadow-2xl"
                      layoutId="player"
                      transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    >
                      🛼
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => shiftLane(-1)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-white/10 text-2xl text-white shadow"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => shiftLane(1)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-white/10 text-2xl text-white shadow"
            >
              →
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default PrismTrailChase;
