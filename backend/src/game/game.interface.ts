export interface CombatAction {
  attackerId: string;
  targetId: string;
  actionType: 'attack' | 'defend' | 'skill' | 'heal';
  damage?: number;
  timestamp: number;
}

export interface CombatStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  defense: number;
  attackPower: number;
  critChance: number;
}

export interface CombatResult {
  winner: string;
  loser: string;
  duration: number;
  totalDamage: number;
  round: number;
  expGained: number;
  coinsEarned: number;
}

export interface PlayerProgress {
  level: number;
  experience: number;
  nextLevelExp: number;
  progressPercent: number;
  stats: CombatStats;
  coins: number;
  wins: number;
  losses: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  experience: number;
  wins: number;
  combats: number;
  winRate: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  reward: number;
  earnedAt?: Date;
}
