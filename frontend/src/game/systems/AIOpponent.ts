import { FighterStats, PunchType, DefenseType } from '@types/combat';
import { PUNCH_CONFIGS, DEFENSE_CONFIGS } from '../constants';

export class AIOpponent {
  private difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  private stats: FighterStats;
  private decisionCooldown: number = 0;
  
  constructor(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT', stats: FighterStats) {
    this.difficulty = difficulty;
    this.stats = stats;
  }
  
  decideAction(
    playerHealth: number,
    playerStamina: number,
    selfHealth: number
  ): { type: 'ATTACK' | 'DEFEND'; move: PunchType | DefenseType } | null {
    this.decisionCooldown--;
    if (this.decisionCooldown > 0) return null;
    
    this.decisionCooldown = this.getDecisionFrequency();
    
    // Determine action based on difficulty
    const actionProbability = Math.random();
    
    if (selfHealth < 30) {
      // Low health - defend more
      if (actionProbability < 0.7) {
        return { type: 'DEFEND', move: this.getRandomDefense() };
      }
    }
    
    if (playerHealth > 60) {
      // Opponent has high health - attack more
      if (actionProbability < 0.6) {
        return { type: 'ATTACK', move: this.getRandomAttack() };
      }
    }
    
    // Mix of attacks and defense
    if (actionProbability < 0.5) {
      return { type: 'ATTACK', move: this.getRandomAttack() };
    } else {
      return { type: 'DEFEND', move: this.getRandomDefense() };
    }
  }
  
  private getDecisionFrequency(): number {
    switch (this.difficulty) {
      case 'EASY':
        return Math.floor(Math.random() * 30) + 20; // 20-50
      case 'MEDIUM':
        return Math.floor(Math.random() * 20) + 10; // 10-30
      case 'HARD':
        return Math.floor(Math.random() * 10) + 5; // 5-15
      case 'EXPERT':
        return Math.floor(Math.random() * 5) + 2; // 2-7
    }
  }
  
  private getRandomAttack(): PunchType {
    const attacks: PunchType[] = ['JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'BODY_SHOT'];
    return attacks[Math.floor(Math.random() * attacks.length)];
  }
  
  private getRandomDefense(): DefenseType {
    const defenses: DefenseType[] = ['BLOCK', 'DODGE', 'PARRY'];
    return defenses[Math.floor(Math.random() * defenses.length)];
  }
}
