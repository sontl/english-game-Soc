import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "../store/appStore";
import { createSession, endSession, updateProgress, logAnalyticsEvent } from "../services/api";

interface UseGameTrackingOptions {
  gameId: string;
  enabled?: boolean;
}

export const useGameTracking = ({ gameId, enabled = true }: UseGameTrackingOptions) => {
  const { activePlayer } = useAppStore();
  const sessionIdRef = useRef<string | null>(null);
  const trackedWordsRef = useRef<Set<string>>(new Set());

  // Start session when game loads
  useEffect(() => {
    if (!enabled || !activePlayer) return;

    const startGameSession = async () => {
      try {
        const session = await createSession(activePlayer.id);
        sessionIdRef.current = session.id;

        // Log game played event
        await logAnalyticsEvent("played_game", activePlayer.id, gameId);
      } catch (error) {
        console.error("Failed to start game session:", error);
      }
    };

    void startGameSession();

    // End session when component unmounts
    return () => {
      if (sessionIdRef.current) {
        void endSession(sessionIdRef.current).catch((error) => {
          console.error("Failed to end session:", error);
        });
      }
    };
  }, [activePlayer, gameId, enabled]);

  // Track word seen
  const trackWordSeen = useCallback(
    async (wordId: string) => {
      if (!enabled || !activePlayer || trackedWordsRef.current.has(wordId)) return;

      try {
        trackedWordsRef.current.add(wordId);
        await logAnalyticsEvent("word_seen", activePlayer.id, gameId, wordId);
      } catch (error) {
        console.error("Failed to track word seen:", error);
      }
    },
    [activePlayer, gameId, enabled]
  );

  // Track correct answer
  const trackCorrectAnswer = useCallback(
    async (wordId: string) => {
      if (!enabled || !activePlayer) return;

      try {
        await updateProgress(activePlayer.id, wordId, 1);
      } catch (error) {
        console.error("Failed to track correct answer:", error);
      }
    },
    [activePlayer, enabled]
  );

  // Track audio replay
  const trackAudioReplay = useCallback(
    async (wordId: string) => {
      if (!enabled || !activePlayer) return;

      try {
        await logAnalyticsEvent("replay_audio", activePlayer.id, gameId, wordId);
      } catch (error) {
        console.error("Failed to track audio replay:", error);
      }
    },
    [activePlayer, gameId, enabled]
  );

  return {
    trackWordSeen,
    trackCorrectAnswer,
    trackAudioReplay,
    isTracking: enabled && !!activePlayer
  };
};
