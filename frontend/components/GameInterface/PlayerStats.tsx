import React from 'react';

interface PlayerStatsProps {
  playerName: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  health: number;
  maxHealth: number;
  attackPower: number;
  defense: number;
  coins: number;
  wins: number;
  losses: number;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({
  playerName,
  level,
  experience,
  nextLevelExp,
  health,
  maxHealth,
  attackPower,
  defense,
  coins,
  wins,
  losses,
}) => {
  const progressPercent = ((experience / nextLevelExp) * 100).toFixed(1);
  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0';

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Player Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{playerName}</h2>
        <p className="text-gray-400">Level {level}</p>
      </div>

      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-semibold text-gray-300">Health</span>
          <span className="text-sm text-gray-300">{health}/{maxHealth}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-6">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full transition-all"
            style={{ width: `${(health / maxHealth) * 100}%` }}
          />
        </div>
      </div>

      {/* Experience Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-semibold text-gray-300">Experience</span>
          <span className="text-sm text-gray-300">{experience}/{nextLevelExp}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{progressPercent}% to next level</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Attack Power</p>
          <p className="text-yellow-400 text-2xl font-bold">{attackPower}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Defense</p>
          <p className="text-blue-400 text-2xl font-bold">{defense}</p>
        </div>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-gray-400 text-xs">Coins</p>
          <p className="text-yellow-500 font-bold">{coins}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-gray-400 text-xs">Wins</p>
          <p className="text-green-400 font-bold">{wins}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-gray-400 text-xs">Win Rate</p>
          <p className="text-purple-400 font-bold">{winRate}%</p>
        </div>
      </div>
    </div>
  );
};
