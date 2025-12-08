import type { PunchType, DefenseType, CombatAction, DamageCalculation, FighterStats } from '@/types';

export class CombatSystem {
  private readonly punchDamageMap: { [key in PunchType]: number } = {
    JAB: 5,
    CROSS: 10,
    HOOK: 8,
    UPPERCUT: 12,
    BODY_SHOT: 7,
    THROAT_PUNCH: 6,
  };

  private readonly punchStaminaCost: { [key in PunchType]: number } = {
    JAB: 3,
    CROSS: 5,
    HOOK: 6,
    UPPERCUT: 8,
    BODY_SHOT: 7,
    THROAT_PUNCH: 5,
  };

  calculateDamage(
    attacker: FighterStats,
    defender: FighterStats,
    punchType: PunchType,
    isCritical: boolean = false
  ): DamageCalculation {
    let baseDamage = this.punchDamageMap[punchType];

    // Apply attacker power stat
    const powerMultiplier = 1 + attacker.power / 100;
    baseDamage *= powerMultiplier;

    // Critical hit multiplier
    let finalDamage = baseDamage;
    if (isCritical) {
      finalDamage *= 1.5;
    }

    // Defense reduction (simplified)
    const defenseReduction = Math.min(50, defender.defense);
    finalDamage *= 1 - defenseReduction / 100;

    // Add variance
    finalDamage += Math.random() * 4 - 2;
    finalDamage = Math.max(1, Math.round(finalDamage));

    const staminaUsed = this.punchStaminaCost[punchType];

    return {
      baseDamage: Math.round(baseDamage),
      finalDamage,
      isCritical,
      isBlocked: false,
      damageReduction: defenseReduction,
      staminaUsed,
    };
  }

  checkCriticalHit(fighter: FighterStats): boolean {
    const critChance = fighter.criticalHitChance || 10;
    return Math.random() * 100 < critChance;
  }

  isStaminaEnough(fighter: FighterStats, punchType: PunchType): boolean {
    const cost = this.punchStaminaCost[punchType];
    return fighter.stamina >= cost;
  }

  getComboMultiplier(consecutiveHits: number): number {
    // Every hit adds 5% multiplier, max 3x at 40 hits
    return Math.min(3, 1 + (consecutiveHits * 0.05));
  }

  calculateComboReward(baseDamage: number, comboCount: number): number {
    const multiplier = this.getComboMultiplier(comboCount);
    return Math.round(baseDamage * multiplier);
  }

  applyStaminaPenalty(fighter: FighterStats, cost: number): void {
    fighter.stamina = Math.max(0, fighter.stamina - cost);
  }

  recoverStamina(fighter: FighterStats, amount: number = 5): void {
    fighter.stamina = Math.min(fighter.maxStamina, fighter.stamina + amount);
  }

  calculateDefense(
    defender: FighterStats,
    defenseType: DefenseType
  ): { effectiveness: number; staminaCost: number } {
    const defenseStats: {
      [key in DefenseType]: { effectiveness: number; staminaCost: number };
    } = {
      BLOCK: { effectiveness: 0.7, staminaCost: 2 },
      DODGE: { effectiveness: 0.85, staminaCost: 5 },
      PARRY: { effectiveness: 0.75, staminaCost: 8 },
      RETREAT: { effectiveness: 0.5, staminaCost: 2 },
      CLINCH: { effectiveness: 0.9, staminaCost: 4 },
    };

    const baseStats = defenseStats[defenseType];
    const defenseMultiplier = 1 + defender.defense / 100;

    return {
      effectiveness: Math.min(0.95, baseStats.effectiveness * defenseMultiplier),
      staminaCost: baseStats.staminaCost,
    };
  }
}
