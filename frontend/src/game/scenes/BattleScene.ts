import Phaser from 'phaser';

export class BattleScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private opponent: Phaser.Physics.Arcade.Sprite | null = null;
  private ring: Phaser.GameObjects.Graphics | null = null;
  private playerHealthBar: Phaser.GameObjects.Rectangle | null = null;
  private opponentHealthBar: Phaser.GameObjects.Rectangle | null = null;
  private roundText: Phaser.GameObjects.Text | null = null;
  private timerText: Phaser.GameObjects.Text | null = null;

  private playerHP = 100;
  private opponentHP = 100;
  private currentRound = 1;
  private roundTime = 180; // 3 minutes in seconds
  private isRoundActive = true;

  constructor() {
    super({ key: 'BattleScene' });
  }

  preload() {
    // Load boxing ring assets
    this.load.image('ring_bg', '/assets/ring_background.png');
    this.load.image('ring_floor', '/assets/ring_floor.png');
    this.load.image('ring_ropes', '/assets/ring_ropes.png');
    
    // Load fighter animations (placeholder - will use Spine later)
    this.load.spritesheet('fighter_idle', '/assets/fighters/idle.png', {
      frameWidth: 128,
      frameHeight: 256,
    });
  }

  create() {
    // Set camera
    this.cameras.main.setBounds(0, 0, 1920, 1080);
    this.cameras.main.setZoom(0.5);

    // Create ring
    this.createRing();

    // Create fighters
    this.createFighters();

    // Create HUD
    this.createHUD();

    // Setup input
    this.setupInput();

    // Start round timer
    this.startRoundTimer();
  }

  private createRing(): void {
    const centerX = 960;
    const centerY = 540;

    // Ring floor (brown color)
    const floor = this.add.rectangle(centerX, centerY, 600, 600, 0x8B4513);
    floor.setDepth(0);

    // Ring border (ropes visualization)
    const border = this.add.graphics();
    border.lineStyle(8, 0xC41E3A, 1); // Red rope color
    border.strokeRectShape(
      new Phaser.Geom.Rectangle(centerX - 300, centerY - 300, 600, 600)
    );
    border.setDepth(1);

    // Ring corner pads
    this.createCornerPads(centerX, centerY);

    this.ring = border;
  }

  private createCornerPads(centerX: number, centerY: number): void {
    const padSize = 40;
    const distance = 300;

    // Red corner (player)
    this.add.rectangle(
      centerX - distance,
      centerY - distance,
      padSize,
      padSize,
      0xFF0000
    );

    // Blue corner (opponent)
    this.add.rectangle(
      centerX + distance,
      centerY + distance,
      padSize,
      padSize,
      0x0000FF
    );
  }

  private createFighters(): void {
    const centerX = 960;
    const centerY = 540;

    // Player fighter (left side)
    this.player = this.physics.add.sprite(centerX - 200, centerY, 'fighter_idle');
    this.player.setScale(1);
    this.player.setCollideWorldBounds(true);
    this.player.setData('health', 100);
    this.player.setData('stamina', 100);
    this.player.setTint(0xff0000); // Red tint for player

    // Opponent fighter (right side)
    this.opponent = this.physics.add.sprite(
      centerX + 200,
      centerY,
      'fighter_idle'
    );
    this.opponent.setScale(1);
    this.opponent.setCollideWorldBounds(true);
    this.opponent.setData('health', 100);
    this.opponent.setData('stamina', 100);
    this.opponent.setTint(0x0000ff); // Blue tint for opponent

    // Create simple animations
    if (!this.anims.exists('fighter_idle')) {
      this.anims.create({
        key: 'fighter_idle',
        frames: this.anims.generateFrameNumbers('fighter_idle', {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.player.play('fighter_idle');
    this.opponent.play('fighter_idle');
  }

  private createHUD(): void {
    const padding = 20;

    // Player health bar background
    const playerHPBg = this.add.rectangle(100, 30, 200, 20, 0x333333);
    playerHPBg.setOrigin(0, 0);
    playerHPBg.setDepth(100);

    // Player health bar
    this.playerHealthBar = this.add.rectangle(102, 32, 196, 16, 0xFF4444);
    this.playerHealthBar.setOrigin(0, 0);
    this.playerHealthBar.setDepth(101);

    // Opponent health bar background
    const opponentHPBg = this.add.rectangle(1820, 30, -200, 20, 0x333333);
    opponentHPBg.setOrigin(0, 0);
    opponentHPBg.setDepth(100);

    // Opponent health bar
    this.opponentHealthBar = this.add.rectangle(1818, 32, -196, 16, 0x4444FF);
    this.opponentHealthBar.setOrigin(0, 0);
    this.opponentHealthBar.setDepth(101);

    // Round indicator
    this.roundText = this.add.text(960, 30, 'Round 1/12', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });
    this.roundText.setOrigin(0.5, 0);
    this.roundText.setDepth(102);

    // Timer
    this.timerText = this.add.text(960, 70, '3:00', {
      fontSize: '48px',
      color: '#FFD700',
      fontStyle: 'bold',
    });
    this.timerText.setOrigin(0.5, 0);
    this.timerText.setDepth(102);
  }

  private setupInput(): void {
    // Placeholder for battle controls
    // Will be expanded with full combat system
    const cursors = this.input.keyboard.createCursorKeys();

    // Simple movement (placeholder)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.player && this.isRoundActive) {
        // Punch action
        this.handlePunch('player', 'jab');
      }
    });
  }

  private handlePunch(fighter: 'player' | 'opponent', punchType: string): void {
    const target = fighter === 'player' ? this.opponent : this.player;
    if (!target) return;

    // Simple damage calculation
    const baseDamage = this.getPunchDamage(punchType);
    const damage = baseDamage + Phaser.Math.Between(-2, 2); // Variance

    // Apply damage
    const currentHealth = target.getData('health');
    target.setData('health', Math.max(0, currentHealth - damage));

    // Visual feedback
    this.tweens.add({
      targets: target,
      x: target.x + (fighter === 'player' ? 10 : -10),
      duration: 100,
      yoyo: true,
    });

    // Update health bars
    this.updateHealthBars();

    // Check for victory
    this.checkVictoryConditions();
  }

  private getPunchDamage(punchType: string): number {
    const damageMap: { [key: string]: number } = {
      jab: 5,
      cross: 10,
      hook: 8,
      uppercut: 12,
      body_shot: 7,
      throat_punch: 6,
    };
    return damageMap[punchType] || 5;
  }

  private updateHealthBars(): void {
    if (!this.player || !this.opponent) return;

    const playerHealth = this.player.getData('health');
    const opponentHealth = this.opponent.getData('health');

    // Update player health bar width (max 196)
    if (this.playerHealthBar) {
      this.playerHealthBar.setDisplayOrigin(0, 0);
      this.playerHealthBar.width = (playerHealth / 100) * 196;
    }

    // Update opponent health bar width (negative for right alignment)
    if (this.opponentHealthBar) {
      this.opponentHealthBar.setDisplayOrigin(0, 0);
      this.opponentHealthBar.width = -(opponentHealth / 100) * 196;
    }
  }

  private startRoundTimer(): void {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isRoundActive) return;

        this.roundTime--;
        const minutes = Math.floor(this.roundTime / 60);
        const seconds = this.roundTime % 60;
        const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (this.timerText) {
          this.timerText.setText(timeStr);
        }

        if (this.roundTime <= 0) {
          this.endRound();
        }
      },
      loop: true,
    });
  }

  private endRound(): void {
    this.isRoundActive = false;

    if (this.currentRound < 12) {
      this.currentRound++;
      this.roundTime = 180;
      this.isRoundActive = true;

      if (this.roundText) {
        this.roundText.setText(`Round ${this.currentRound}/12`);
      }
    } else {
      // Fight ended
      this.endFight();
    }
  }

  private checkVictoryConditions(): void {
    if (!this.player || !this.opponent) return;

    const playerHealth = this.player.getData('health');
    const opponentHealth = this.opponent.getData('health');

    // Knockout condition
    if (playerHealth <= 0) {
      this.declareWinner('opponent');
    } else if (opponentHealth <= 0) {
      this.declareWinner('player');
    }
  }

  private declareWinner(winner: 'player' | 'opponent'): void {
    this.isRoundActive = false;

    const message =
      winner === 'player' ? '🎉 YOU WIN!' : '❌ YOU LOSE!';
    const text = this.add.text(960, 540, message, {
      fontSize: '64px',
      color: '#FFD700',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setDepth(200);

    // Return to menu after 3 seconds
    this.time.delayedCall(3000, () => {
      this.scene.start('MenuScene');
    });
  }

  private endFight(): void {
    // Points decision
    this.declareWinner('player'); // Placeholder
  }

  update(): void {
    // Game loop updates
  }
}
