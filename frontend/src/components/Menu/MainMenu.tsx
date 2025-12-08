import React from 'react';
import { useGameStore } from '@store/gameStore';

export const MainMenu: React.FC = () => {
  const { setCurrentScreen } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-secondary-dark flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-7xl font-display mb-4 text-primary animate-float">🥊 CLUB RING</h1>
      <p className="text-2xl mb-12 text-accent">Telegram Boxing Game</p>

      <div className="space-y-4 w-full max-w-md">
        <button
          onClick={() => setCurrentScreen('MATCH_LOBBY')}
          className="btn btn-primary w-full py-4 text-xl font-bold rounded-lg transition-all hover:scale-105"
        >
          🎮 START MATCH
        </button>

        <button
          onClick={() => setCurrentScreen('TRAINING')}
          className="btn btn-secondary w-full py-4 text-xl font-bold rounded-lg transition-all hover:scale-105 bg-secondary-light"
        >
          🏋️ TRAINING
        </button>

        <button
          onClick={() => setCurrentScreen('LEADERBOARD')}
          className="btn btn-secondary w-full py-4 text-xl font-bold rounded-lg transition-all hover:scale-105 bg-secondary-light"
        >
          🏆 LEADERBOARD
        </button>

        <button
          onClick={() => setCurrentScreen('SHOP')}
          className="btn btn-secondary w-full py-4 text-xl font-bold rounded-lg transition-all hover:scale-105 bg-secondary-light"
        >
          🛍️ SHOP
        </button>
      </div>

      <div className="mt-16 text-center text-sm text-gray-400">
        <p>v0.1.0 - MVP Phase</p>
        <p>© 2025 Club Ring Team</p>
      </div>
    </div>
  );
};
