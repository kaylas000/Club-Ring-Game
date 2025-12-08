import { CombatAction, FighterStats } from '@types/combat';
import { PUNCH_CONFIGS, DEFENSE_CONFIGS } from '../constants';
import { CombatCalculator } from '../utils/CombatCalculator';

export class CombatSystem {
  private actions: CombatAction[] = [];
  private staminaManager: Map<string, number> = new Map();
  
  recordAction(action: CombatAction): void {
    this.actions.push(action);
  }
  
  executeAttack(
    attacker: FighterStats,
    defender: FighterStats,
    punchType: string
  ): CombatAction | null {
    const punchConfig = PUNCH_CONFIGS[punchType];
    if (!punchConfig) return null;
    
    // Check stamina
    const currentStamina = this.staminaManager.get(attacker.id) || attacker.stamina;
    if (currentStamina < punchConfig.staminaCost) return null;
    
    // Calculate damage
    const damageCalc = CombatCalculator.calculateDamage(
      attacker,
      defender,
      punchConfig
    );
    
    // Update stamina
    this.staminaManager.set(
      attacker.id,
      currentStamina - punchConfig.staminaCost
    );
    
    // Create action record
    const action: CombatAction = {
      type: 'ATTACK',
      moveType: punchType,
      damage: damageCalc.finalDamage,
      stamina: punchConfig.staminaCost,
      timestamp: Date.now(),
      success: true,
      isCritical: damageCalc.isCritical,
    };
    
    this.recordAction(action);
    return action;
  }
  
  executeDefense(
    fighter: FighterStats,
    defenseType: string
  ): CombatAction | null {
    const defenseConfig = DEFENSE_CONFIGS[defenseType];
    if (!defenseConfig) return null;
    
    const action: CombatAction = {
      type: 'DEFEND',
      moveType: defenseType,
      stamina: defenseConfig.staminaCost,
      timestamp: Date.now(),
      success: true,
    };
    
    this.recordAction(action);
    return action;
  }
  
  getActionHistory(): CombatAction[] {
    return [...this.actions];
  }
  
  reset(): void {
    this.actions = [];
    this.staminaManager.clear();
  }
}
