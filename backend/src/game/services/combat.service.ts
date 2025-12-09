import { Injectable, BadRequestException } from '@nestjs/common';

interface FighterStats {
  power: number;
  accuracy: number;
  defense?: number;
  evasion?: number;
  stamina?: number;
  health?: number;
}

interface BattleStats {
  health: number;
  damageDealt: number;
  damageReceived: number;
}

type StrikeType = 'JAB' | 'CROSS' | 'HOOK' | 'UPPERCUT' | 'GUARD' | 'SLIP';
type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

const STRIKE_DAMAGE: Record<StrikeType, { base: number; stamina: number }> = {
  JAB: { base: 8, stamina: 10 },
  CROSS: { base: 15, stamina: 12 },
  HOOK: { base: 20, stamina: 15 },
  UPPERCUT: { base: 25, stamina: 20 },
  GUARD: { base: 0, stamina: -15 }, // recovers stamina
  SLIP: { base: 0, stamina: 8 },
};

@Injectable()
export class CombatService {
  /**
   * Calculate damage based on attacker stats, defender stats, and strike type
   * Applies multipliers for accuracy, defense, and evasion
   */
  calculateDamage(
    attacker: FighterStats,
    defender: FighterStats,
    strikeType: StrikeType,
  ): number {
    // Validate inputs
    if (!attacker || !defender) {
      throw new BadRequestException('Invalid fighter stats');
    }

    if (!this.isValidStrike(strikeType)) {
      throw new BadRequestException(`Invalid strike type: ${strikeType}`);
    }

    // Cannot deal damage if out of stamina
    if ((attacker.stamina || 0) <= 0 && strikeType !== 'GUARD') {
      return 0;
    }

    // Non-damaging strikes
    if (strikeType === 'GUARD' || strikeType === 'SLIP') {
      return 0;
    }

    const baseStrikeDamage = STRIKE_DAMAGE[strikeType].base;

    // Attacker multiplier (power 100 = 1.0x, power 50 = 0.5x)
    const attackerMultiplier = (attacker.power || 50) / 100;

    // Accuracy vs Evasion (accuracy 100 vs evasion 0 = 1.0x, vs evasion 100 = 0.0x)
    const hitChance =
      ((attacker.accuracy || 80) - (defender.evasion || 50)) / 100;
    const accuracy = Math.max(0.1, Math.min(1, hitChance)); // clamp 0.1 - 1.0

    // Defense reduction
    const defenseReduction = (defender.defense || 50) / 200; // max 50% reduction
    const defenseMultiplier = 1 - defenseReduction;

    // Apply fatigue penalty if stamina low
    const fatigueMultiplier =
      (attacker.stamina || 100) > 30 ? 1 : 0.7 + ((attacker.stamina || 30) / 100) * 0.3;

    const totalDamage =
      baseStrikeDamage *
      attackerMultiplier *
      accuracy *
      defenseMultiplier *
      fatigueMultiplier;

    // Ensure no negative damage
    return Math.max(0, Math.round(totalDamage));
  }

  /**
   * Drain stamina based on strike type
   */
  drainStamina(currentStamina: number, strikeType: StrikeType): number {
    if (!this.isValidStrike(strikeType)) {
      throw new BadRequestException(`Invalid strike type: ${strikeType}`);
    }

    const staminaCost = STRIKE_DAMAGE[strikeType].stamina;
    const newStamina = Math.max(0, currentStamina - staminaCost);

    return newStamina;
  }

  /**
   * Recover stamina (mainly from GUARD action)
   */
  recoverStamina(currentStamina: number, action: StrikeType): number {
    if (action === 'GUARD') {
      return Math.min(100, currentStamina + 20);
    }
    if (action === 'SLIP') {
      return Math.min(100, currentStamina + 8);
    }
    return currentStamina;
  }

  /**
   * Apply fatigue effects when stamina is low
   */
  applyFatigue(stats: FighterStats, staminaPercentage: number): FighterStats {
    if (staminaPercentage > 30) {
      return stats;
    }

    const fatigueMultiplier = 0.7 + (staminaPercentage / 100) * 0.3;

    return {
      ...stats,
      power: Math.round((stats.power || 50) * fatigueMultiplier),
      accuracy: Math.round((stats.accuracy || 80) * fatigueMultiplier),
    };
  }

  /**
   * Check if fighter is knocked out (KO)
   */
  checkKO(health: number): boolean {
    return health <= 0;
  }

  /**
   * Add knockdown
   */
  addKnockdown(knockdownCount: number): number {
    return knockdownCount + 1;
  }

  /**
   * Reset knockdowns after round
   */
  resetKnockdowns(_knockdownCount: number): number {
    return 0;
  }

  /**
   * Check for TKO (3 consecutive knockdowns)
   */
  checkTKO(knockdownCount: number): boolean {
    return knockdownCount >= 3;
  }

  /**
   * Determine winner based on battle stats
   * Priority: KO > TKO > Points
   */
  determineWinner(
    player1Stats: BattleStats,
    player2Stats: BattleStats,
  ): number {
    // Check for KO
    if (player1Stats.health <= 0 && player2Stats.health > 0) return 2;
    if (player2Stats.health <= 0 && player1Stats.health > 0) return 1;
    if (player1Stats.health <= 0 && player2Stats.health <= 0) return 0; // double KO = draw

    // Compare by damage dealt (points)
    if (player1Stats.damageDealt > player2Stats.damageDealt) return 1;
    if (player2Stats.damageDealt > player1Stats.damageDealt) return 2;

    return 0; // tie
  }

  /**
   * Get AI move based on difficulty and current health
   */
  getAIMove(difficulty: AIDifficulty, currentHealth: number): StrikeType {
    const healthPercent = currentHealth / 100;

    if (difficulty === 'EASY') {
      return this.getRandomMove();
    }

    if (difficulty === 'MEDIUM') {
      // 50% random, 50% intelligent
      if (Math.random() > 0.5) {
        return this.getRandomMove();
      }
      return this.getIntelligentMove(healthPercent);
    }

    // HARD
    return this.getIntelligentMove(healthPercent);
  }

  private getRandomMove(): StrikeType {
    const moves: StrikeType[] = ['JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'GUARD', 'SLIP'];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private getIntelligentMove(healthPercent: number): StrikeType {
    // Low health = defensive
    if (healthPercent < 0.3) {
      return Math.random() > 0.5 ? 'GUARD' : 'SLIP';
    }

    // Medium health = balanced
    if (healthPercent < 0.6) {
      const rand = Math.random();
      if (rand > 0.6) return 'GUARD';
      if (rand > 0.3) return 'HOOK';
      return 'JAB';
    }

    // High health = aggressive
    const rand = Math.random();
    if (rand > 0.7) return 'UPPERCUT';
    if (rand > 0.4) return 'HOOK';
    return 'CROSS';
  }

  /**
   * Recovery between rounds
   */
  betweenRoundRecovery(currentStamina: number): number {
    return Math.min(100, currentStamina + 20);
  }

  /**
   * Reset per-round statistics
   */
  resetRoundStats(stats: any): any {
    return {
      ...stats,
      roundDamageDealt: 0,
      roundDamageTaken: 0,
    };
  }

  /**
   * Validate strike type
   */
  private isValidStrike(strikeType: string): strikeType is StrikeType {
    const validStrikes: StrikeType[] = [
      'JAB',
      'CROSS',
      'HOOK',
      'UPPERCUT',
      'GUARD',
      'SLIP',
    ];
    return validStrikes.includes(strikeType as StrikeType);
  }

  /**
   * Normalize stats to max 100
   */
  normalizeStats(stats: FighterStats): FighterStats {
    return {
      ...stats,
      power: Math.min(100, Math.max(0, stats.power || 0)),
      accuracy: Math.min(100, Math.max(0, stats.accuracy || 0)),
      defense: Math.min(100, Math.max(0, stats.defense || 0)),
      evasion: Math.min(100, Math.max(0, stats.evasion || 0)),
      stamina: Math.min(100, Math.max(0, stats.stamina || 0)),
      health: Math.min(100, Math.max(0, stats.health || 0)),
    };
  }

  /**
   * Simulate a full battle for testing
   */
  async simulateBattle(battleData: {
    player1: FighterStats;
    player2: FighterStats;
  }): Promise<{ winner: number; player1Damage: number; player2Damage: number }> {
    let player1Health = battleData.player1.health || 100;
    let player2Health = battleData.player2.health || 100;
    let player1Damage = 0;
    let player2Damage = 0;

    // Simulate 3 rounds
    for (let round = 0; round < 3; round++) {
      // Each round has ~60 exchanges
      for (let i = 0; i < 60; i++) {
        // Player 1 attacks
        const p1Move = this.getAIMove('MEDIUM', player1Health);
        const p1Dmg = this.calculateDamage(battleData.player1, battleData.player2, p1Move);
        player2Health = Math.max(0, player2Health - p1Dmg);
        player1Damage += p1Dmg;

        if (this.checkKO(player2Health)) break;

        // Player 2 attacks
        const p2Move = this.getAIMove('MEDIUM', player2Health);
        const p2Dmg = this.calculateDamage(battleData.player2, battleData.player1, p2Move);
        player1Health = Math.max(0, player1Health - p2Dmg);
        player2Damage += p2Dmg;

        if (this.checkKO(player1Health)) break;
      }

      if (this.checkKO(player1Health) || this.checkKO(player2Health)) break;
    }

    const winner = this.determineWinner(
      { health: player1Health, damageDealt: player1Damage, damageReceived: player2Damage },
      { health: player2Health, damageDealt: player2Damage, damageReceived: player1Damage },
    );

    return { winner, player1Damage, player2Damage };
  }
}
