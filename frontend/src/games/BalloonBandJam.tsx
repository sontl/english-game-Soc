import { useEffect, useMemo, useState } from "react";
import type { Word } from "@english-game/shared";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";
import { playCelebration, playSound, playSuccessTone } from "../utils/sound";

interface Option {
  id: string;
  wordId: string;
  label: string;
}

interface RoundData {
  id: string;
  target: Option;
  options: Option[];
  clue: string;
  audioUrl?: string;
  transcription?: string;
}

const toSentenceClue = (word: Word): string => {
  if (word.exampleSentence) {
    return word.exampleSentence.replace(new RegExp(word.text, "i"), "🎈");
  }
  return `Which balloon spells "${word.text}" just right?`;
};

const buildRounds = (words: Word[]): RoundData[] => {
  if (words.length === 0) return [];
  const shuffled = shuffle(words).slice(0, 6);
  return shuffled.map((word) => {
    const distractors = shuffle(words.filter((item) => item.id !== word.id)).slice(0, 2);
    const options = shuffle([
      { id: word.id, wordId: word.id, label: word.text },
      ...distractors.map((item) => ({ id: item.id, wordId: item.id, label: item.text }))
    ]);
    return {
      id: word.id,
      target: { id: word.id, wordId: word.id, label: word.text },
      options,
      clue: toSentenceClue(word),
      audioUrl: word.audioUrl,
      transcription: word.transcription
    } satisfies RoundData;
  });
};

const instruments = ["🥁", "🎸", "🎺", "🎹", "🎻", "🎷", "🪘", "🪗"];

const BalloonBandJam = () => {
  const { words } = useAppStore();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [message, setMessage] = useState("Tap the balloon that matches the tune!");
  const [band, setBand] = useState<Option[]>([]);
  const [celebrated, setCelebrated] = useState(false);
  const [disabled, setDisabled] = useState<string[]>([]);

  const currentRound = rounds[roundIndex];
  const finished = rounds.length > 0 && roundIndex >= rounds.length;

  useEffect(() => {
    setRoundIndex(0);
    setBand([]);
    setCelebrated(false);
    setDisabled([]);
    if (rounds.length === 0) {
      setMessage("Add words to the list and the balloon band will be ready to jam.");
    } else {
      setMessage("Tap the balloon that matches the tune!");
    }
  }, [rounds.length]);

  useEffect(() => {
    if (finished && !celebrated) {
      setCelebrated(true);
      setMessage("Encore! Your balloon band just rocked the parade.");
      playCelebration();
    }
  }, [celebrated, finished]);

  useEffect(() => {
    if (!currentRound || finished) {
      if (!currentRound && rounds.length === 0) {
        setMessage("Add words to the list and the balloon band will be ready to jam.");
      }
      return;
    }
    setMessage("Tap the balloon that matches the tune!");
    setDisabled([]);
  }, [currentRound, finished, rounds.length]);

  const handlePlaySound = () => {
    if (!currentRound) return;
    playSound(currentRound.audioUrl, currentRound.target.label);
    setMessage(`Listen: ${currentRound.target.label}!`);
  };

  const handleSelect = (option: Option) => {
    if (!currentRound || finished) return;
    if (disabled.includes(option.id)) return;

    if (option.wordId === currentRound.target.wordId) {
      playSuccessTone();
      setBand((prev) => [...prev, option]);
      setMessage(`${option.label} floats perfectly on beat!`);
      setDisabled(currentRound.options.map((item) => item.id));
      setTimeout(() => {
        setRoundIndex((prev) => prev + 1);
      }, 900);
      return;
    }

    setDisabled((prev) => [...prev, option.id]);
    setMessage(`Oops! ${option.label} is off-key. Try a different balloon.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Balloon Band Jam</h2>
          <p className="text-sm text-slate-600">
            Hear the word and pick the balloon that sings the right spelling.
          </p>
        </div>
        {currentRound && (
          <span className="rounded-full bg-secondary/20 px-4 py-2 text-sm font-semibold text-slate-700">
            Song {roundIndex + 1} / {rounds.length}
          </span>
        )}
      </header>

      <section className="rounded-3xl bg-gradient-to-r from-fuchsia-100 via-white to-sky-100 p-6 shadow">
        <div className="flex flex-col gap-3">
          <p className="text-lg font-semibold text-slate-800">{message}</p>
          {currentRound && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-white/70 px-3 py-1 font-semibold">
                Clue: {currentRound.clue}
              </span>
              {currentRound.transcription && (
                <span className="rounded-full bg-white/70 px-3 py-1 font-semibold">
                  {currentRound.transcription}
                </span>
              )}
              <button
                type="button"
                onClick={handlePlaySound}
                className="rounded-full bg-primary px-4 py-1 text-sm font-bold text-white shadow"
              >
                Play sound
              </button>
            </div>
          )}
        </div>
      </section>

      {finished && (
        <section className="rounded-3xl bg-success/20 p-6 text-lg font-bold text-success shadow">
          All balloons stayed in rhythm! Take a bow, band leader.
        </section>
      )}

      {!finished && currentRound && (
        <section className="grid gap-4 rounded-3xl bg-white/90 p-6 shadow md:grid-cols-3">
          {currentRound.options.map((option, index) => {
            const disabledOption = disabled.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex h-40 flex-col items-center justify-center gap-3 rounded-3xl border-4 text-xl font-extrabold shadow transition-all ${
                  disabledOption
                    ? "border-slate-200 bg-slate-100 text-slate-400"
                    : "border-primary/30 bg-gradient-to-br from-primary/20 via-white to-secondary/20 text-primary hover:-translate-y-1"
                }`}
                disabled={disabledOption}
              >
                <span className="text-4xl">🎈</span>
                <span>{option.label}</span>
                <span className="text-sm font-semibold text-slate-500">Beat {index + 1}</span>
              </button>
            );
          })}
        </section>
      )}

      {band.length > 0 && (
        <section className="rounded-3xl bg-white/80 p-5 shadow">
          <h3 className="text-lg font-bold text-slate-800">Band members</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {band.map((member, index) => (
              <span
                key={`${member.id}-${index}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <span>{instruments[index % instruments.length]}</span>
                <span>{member.label}</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BalloonBandJam;
