import Phaser from 'phaser';
import { FighterStats, PunchType, DefenseType } from '@types/combat';
import { PUNCH_CONFIGS, DEFENSE_CONFIGS } from '../constants';
import { CombatCalculator } from '../utils/CombatCalculator';
import { GAME_CONFIG } from '../config';

export class Fighter extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Image;
  private nameText: Phaser.GameObjects.Text;
  
  public stats: FighterStats;
  public name: string;
  public isPlayer: boolean;
  
  private isDefending: boolean = false;
  private currentDefense: DefenseType | null = null;
  private lastAttackTime: number = 0;
  private comboCount: number = 0;
  private comboTimer: number = 0;
  
  // Round statistics
  private damageDealt: number = 0;
  private damageReceived: number = 0;
  private accurateHits: number = 0;
  private criticalHits: number = 0;
  private combosLanded: number = 0;
  private roundScore: number = 0;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    name: string,
    stats: FighterStats,
    isPlayer: boolean
  ) {
    super(scene, x, y);
    
    this.name = name;
    this.stats = { ...stats };
    this.isPlayer = isPlayer;
    
    // Create sprite
    this.sprite = scene.add.image(0, 0, texture);
    this.sprite.setScale(0.5);
    if (!isPlayer) {
      this.sprite.setFlipX(true);
    }
    this.add(this.sprite);
    
    // Name text
    this.nameText = scene.add.text(0, -250, name, {
      fontSize: '24px',
      color: isPlayer ? '#FF6B35' : '#004E89',
      fontStyle: 'bold',
    });
    this.nameText.setOrigin(0.5);
    this.add(this.nameText);
    
    scene.add.existing(this);
  }
  
  update(delta: number): void {
    // Regenerate stamina
    if (this.stats.stamina < this.stats.maxStamina) {
      this.stats.stamina = CombatCalculator.calculateStaminaRegen(
        this.stats.stamina,
        this.stats.maxStamina,
        delta
      );
    }
    
    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }
    
    // Reset defense after short time
    if (this.isDefending) {
      // Defense lasts for 500ms
      this.scene.time.delayedCall(500, () => {
        this.isDefending = false;
        this.currentDefense = null;
      });
    }
  }
  
  attack(punchType: PunchType, target: Fighter): void {
    const now = Date.now();
    if (now - this.lastAttackTime < GAME_CONFIG.punchCooldown) {
      return; // Cooldown not finished
    }
    
    const punchConfig = PUNCH_CONFIGS[punchType];
    
    // Check stamina
    if (this.stats.stamina < punchConfig.staminaCost) {
      console.log(`${this.name} - Not enough stamina!`);
      return;
    }
    
    // Check if attack hits
    const hits = CombatCalculator.doesAttackHit(
      punchConfig,
      this.stats.speed,
      target.stats.speed
    );
    
    if (!hits) {
      console.log(`${this.name} - ${punchType} MISSED!`);
      this.stats.stamina -= punchConfig.staminaCost * 0.5;
      this.playAnimation('punch_miss');
      return;
    }
    
    // Calculate damage
    const damageCalc = CombatCalculator.calculateDamage(
      this.stats,
      target.stats,
      punchConfig,
      target.isDefending,
      target.currentDefense ? DEFENSE_CONFIGS[target.currentDefense] : undefined
    );
    
    // Apply damage
    target.takeDamage(damageCalc.finalDamage, damageCalc.isCritical);
    
    // Update stats
    this.stats.stamina -= punchConfig.staminaCost;
    this.lastAttackTime = now;
    this.damageDealt += damageCalc.finalDamage;
    this.accurateHits++;
    
    if (damageCalc.isCritical) {
      this.criticalHits++;
    }
    
    // Update combo
    this.comboCount++;
    this.comboTimer = 1500; // 1.5 seconds to continue combo
    
    if (this.comboCount >= 3) {
      this.combosLanded++;
    }
    
    // Visual feedback
    this.playAnimation(punchType.toLowerCase());
    this.shakeCamera(damageCalc.isCritical ? 10 : 5);
    
    console.log(
      `${this.name} - ${punchType} ${damageCalc.isCritical ? 'CRITICAL!' : ''} ` +
      `Damage: ${damageCalc.finalDamage} (Combo x${this.comboCount})`
    );
    
    // Check for knockout
    const koChance = CombatCalculator.calculateKnockoutChance(
      target.stats.health,
      damageCalc.finalDamage,
      damageCalc.isCritical
    );
    
    if (Math.random() * 100 < koChance) {
      target.knockout();
    }
  }
  
  defend(defenseType: DefenseType): void {
    const defenseConfig = DEFENSE_CONFIGS[defenseType];
    
    if (this.stats.stamina < defenseConfig.staminaCost) {
      console.log(`${this.name} - Not enough stamina to defend!`);
      return;
    }
    
    this.isDefending = true;
    this.currentDefense = defenseType;
    this.stats.stamina -= defenseConfig.staminaCost;
    
    this.playAnimation(defenseType.toLowerCase());
    console.log(`${this.name} - ${defenseType}`);
  }
  
  takeDamage(damage: number, isCritical: boolean): void {
    this.stats.health = Math.max(0, this.stats.health - damage);
    this.damageReceived += damage;
    
    // Visual feedback
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });
    
    // Screen shake for player
    if (this.isPlayer) {
      this.shakeCamera(isCritical ? 15 : 8);
    }
  }
  
  knockout(): void {
    console.log(`${this.name} - KNOCKED OUT!`);
    this.playAnimation('knockdown');
    this.stats.health = 0;
  }
  
  isKnockedOut(): boolean {
    return this.stats.health <= 0;
  }
  
  getRoundScore(): number {
    this.roundScore = CombatCalculator.calculateRoundPoints(
      this.damageDealt,
      this.accurateHits,
      this.criticalHits,
      this.combosLanded
    );
    return this.roundScore;
  }
  
  getTotalScore(): number {
    // Sum of all rounds (simplified)
    return this.getRoundScore();
  }
  
  resetRoundStats(): void {
    this.damageDealt = 0;
    this.damageReceived = 0;
    this.accurateHits = 0;
    this.criticalHits = 0;
    this.combosLanded = 0;
    this.roundScore = 0;
    this.comboCount = 0;
    
    // Restore some health and stamina
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + 20);
    this.stats.stamina = this.stats.maxStamina;
  }
  
  private resetCombo(): void {
    if (this.comboCount >= 3) {
      console.log(`${this.name} - Combo ended! (${this.comboCount} hits)`);
    }
    this.comboCount = 0;
  }
  
  private playAnimation(anim: string): void {
    // Placeholder - animations will be implemented later
    // this.sprite.play(anim);
  }
  
  private shakeCamera(intensity: number): void {
    if (GAME_CONFIG.screenShake) {
      this.scene.cameras.main.shake(100, intensity / 1000);
    }
  }
}
