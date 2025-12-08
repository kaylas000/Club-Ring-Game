// Punch configurations based on COMBAT_SYSTEM_SPEC.md
import { PunchStats, DefenseStats, ComboConfig } from '@types/combat';

export const PUNCH_CONFIGS: Record<string, PunchStats> = {
  JAB: {
    type: 'JAB',
    baseDamage: 8,
    staminaCost: 5,
    speed: 200,
    accuracy: 90,
    critChance: 5,
    critMultiplier: 1.3,
    range: 'long',
  },
  CROSS: {
    type: 'CROSS',
    baseDamage: 15,
    staminaCost: 12,
    speed: 400,
    accuracy: 75,
    critChance: 15,
    critMultiplier: 1.5,
    range: 'medium',
  },
  HOOK: {
    type: 'HOOK',
    baseDamage: 20,
    staminaCost: 18,
    speed: 500,
    accuracy: 65,
    critChance: 20,
    critMultiplier: 1.6,
    range: 'close',
  },
  UPPERCUT: {
    type: 'UPPERCUT',
    baseDamage: 25,
    staminaCost: 25,
    speed: 600,
    accuracy: 55,
    critChance: 30,
    critMultiplier: 2.0,
    range: 'close',
  },
  BODY_SHOT: {
    type: 'BODY_SHOT',
    baseDamage: 18,
    staminaCost: 15,
    speed: 450,
    accuracy: 70,
    critChance: 12,
    critMultiplier: 1.4,
    range: 'medium',
  },
  THROAT_PUNCH: {
    type: 'THROAT_PUNCH',
    baseDamage: 35,
    staminaCost: 40,
    speed: 700,
    accuracy: 40,
    critChance: 50,
    critMultiplier: 2.5,
    range: 'close',
  },
};

export const DEFENSE_CONFIGS: Record<string, DefenseStats> = {
  BLOCK: {
    type: 'BLOCK',
    effectiveness: 70,
    staminaCost: 8,
    counterChance: 15,
    damageReduction: 70,
  },
  DODGE: {
    type: 'DODGE',
    effectiveness: 85,
    staminaCost: 12,
    counterChance: 40,
    damageReduction: 100,
  },
  PARRY: {
    type: 'PARRY',
    effectiveness: 90,
    staminaCost: 15,
    counterChance: 60,
    damageReduction: 100,
  },
  RETREAT: {
    type: 'RETREAT',
    effectiveness: 60,
    staminaCost: 5,
    counterChance: 0,
    damageReduction: 50,
  },
  CLINCH: {
    type: 'CLINCH',
    effectiveness: 80,
    staminaCost: 10,
    counterChance: 0,
    damageReduction: 90,
  },
};

export const COMBO_CONFIGS: ComboConfig[] = [
  {
    tier: 'SIMPLE',
    moves: ['JAB', 'CROSS'],
    powerMultiplier: 1.2,
    staminaBonus: 5,
    requiredAccuracy: 70,
  },
  {
    tier: 'SIMPLE',
    moves: ['JAB', 'JAB', 'CROSS'],
    powerMultiplier: 1.3,
    staminaBonus: 8,
    requiredAccuracy: 75,
  },
  {
    tier: 'ADVANCED',
    moves: ['JAB', 'CROSS', 'HOOK'],
    powerMultiplier: 1.5,
    staminaBonus: 12,
    requiredAccuracy: 80,
  },
  {
    tier: 'ADVANCED',
    moves: ['HOOK', 'UPPERCUT', 'CROSS'],
    powerMultiplier: 1.6,
    staminaBonus: 15,
    requiredAccuracy: 82,
  },
  {
    tier: 'ULTIMATE',
    moves: ['JAB', 'JAB', 'CROSS', 'HOOK', 'UPPERCUT'],
    powerMultiplier: 2.0,
    staminaBonus: 25,
    requiredAccuracy: 90,
  },
];

// Animation keys
export const ANIMATIONS = {
  IDLE: 'idle',
  WALK_FORWARD: 'walk_forward',
  WALK_BACKWARD: 'walk_backward',
  GUARD: 'guard',
  JAB: 'jab',
  CROSS: 'cross',
  HOOK: 'hook',
  UPPERCUT: 'uppercut',
  BODY_SHOT: 'body_shot',
  THROAT_PUNCH: 'throat_punch',
  BLOCK: 'block',
  DODGE: 'dodge',
  HIT: 'hit',
  KNOCKDOWN: 'knockdown',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
};

// Audio keys
export const SOUNDS = {
  PUNCH_HIT: 'punch_hit',
  PUNCH_MISS: 'punch_miss',
  BLOCK: 'block',
  CRITICAL_HIT: 'critical_hit',
  BELL: 'bell',
  CROWD_CHEER: 'crowd_cheer',
  CROWD_BOOS: 'crowd_boos',
  KNOCKOUT: 'knockout',
  MUSIC_MENU: 'music_menu',
  MUSIC_FIGHT: 'music_fight',
};
