import React from 'react';

interface ActionButtonsProps {
  onAttack: () => void;
  onDefend: () => void;
  onSkill: () => void;
  onHeal: () => void;
  canAct: boolean;
  stamina: number;
  maxStamina: number;
}

const ACTION_COSTS = {
  attack: 20,
  defend: 15,
  skill: 40,
  heal: 25,
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAttack,
  onDefend,
  onSkill,
  onHeal,
  canAct,
  stamina,
  maxStamina,
}) => {
  const canAttack = canAct && stamina >= ACTION_COSTS.attack;
  const canDefend = canAct && stamina >= ACTION_COSTS.defend;
  const canUseSkill = canAct && stamina >= ACTION_COSTS.skill;
  const canUseHeal = canAct && stamina >= ACTION_COSTS.heal;

  const ActionButton: React.FC<{
    onClick: () => void;
    icon: string;
    label: string;
    cost: number;
    can: boolean;
  }> = ({ onClick, icon, label, cost, can }) => (
    <button
      onClick={onClick}
      disabled={!can}
      className={`py-4 px-6 rounded-lg font-bold transition-all flex flex-col items-center gap-2 ${
        can
          ? 'bg-gradient-to-br hover:shadow-lg active:scale-95'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
      }`}
      style={{
        background: can
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : undefined,
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm">{label}</span>
      <span className="text-xs opacity-75">{cost} stamina</span>
    </button>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Actions</h3>

      {/* Stamina Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">Stamina</span>
          <span className="text-sm text-gray-300">{Math.floor(stamina)}/{maxStamina}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-4 rounded-full transition-all"
            style={{ width: `${(stamina / maxStamina) * 100}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ActionButton
          onClick={onAttack}
          icon="⚔️"
          label="Attack"
          cost={ACTION_COSTS.attack}
          can={canAttack}
        />
        <ActionButton
          onClick={onDefend}
          icon="🛡️"
          label="Defend"
          cost={ACTION_COSTS.defend}
          can={canDefend}
        />
        <ActionButton
          onClick={onSkill}
          icon="✨"
          label="Skill"
          cost={ACTION_COSTS.skill}
          can={canUseSkill}
        />
        <ActionButton
          onClick={onHeal}
          icon="💚"
          label="Heal"
          cost={ACTION_COSTS.heal}
          can={canUseHeal}
        />
      </div>

      {!canAct && (
        <p className="text-center text-yellow-400 text-sm italic">Waiting for opponent...</p>
      )}
    </div>
  );
};
