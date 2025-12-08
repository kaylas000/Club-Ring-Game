import { create } from 'zustand';
import type { GameState, PlayerProfile, GameScreen } from '@/types';

interface GameStoreState extends GameState {
  setCurrentScreen: (screen: GameScreen) => void;
  setPlayer: (player: PlayerProfile) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const initialPlayer: PlayerProfile = {
  id: '',
  telegramId: '',
  username: '',
  level: 1,
  experience: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  totalMatches: 0,
  winRate: 0,
  ranking: 0,
  ringTokens: 0,
  createdAt: new Date(),
  lastActive: new Date(),
};

export const useGameStore = create<GameStoreState>((set) => ({
  currentScreen: 'MENU',
  player: initialPlayer,
  selectedCharacter: null,
  isLoading: false,
  error: null,
  combat: null,
  lastMatchResult: null,

  setCurrentScreen: (screen: GameScreen) =>
    set({ currentScreen: screen }),

  setPlayer: (player: PlayerProfile) =>
    set({ player }),

  setError: (error: string | null) =>
    set({ error }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),
}));
