import { create } from 'zustand';
import { CombatState, CombatResult } from '@types/combat';

interface CombatStoreState {
  combatState: CombatState | null;
  matchHistory: CombatResult[];
  setCombatState: (state: CombatState) => void;
  updateCombatState: (partial: Partial<CombatState>) => void;
  addMatchResult: (result: CombatResult) => void;
  resetCombat: () => void;
}

export const useCombatStore = create<CombatStoreState>((set) => ({
  combatState: null,
  matchHistory: [],
  
  setCombatState: (combatState) => set({ combatState }),
  
  updateCombatState: (partial) => 
    set((state) => ({
      combatState: state.combatState ? { ...state.combatState, ...partial } : null,
    })),
  
  addMatchResult: (result) =>
    set((state) => ({
      matchHistory: [...state.matchHistory, result],
    })),
  
  resetCombat: () =>
    set({
      combatState: null,
    }),
}));
