import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';

export class CombatUI {
  private scene: Phaser.Scene;
  private player: Fighter;
  private opponent: Fighter;
  
  // UI Elements
  private playerHealthBar!: Phaser.GameObjects.Graphics;
  private opponentHealthBar!: Phaser.GameObjects.Graphics;
  private playerStaminaBar!: Phaser.GameObjects.Graphics;
  private opponentStaminaBar!: Phaser.GameObjects.Graphics;
  
  private roundText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  
  private playerStatsText!: Phaser.GameObjects.Text;
  private opponentStatsText!: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene, player: Fighter, opponent: Fighter) {
    this.scene = scene;
    this.player = player;
    this.opponent = opponent;
    
    this.createUI();
  }
  
  private createUI(): void {
    const width = this.scene.cameras.main.width;
    
    // Player health bar (left)
    this.createHealthBar(50, 50, true);
    this.createStaminaBar(50, 100, true);
    
    // Opponent health bar (right)
    this.createHealthBar(width - 450, 50, false);
    this.createStaminaBar(width - 450, 100, false);
    
    // Round and timer
    this.roundText = this.scene.add.text(width / 2, 30, 'Round 1', {
      fontSize: '32px',
      color: '#FFD23F',
      fontStyle: 'bold',
    });
    this.roundText.setOrigin(0.5, 0);
    
    this.timerText = this.scene.add.text(width / 2, 70, '3:00', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.timerText.setOrigin(0.5, 0);
    
    // Message text (center)
    this.messageText = this.scene.add.text(width / 2, 400, '', {
      fontSize: '72px',
      color: '#FF6B35',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    this.messageText.setOrigin(0.5);
    this.messageText.setAlpha(0);
    
    // Stats text
    this.playerStatsText = this.scene.add.text(50, 130, '', {
      fontSize: '16px',
      color: '#ffffff',
    });
    
    this.opponentStatsText = this.scene.add.text(width - 450, 130, '', {
      fontSize: '16px',
      color: '#ffffff',
    });
    
    // Controls hint
    const controlsText = this.scene.add.text(
      width / 2,
      1050,
      'Q:Jab W:Cross E:Hook R:Uppercut | SPACE:Block SHIFT:Dodge',
      {
        fontSize: '18px',
        color: '#888888',
      }
    );
    controlsText.setOrigin(0.5, 1);
  }
  
  private createHealthBar(x: number, y: number, isPlayer: boolean): void {
    const graphics = this.scene.add.graphics();
    
    if (isPlayer) {
      this.playerHealthBar = graphics;
    } else {
      this.opponentHealthBar = graphics;
    }
    
    // Background
    graphics.fillStyle(0x333333);
    graphics.fillRect(x, y, 400, 30);
    
    // Label
    const label = this.scene.add.text(x, y - 20, 'HEALTH', {
      fontSize: '16px',
      color: '#ffffff',
    });
  }
  
  private createStaminaBar(x: number, y: number, isPlayer: boolean): void {
    const graphics = this.scene.add.graphics();
    
    if (isPlayer) {
      this.playerStaminaBar = graphics;
    } else {
      this.opponentStaminaBar = graphics;
    }
    
    // Background
    graphics.fillStyle(0x333333);
    graphics.fillRect(x, y, 400, 20);
    
    // Label
    const label = this.scene.add.text(x, y - 18, 'STAMINA', {
      fontSize: '14px',
      color: '#888888',
    });
  }
  
  update(round: number, timer: number): void {
    // Update round
    this.roundText.setText(`Round ${round}`);
    
    // Update timer
    const minutes = Math.floor(timer / 60);
    const seconds = Math.floor(timer % 60);
    this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    
    // Update health bars
    this.updateHealthBar(this.playerHealthBar, this.player, 50, 50);
    this.updateHealthBar(this.opponentHealthBar, this.opponent, this.scene.cameras.main.width - 450, 50);
    
    // Update stamina bars
    this.updateStaminaBar(this.playerStaminaBar, this.player, 50, 100);
    this.updateStaminaBar(this.opponentStaminaBar, this.opponent, this.scene.cameras.main.width - 450, 100);
    
    // Update stats
    this.updateStats();
  }
  
  private updateHealthBar(graphics: Phaser.GameObjects.Graphics, fighter: Fighter, x: number, y: number): void {
    graphics.clear();
    
    // Background
    graphics.fillStyle(0x333333);
    graphics.fillRect(x, y, 400, 30);
    
    // Health
    const healthPercent = fighter.stats.health / fighter.stats.maxHealth;
    const healthColor = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffaa00 : 0xff0000;
    graphics.fillStyle(healthColor);
    graphics.fillRect(x, y, 400 * healthPercent, 30);
    
    // Text
    const healthText = this.scene.add.text(
      x + 200,
      y + 15,
      `${Math.ceil(fighter.stats.health)} / ${fighter.stats.maxHealth}`,
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    );
    healthText.setOrigin(0.5);
  }
  
  private updateStaminaBar(graphics: Phaser.GameObjects.Graphics, fighter: Fighter, x: number, y: number): void {
    graphics.clear();
    
    // Background
    graphics.fillStyle(0x333333);
    graphics.fillRect(x, y, 400, 20);
    
    // Stamina
    const staminaPercent = fighter.stats.stamina / fighter.stats.maxStamina;
    graphics.fillStyle(0xFFD23F);
    graphics.fillRect(x, y, 400 * staminaPercent, 20);
  }
  
  private updateStats(): void {
    this.playerStatsText.setText(
      `Combo: x${this.player['comboCount'] || 0}\n` +
      `Damage: ${Math.round(this.player['damageDealt'] || 0)}`
    );
    
    this.opponentStatsText.setText(
      `Combo: x${this.opponent['comboCount'] || 0}\n` +
      `Damage: ${Math.round(this.opponent['damageDealt'] || 0)}`
    );
  }
  
  showMessage(text: string, duration: number): void {
    this.messageText.setText(text);
    
    this.scene.tweens.add({
      targets: this.messageText,
      alpha: 1,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.scene.time.delayedCall(duration - 400, () => {
          this.scene.tweens.add({
            targets: this.messageText,
            alpha: 0,
            duration: 200,
          });
        });
      },
    });
  }
}
