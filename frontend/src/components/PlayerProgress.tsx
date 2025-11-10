import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPlayerProgress } from "../services/api";
import { useAppStore } from "../store/appStore";

interface ProgressEntry {
  id: string;
  playerId: string;
  wordId: string;
  correctCount: number;
  lastSeen?: string;
}

const PlayerProgress = () => {
  const { activePlayer, words } = useAppStore();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePlayer) return;

    const loadProgress = async () => {
      setLoading(true);
      try {
        const data = await getPlayerProgress(activePlayer.id);
        setProgress(data);
      } catch (error) {
        console.error("Failed to load progress:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadProgress();
  }, [activePlayer]);

  if (!activePlayer) {
    return (
      <div className="rounded-3xl bg-white/80 p-6 text-center shadow">
        <p className="text-slate-600">Select a player to view their progress.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white/80 p-6 text-center shadow">
        <p className="text-slate-600">Loading progress...</p>
      </div>
    );
  }

  const progressWithWords = progress
    .map((entry) => {
      const word = words.find((w) => w.id === entry.wordId);
      return word ? { ...entry, word } : null;
    })
    .filter((entry) => entry !== null);

  const masteredWords = progressWithWords.filter((entry) => entry.correctCount >= 3);
  const practicingWords = progressWithWords.filter(
    (entry) => entry.correctCount > 0 && entry.correctCount < 3
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-6 shadow">
        <h3 className="mb-4 text-xl font-bold text-slate-800">
          {activePlayer.name}&apos;s Progress
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-3xl font-extrabold text-primary">{progressWithWords.length}</div>
            <div className="text-sm text-slate-600">Words Practiced</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-3xl font-extrabold text-success">{masteredWords.length}</div>
            <div className="text-sm text-slate-600">Words Mastered</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-3xl font-extrabold text-accent">{practicingWords.length}</div>
            <div className="text-sm text-slate-600">Still Practicing</div>
          </div>
        </div>
      </div>

      {masteredWords.length > 0 && (
        <div className="rounded-3xl bg-white/80 p-6 shadow">
          <h4 className="mb-3 text-lg font-bold text-success">✨ Mastered Words</h4>
          <div className="flex flex-wrap gap-2">
            {masteredWords.map((entry) => (
              <motion.div
                key={entry.id}
                className="flex items-center gap-2 rounded-full bg-success/20 px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-bold text-success">{entry.word.text}</span>
                <span className="text-xs text-success/70">×{entry.correctCount}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {practicingWords.length > 0 && (
        <div className="rounded-3xl bg-white/80 p-6 shadow">
          <h4 className="mb-3 text-lg font-bold text-accent">📚 Keep Practicing</h4>
          <div className="flex flex-wrap gap-2">
            {practicingWords.map((entry) => (
              <motion.div
                key={entry.id}
                className="flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-bold text-accent">{entry.word.text}</span>
                <span className="text-xs text-accent/70">×{entry.correctCount}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i < entry.correctCount ? "bg-accent" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {progressWithWords.length === 0 && (
        <div className="rounded-3xl bg-white/80 p-6 text-center shadow">
          <p className="text-slate-600">
            {activePlayer.name} hasn&apos;t played any games yet. Start playing to track progress!
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerProgress;
