// Game State Types

import type { CombatState, CombatResult } from './combat';

export type GameScreen = 
  | 'MENU'
  | 'CHARACTER_SELECT'
  | 'TRAINING'
  | 'MATCH_LOBBY'
  | 'COMBAT'
  | 'RESULTS'
  | 'LEADERBOARD'
  | 'SHOP';

export interface PlayerProfile {
  id: string;
  telegramId: string;
  username: string;
  avatar?: string;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  draws: number;
  totalMatches: number;
  winRate: number;
  ranking: number;
  ringTokens: number;
  createdAt: Date;
  lastActive: Date;
}

export interface Character {
  id: string;
  name: string;
  class: 'BRAWLER' | 'TECHNICAL' | 'COUNTER_PUNCHER' | 'SLUGGER';
  stats: {
    power: number;
    speed: number;
    stamina: number;
    defense: number;
  };
  specialMove: string;
  unlocked: boolean;
  price?: number;
}

export interface MatchConfig {
  rounds: number;
  roundDuration: number; // seconds
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  wagerAmount: number;
  mode: 'PRACTICE' | 'RANKED' | 'TOURNAMENT';
}

export interface GameState {
  currentScreen: GameScreen;
  player: PlayerProfile;
  selectedCharacter: Character | null;
  isLoading: boolean;
  error: string | null;
  combat: CombatState | null;
  lastMatchResult: CombatResult | null;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  avatar?: string;
  wins: number;
  winRate: number;
  ranking: number;
  totalMatches: number;
}

export interface ShopItem {
  id: string;
  type: 'CHARACTER' | 'SKIN' | 'EMOTE' | 'POWER_UP';
  name: string;
  description: string;
  price: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  image: string;
  owned: boolean;
}
