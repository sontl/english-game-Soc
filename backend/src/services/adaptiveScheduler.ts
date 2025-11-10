import { ProgressEntry } from "@english-game/shared";

interface ScheduleInput {
  progress: ProgressEntry[];
  limit?: number;
}

export const scheduleWords = ({ progress, limit = 10 }: ScheduleInput) => {
  return progress
    .map((entry) => {
      const attempts = entry.correctCount + entry.incorrectCount || 1;
      const errorRate = entry.incorrectCount / attempts;
      const lastSeenScore = Date.now() - new Date(entry.lastSeen).getTime();
      const priority = errorRate * 0.7 + Math.min(lastSeenScore / (1000 * 60 * 60 * 24), 5) * 0.3;

      return {
        wordId: entry.wordId,
        priority
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
};
