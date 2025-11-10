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
  week: number;
  words: Word[];
  loading: boolean;
  dyslexiaMode: boolean;
  initialize: () => void;
  setWeek: (week: number) => Promise<void>;
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
    week: 1,
    words: [],
    loading: false,
    dyslexiaMode: false,
    initialize: () => {
      void get().setWeek(get().week);
    },
    setWeek: async (week: number) => {
      set({ loading: true, week });
      try {
        const words = await fetchWords(week);
        set({ words, loading: false });
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
