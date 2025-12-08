import React, { useState } from 'react';
import { useGameStore } from '@store/gameStore';

export const MatchLobby: React.FC = () => {
  const { setCurrentScreen } = useGameStore();
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'>('MEDIUM');
  const [wager, setWager] = useState(100);
  const [isSearching, setIsSearching] = useState(false);

  const handleStartMatch = () => {
    setIsSearching(true);
    // TODO: Connect to backend matchmaking
    setTimeout(() => {
      setCurrentScreen('COMBAT');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-secondary-dark flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-5xl font-display text-primary mb-12">⚙️ MATCH SETUP</h1>

      <div className="card max-w-md w-full space-y-6">
        {/* Difficulty Selection */}
        <div>
          <label className="block text-lg font-bold mb-3">Difficulty:</label>
          <div className="grid grid-cols-4 gap-2">
            {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`py-2 px-3 rounded font-bold transition-all ${
                  difficulty === level
                    ? 'bg-primary text-white scale-110'
                    : 'bg-secondary-dark text-gray-400 hover:bg-secondary'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Wager */}
        <div>
          <label className="block text-lg font-bold mb-3">Wager (RING Tokens):</label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={wager}
              onChange={(e) => setWager(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="text-2xl font-bold text-accent">{wager}</div>
          </div>
        </div>

        {/* Character Info */}
        <div className="bg-secondary-dark p-4 rounded">
          <p className="text-sm text-gray-400">Your Character: Fighter #1</p>
          <p className="text-sm text-gray-400 mt-1">Win Reward: {Math.floor(wager * 1.5)} tokens</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleStartMatch}
            disabled={isSearching}
            className={`w-full btn-primary py-4 text-xl font-bold rounded-lg transition-all ${
              isSearching
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105'
            }`}
          >
            {isSearching ? '🔍 SEARCHING...' : '🎮 FIND MATCH'}
          </button>

          <button
            onClick={() => setCurrentScreen('MENU')}
            className="w-full btn py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
          >
            ← BACK
          </button>
        </div>
      </div>
    </div>
  );
};
