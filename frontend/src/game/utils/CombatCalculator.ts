import { PunchStats, DefenseStats, FighterStats, DamageCalculation } from '@types/combat';
import { GAME_CONFIG } from '../config';

export class CombatCalculator {
  /**
   * Calculate damage for an attack
   */
  static calculateDamage(
    attacker: FighterStats,
    defender: FighterStats,
    punch: PunchStats,
    isDefending: boolean = false,
    defenseStats?: DefenseStats,
  ): DamageCalculation {
    // Base damage with attacker's power modifier
    const baseDamage = punch.baseDamage * (1 + attacker.power / 100);
    
    // Check for critical hit
    const isCritical = Math.random() * 100 < punch.critChance * (1 + attacker.criticalHitChance / 100);
    let finalDamage = isCritical ? baseDamage * punch.critMultiplier : baseDamage;
    
    // Apply defense
    let damageReduction = 0;
    let isBlocked = false;
    
    if (isDefending && defenseStats) {
      isBlocked = Math.random() * 100 < defenseStats.effectiveness;
      if (isBlocked) {
        damageReduction = defenseStats.damageReduction;
        finalDamage *= (1 - damageReduction / 100);
      }
    }
    
    // Apply defender's defense stat
    finalDamage *= (1 - defender.defense / 200);
    
    // Ensure damage is not negative
    finalDamage = Math.max(0, Math.round(finalDamage));
    
    return {
      baseDamage,
      finalDamage,
      isCritical,
      isBlocked,
      damageReduction,
      staminaUsed: punch.staminaCost,
    };
  }
  
  /**
   * Calculate combo multiplier
   */
  static calculateComboMultiplier(comboCount: number): number {
    if (comboCount < 2) return 1.0;
    if (comboCount < 4) return 1.2;
    if (comboCount < 6) return 1.4;
    return 1.6;
  }
  
  /**
   * Check if attack hits based on accuracy
   */
  static doesAttackHit(punch: PunchStats, attackerSpeed: number, defenderSpeed: number): boolean {
    const speedDifference = attackerSpeed - defenderSpeed;
    const accuracyModifier = speedDifference / 100;
    const finalAccuracy = Math.min(100, punch.accuracy + accuracyModifier);
    
    return Math.random() * 100 < finalAccuracy;
  }
  
  /**
   * Calculate stamina regeneration
   */
  static calculateStaminaRegen(currentStamina: number, maxStamina: number, deltaTime: number): number {
    if (currentStamina >= maxStamina) return maxStamina;
    
    const regenAmount = (GAME_CONFIG.staminaRegenRate * deltaTime) / 1000;
    return Math.min(maxStamina, currentStamina + regenAmount);
  }
  
  /**
   * Check for counter attack opportunity
   */
  static canCounterAttack(defenseStats: DefenseStats): boolean {
    return Math.random() * 100 < defenseStats.counterChance;
  }
  
  /**
   * Calculate knockout probability
   */
  static calculateKnockoutChance(currentHealth: number, damage: number, isCritical: boolean): number {
    const healthPercentage = currentHealth / 100;
    let koChance = 0;
    
    if (healthPercentage < 0.2) {
      koChance = 30;
    } else if (healthPercentage < 0.4) {
      koChance = 15;
    } else if (healthPercentage < 0.6) {
      koChance = 5;
    }
    
    if (isCritical) {
      koChance *= 2;
    }
    
    if (damage > 30) {
      koChance += 10;
    }
    
    return Math.min(100, koChance);
  }
  
  /**
   * Calculate points for round scoring
   */
  static calculateRoundPoints(
    damageDealt: number,
    accurateHits: number,
    criticalHits: number,
    combosLanded: number,
  ): number {
    let points = 0;
    
    // Damage points
    points += damageDealt * 0.5;
    
    // Accuracy bonus
    points += accurateHits * 2;
    
    // Critical hit bonus
    points += criticalHits * 5;
    
    // Combo bonus
    points += combosLanded * 10;
    
    return Math.round(points);
  }
}
