import { create } from 'zustand';
import { GameState, PlayerProfile, Character } from '@types/game';

interface GameStoreState extends GameState {
  setCurrentScreen: (screen: string) => void;
  setPlayer: (player: PlayerProfile) => void;
  setSelectedCharacter: (character: Character | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  currentScreen: 'MENU',
  player: null,
  selectedCharacter: null,
  isLoading: false,
  error: null,
  combat: null,
  lastMatchResult: null,
  
  setCurrentScreen: (currentScreen) => set({ currentScreen }),
  setPlayer: (player) => set({ player }),
  setSelectedCharacter: (selectedCharacter) => set({ selectedCharacter }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
