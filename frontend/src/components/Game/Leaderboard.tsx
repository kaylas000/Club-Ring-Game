import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  wins: number;
  winRate: number;
  ranking: number;
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    const mockData: LeaderboardEntry[] = [
      { rank: 1, username: 'Champion_X', wins: 150, winRate: 92.3, ranking: 1500 },
      { rank: 2, username: 'Shadow_King', wins: 128, winRate: 88.5, ranking: 1280 },
      { rank: 3, username: 'Iron_Fist', wins: 112, winRate: 85.2, ranking: 1120 },
      { rank: 4, username: 'Thunder_Bob', wins: 95, winRate: 82.1, ranking: 950 },
      { rank: 5, username: 'Phoenix_Rise', wins: 87, winRate: 79.8, ranking: 870 },
    ];
    setEntries(mockData);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-secondary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-display text-primary mb-8 text-center">🏆 LEADERBOARD</h1>

        {loading ? (
          <div className="text-center text-white text-2xl">Loading...</div>
        ) : (
          <div className="bg-secondary-dark rounded-xl overflow-hidden">
            <table className="w-full text-white">
              <thead className="bg-primary">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Rank</th>
                  <th className="px-6 py-4 text-left font-bold">Player</th>
                  <th className="px-6 py-4 text-right font-bold">Wins</th>
                  <th className="px-6 py-4 text-right font-bold">Win Rate</th>
                  <th className="px-6 py-4 text-right font-bold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.rank} className="border-t border-gray-700 hover:bg-secondary transition">
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-accent"># {entry.rank}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold">{entry.username}</span>
                    </td>
                    <td className="px-6 py-4 text-right">{entry.wins}</td>
                    <td className="px-6 py-4 text-right text-green-400">{entry.winRate}%</td>
                    <td className="px-6 py-4 text-right font-bold text-accent">{entry.ranking}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
