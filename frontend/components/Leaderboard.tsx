import React, { useState, useEffect } from 'react';

export const Leaderboard: React.FC = () => {
  const [filter, setFilter] = useState<'level' | 'wins'>('level');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">🏆 Leaderboard</h1>
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setFilter('level')}
            className={`px-6 py-2 rounded-lg font-bold ${
              filter === 'level' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            By Level
          </button>
          <button
            onClick={() => setFilter('wins')}
            className={`px-6 py-2 rounded-lg font-bold ${
              filter === 'wins' ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            By Wins
          </button>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-white text-center">
          Loading leaderboard...
        </div>
      </div>
    </div>
  );
};
