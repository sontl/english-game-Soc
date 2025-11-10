import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Word } from "@english-game/shared";
import { fetchWords } from "../services/api";

interface PlayerProfile {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface AppState {
  players: PlayerProfile[];
  activePlayer?: PlayerProfile;
  term: number;
  week: number;
  words: Word[];
  loading: boolean;
  dyslexiaMode: boolean;
  mode: "scheduled" | "random";
  initialize: () => void;
  setWeek: (term: number, week: number) => Promise<void>;
  loadRandomWords: (count?: number) => Promise<void>;
  setActivePlayer: (player: PlayerProfile) => void;
  toggleDyslexiaMode: () => void;
  setWords: (words: Word[]) => void;
}

const defaultPlayers: PlayerProfile[] = [
  { id: "1", name: "Mai", avatarUrl: "/avatars/sunflower.png" },
  { id: "2", name: "Liam", avatarUrl: "/avatars/rocket.png" }
];

export const useAppStore = create<AppState>()(
  devtools((set, get) => ({
    players: defaultPlayers,
    activePlayer: defaultPlayers[0],
    term: 1,
    week: 4,
    words: [],
    loading: false,
    dyslexiaMode: false,
    mode: "scheduled",
    initialize: () => {
      const { term, week, setWeek } = get();
      void setWeek(term, week);
    },
    setWeek: async (term: number, week: number) => {
      const scheduleCode = term * 100 + week;
      set({ loading: true, term, week, mode: "scheduled" });
      try {
        const words = await fetchWords(scheduleCode);
        set({ words, loading: false });
      } catch (error) {
        console.error(error);
        set({ loading: false });
      }
    },
    loadRandomWords: async (count = 10) => {
      set({ loading: true, mode: "random" });
      try {
        const pool = await fetchWords();
        const selectionCount = Math.min(count, pool.length);
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        set({ words: shuffled.slice(0, selectionCount), loading: false });
      } catch (error) {
        console.error(error);
        set({ loading: false });
      }
    },
    setActivePlayer: (player) => set({ activePlayer: player }),
    toggleDyslexiaMode: () => set((state) => ({ dyslexiaMode: !state.dyslexiaMode })),
    setWords: (words) => set({ words })
  }))
);
