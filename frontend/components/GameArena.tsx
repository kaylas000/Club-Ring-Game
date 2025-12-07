import React, { useState } from 'react';

export const GameArena: React.FC<{ combatId: string }> = ({ combatId }) => {
  const [round, setRound] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Round {round}</h2>
        <p className="text-gray-400 text-center">Battle Arena - Combat ID: {combatId}</p>
      </div>
    </div>
  );
};
