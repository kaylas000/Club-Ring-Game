import React, { useState, useEffect } from 'react';
import { useCombatStore } from '@store/combatStore';

export const GameHUD: React.FC = () => {
  const { combatState } = useCombatStore();
  const [timerDisplay, setTimerDisplay] = useState('3:00');

  useEffect(() => {
    if (!combatState) return;
    
    const minutes = Math.floor(combatState.roundTimeRemaining / 60);
    const seconds = Math.floor(combatState.roundTimeRemaining % 60);
    setTimerDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, [combatState?.roundTimeRemaining]);

  if (!combatState) return null;

  const playerHealthPercent = (combatState.player.health / combatState.player.maxHealth) * 100;
  const opponentHealthPercent = (combatState.opponent.health / combatState.opponent.maxHealth) * 100;
  const playerStaminaPercent = (combatState.player.stamina / combatState.player.maxStamina) * 100;
  const opponentStaminaPercent = (combatState.opponent.stamina / combatState.opponent.maxStamina) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Round and Timer */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-4xl font-display text-accent font-bold">Round {combatState.round}</div>
        <div className="text-5xl font-bold text-white font-display">{timerDisplay}</div>
      </div>

      {/* Player Stats (Left) */}
      <div className="absolute top-4 left-4">
        <div className="text-sm text-white mb-2">PLAYER</div>
        
        {/* Health Bar */}
        <div className="w-80 bg-gray-700 rounded h-8 overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-300"
            style={{
              width: `${playerHealthPercent}%`,
              backgroundImage: playerHealthPercent > 60 
                ? 'linear-gradient(to right, #10b981, #059669)'
                : playerHealthPercent > 30
                ? 'linear-gradient(to right, #f59e0b, #d97706)'
                : 'linear-gradient(to right, #ef4444, #dc2626)',
            }}
          />
        </div>
        <div className="text-white text-sm font-bold mb-4">
          {Math.ceil(combatState.player.health)} / {combatState.player.maxHealth}
        </div>

        {/* Stamina Bar */}
        <div className="w-80 bg-gray-700 rounded h-4 overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-200"
            style={{ width: `${playerStaminaPercent}%` }}
          />
        </div>
      </div>

      {/* Opponent Stats (Right) */}
      <div className="absolute top-4 right-4">
        <div className="text-sm text-white mb-2 text-right">OPPONENT</div>
        
        {/* Health Bar */}
        <div className="w-80 bg-gray-700 rounded h-8 overflow-hidden mb-2">
          <div
            className="h-full ml-auto transition-all duration-300"
            style={{
              width: `${opponentHealthPercent}%`,
              backgroundImage: opponentHealthPercent > 60 
                ? 'linear-gradient(to right, #10b981, #059669)'
                : opponentHealthPercent > 30
                ? 'linear-gradient(to right, #f59e0b, #d97706)'
                : 'linear-gradient(to right, #ef4444, #dc2626)',
            }}
          />
        </div>
        <div className="text-white text-sm font-bold text-right mb-4">
          {Math.ceil(combatState.opponent.health)} / {combatState.opponent.maxHealth}
        </div>

        {/* Stamina Bar */}
        <div className="w-80 bg-gray-700 rounded h-4 overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-200 ml-auto"
            style={{ width: `${opponentStaminaPercent}%` }}
          />
        </div>
      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm text-gray-400">
        <p>Q:Jab W:Cross E:Hook R:Uppercut A:Body S:Throat</p>
        <p>SPACE:Block SHIFT:Dodge D:Parry</p>
      </div>
    </div>
  );
};
