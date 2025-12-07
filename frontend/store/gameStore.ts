import create from 'zustand';

interface GameState {
  currentPlayer: any | null;
  currentCombat: any | null;
  leaderboard: any[];
  achievements: any[];
  socket: any;
  
  setCurrentPlayer: (player: any) => void;
  setCurrentCombat: (combat: any) => void;
  updateLeaderboard: (leaderboard: any[]) => void;
  addAchievement: (achievement: any) => void;
  setSocket: (socket: any) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentPlayer: null,
  currentCombat: null,
  leaderboard: [],
  achievements: [],
  socket: null,

  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setCurrentCombat: (combat) => set({ currentCombat: combat }),
  updateLeaderboard: (leaderboard) => set({ leaderboard }),
  addAchievement: (achievement) => 
    set((state) => ({
      achievements: [...state.achievements, achievement],
    })),
  setSocket: (socket) => set({ socket }),
}));
