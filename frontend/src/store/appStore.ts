import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Word } from "@english-game/shared";
import {
  fetchWords,
  fetchPlayers,
  createPlayer as apiCreatePlayer,
  updatePlayer as apiUpdatePlayer,
  deletePlayer as apiDeletePlayer,
  type PlayerProfile
} from "../services/api";

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
  loadPlayers: () => Promise<void>;
  addPlayer: (name: string, avatarUrl?: string) => Promise<void>;
  updatePlayerInfo: (id: string, name?: string, avatarUrl?: string) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
}

const defaultPlayers: PlayerProfile[] = [
  { id: "1", name: "Mai", avatarUrl: "/avatars/sunflower.png", parentId: "default", createdAt: new Date().toISOString() },
  { id: "2", name: "Liam", avatarUrl: "/avatars/rocket.png", parentId: "default", createdAt: new Date().toISOString() }
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
      const { term, week, setWeek, loadPlayers } = get();
      void loadPlayers();
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
    setWords: (words) => set({ words }),
    loadPlayers: async () => {
      try {
        const players = await fetchPlayers();
        if (players.length > 0) {
          set({ players, activePlayer: players[0] });
        }
      } catch (error) {
        console.error("Failed to load players, using defaults", error);
      }
    },
    addPlayer: async (name: string, avatarUrl?: string) => {
      try {
        const newPlayer = await apiCreatePlayer({ name, avatarUrl });
        set((state) => ({ players: [...state.players, newPlayer] }));
      } catch (error) {
        console.error("Failed to create player", error);
        throw error;
      }
    },
    updatePlayerInfo: async (id: string, name?: string, avatarUrl?: string) => {
      try {
        const updated = await apiUpdatePlayer(id, { name, avatarUrl });
        set((state) => ({
          players: state.players.map((p) => (p.id === id ? updated : p)),
          activePlayer: state.activePlayer?.id === id ? updated : state.activePlayer
        }));
      } catch (error) {
        console.error("Failed to update player", error);
        throw error;
      }
    },
    removePlayer: async (id: string) => {
      try {
        await apiDeletePlayer(id);
        set((state) => {
          const players = state.players.filter((p) => p.id !== id);
          const activePlayer = state.activePlayer?.id === id ? players[0] : state.activePlayer;
          return { players, activePlayer };
        });
      } catch (error) {
        console.error("Failed to delete player", error);
        throw error;
      }
    }
  }))
);
