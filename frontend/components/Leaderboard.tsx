import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filter, setFilter] = useState<'level' | 'wins'>('level');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const endpoint = filter === 'level' ? '/api/game/leaderboard/level' : '/api/game/leaderboard/wins';
        const response = await axios.get(endpoint);
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter]);

  if (loading) {
    return <div className="text-white text-center">Loading leaderboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">🏆 Leaderboard</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setFilter('level')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              filter === 'level'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-blue-700'
            }`}
          >
            By Level
          </button>
          <button
            onClick={() => setFilter('wins')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              filter === 'wins'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-purple-700'
            }`}
          >
            By Wins
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-900 font-bold text-gray-300 border-b border-gray-700">
            <div>Rank</div>
            <div>Name</div>
            <div>Level</div>
            <div>{filter === 'level' ? 'Experience' : 'Wins'}</div>
            <div>Battles</div>
            <div>Win Rate</div>
          </div>

          <div className="divide-y divide-gray-700">
            {leaderboard.map((player, idx) => {
              const winRate = player.combats > 0 
                ? ((player.wins / player.combats) * 100).toFixed(1) 
                : '0';

              return (
                <div key={idx} className="grid grid-cols-6 gap-4 p-4 text-white hover:bg-gray-700 transition">
                  <div className="font-bold">
                    {idx === 0 && '🥇'}
                    {idx === 1 && '🥈'}
                    {idx === 2 && '🥉'}
                    {idx > 2 && `#${idx + 1}`}
                  </div>
                  <div className="truncate">{player.name}</div>
                  <div className="text-blue-400 font-semibold">{player.level}</div>
                  <div className="text-yellow-400">
                    {filter === 'level' ? player.experience : player.wins}
                  </div>
                  <div className="text-gray-300">{player.combats || 0}</div>
                  <div className="text-green-400">{winRate}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
