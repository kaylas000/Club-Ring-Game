// Core Combat Types based on COMBAT_SYSTEM_SPEC.md

export type PunchType = 'JAB' | 'CROSS' | 'HOOK' | 'UPPERCUT' | 'BODY_SHOT' | 'THROAT_PUNCH';

export type DefenseType = 'BLOCK' | 'DODGE' | 'PARRY' | 'RETREAT' | 'CLINCH';

export type ComboTier = 'SIMPLE' | 'ADVANCED' | 'ULTIMATE';

export interface PunchStats {
  type: PunchType;
  baseDamage: number;
  staminaCost: number;
  speed: number; // milliseconds
  accuracy: number; // 0-100
  critChance: number; // 0-100
  critMultiplier: number;
  range: 'close' | 'medium' | 'long';
}

export interface DefenseStats {
  type: DefenseType;
  effectiveness: number; // 0-100
  staminaCost: number;
  counterChance: number; // 0-100
  damageReduction: number; // 0-100
}

export interface FighterStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  power: number;
  speed: number;
  defense: number;
  criticalHitChance: number;
}

export interface CombatState {
  round: number;
  maxRounds: number;
  player: FighterStats;
  opponent: FighterStats;
  comboCount: number;
  lastAction: PunchType | DefenseType | null;
  isPlayerTurn: boolean;
  roundTimeRemaining: number;
}

export interface ComboConfig {
  tier: ComboTier;
  moves: PunchType[];
  powerMultiplier: number;
  staminaBonus: number;
  requiredAccuracy: number;
}

export interface DamageCalculation {
  baseDamage: number;
  finalDamage: number;
  isCritical: boolean;
  isBlocked: boolean;
  damageReduction: number;
  staminaUsed: number;
}

export interface CombatAction {
  type: 'ATTACK' | 'DEFEND';
  moveType: PunchType | DefenseType;
  damage?: number;
  stamina: number;
  timestamp: number;
  success: boolean;
  isCritical?: boolean;
}

export interface CombatResult {
  winner: 'player' | 'opponent' | 'draw';
  reason: 'knockout' | 'points' | 'stamina' | 'timeout';
  playerScore: number;
  opponentScore: number;
  totalRounds: number;
  duration: number; // seconds
}
