import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export const GameArena: React.FC<{ combatId: string }> = ({ combatId }) => {
  const [combat, setCombat] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string>('attack');
  const socket = useGameStore((state) => state.socket);

  useEffect(() => {
    if (!socket) return;

    socket.on(`combat:${combatId}:update`, (data) => {
      setCombat(data);
    });

    return () => {
      socket.off(`combat:${combatId}:update`);
    };
  }, [socket, combatId]);

  const executeAction = (actionType: string) => {
    if (!socket) return;

    socket.emit('combat:action', {
      combatId,
      actionType,
    });

    setSelectedAction(actionType);
  };

  if (!combat) return <div className="text-white text-center py-8">Loading battle...</div>;

  const player1 = combat.stats?.player1 || { health: 100, maxHealth: 100, stamina: 80, maxStamina: 80, attackPower: 15, defense: 10 };
  const player2 = combat.stats?.player2 || { health: 100, maxHealth: 100, stamina: 80, maxStamina: 80, attackPower: 15, defense: 10 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Round {combat.round || 0}</h2>
          <p className="text-gray-400">Battle Arena</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Player 1 */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500">
            <h3 className="text-xl font-bold text-blue-400 mb-4">You</h3>
            
            <div className="text-center mb-4">
              <div className="w-24 h-24 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-4xl">⚔️</span>
              </div>
              <p className="mt-2 text-white">Level {combat.player1Level || 1}</p>
            </div>

            {/* HP Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-gray-300">HP</span>
                <span className="text-sm text-gray-300">{Math.floor(player1.health)}/{player1.maxHealth}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{
                    width: `${(player1.health / player1.maxHealth) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Stamina Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-gray-300">Stamina</span>
                <span className="text-sm text-gray-300">{Math.floor(player1.stamina)}/{player1.maxStamina}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-yellow-500 h-4 rounded-full transition-all"
                  style={{
                    width: `${(player1.stamina / player1.maxStamina) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-700 p-2 rounded">
                <span className="text-gray-400">Attack:</span>
                <p className="text-blue-400 font-bold">{player1.attackPower}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <span className="text-gray-400">Defense:</span>
                <p className="text-green-400 font-bold">{player1.defense}</p>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-red-500">
            <h3 className="text-xl font-bold text-red-400 mb-4">Opponent</h3>
            
            <div className="text-center mb-4">
              <div className="w-24 h-24 mx-auto bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-4xl">👹</span>
              </div>
              <p className="mt-2 text-white">Level {combat.player2Level || 1}</p>
            </div>

            {/* HP Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-gray-300">HP</span>
                <span className="text-sm text-gray-300">{Math.floor(player2.health)}/{player2.maxHealth}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{
                    width: `${(player2.health / player2.maxHealth) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Stamina Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-gray-300">Stamina</span>
                <span className="text-sm text-gray-300">{Math.floor(player2.stamina)}/{player2.maxStamina}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-yellow-500 h-4 rounded-full transition-all"
                  style={{
                    width: `${(player2.stamina / player2.maxStamina) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-700 p-2 rounded">
                <span className="text-gray-400">Attack:</span>
                <p className="text-red-400 font-bold">{player2.attackPower}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <span className="text-gray-400">Defense:</span>
                <p className="text-green-400 font-bold">{player2.defense}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700 max-h-40 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4">Battle Log</h3>
          <div className="space-y-2">
            {(combat.log || []).slice(-8).map((entry: string, idx: number) => (
              <p key={idx} className="text-gray-300 text-sm">{entry}</p>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => executeAction('attack')}
            className={`py-4 px-6 rounded-lg font-bold transition-all ${
              selectedAction === 'attack'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-red-700'
            }`}
          >
            ⚔️ Attack
          </button>
          <button
            onClick={() => executeAction('defend')}
            className={`py-4 px-6 rounded-lg font-bold transition-all ${
              selectedAction === 'defend'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-blue-700'
            }`}
          >
            🛡️ Defend
          </button>
          <button
            onClick={() => executeAction('skill')}
            className={`py-4 px-6 rounded-lg font-bold transition-all ${
              selectedAction === 'skill'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-purple-700'
            }`}
          >
            ✨ Skill
          </button>
          <button
            onClick={() => executeAction('heal')}
            className={`py-4 px-6 rounded-lg font-bold transition-all ${
              selectedAction === 'heal'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-green-700'
            }`}
          >
            💚 Heal
          </button>
        </div>

        {/* Action Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-sm text-gray-400">
          <p>Basic Attack<br/>Cost: 20 stamina</p>
          <p>Increase Defense<br/>Cost: 15 stamina</p>
          <p>Powerful Attack<br/>Cost: 40 stamina</p>
          <p>Restore HP<br/>Cost: 25 stamina</p>
        </div>
      </div>
    </div>
  );
};
