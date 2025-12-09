import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';

interface CombatState {
  matchId: string;
  player1: PlayerState;
  player2: PlayerState;
  round: number;
  timeRemaining: number;
  isActive: boolean;
  winner?: string;
}

interface PlayerState {
  playerId: string;
  health: number;
  stamina: number;
  stunned: boolean;
  position?: { x: number; y: number };
}

export class BattleScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private opponent: Phaser.Physics.Arcade.Sprite | null = null;
  private ring: Phaser.GameObjects.Graphics | null = null;
  private playerHealthBar: Phaser.GameObjects.Rectangle | null = null;
  private opponentHealthBar: Phaser.GameObjects.Rectangle | null = null;
  private playerStaminaBar: Phaser.GameObjects.Rectangle | null = null;
  private opponentStaminaBar: Phaser.GameObjects.Rectangle | null = null;
  private roundText: Phaser.GameObjects.Text | null = null;
  private timerText: Phaser.GameObjects.Text | null = null;

  // WebSocket
  private socket: Socket | null = null;
  private matchId: string = '';
  private playerId: string = '';
  private isConnected: boolean = false;

  // Combat state
  private playerHP = 100;
  private opponentHP = 100;
  private playerStamina = 100;
  private opponentStamina = 100;
  private currentRound = 1;
  private roundTime = 180; // 3 minutes in seconds
  private isRoundActive = true;
  private isOnlineMode = true;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { matchId?: string; playerId?: string; mode?: 'online' | 'offline' }) {
    console.log('BattleScene initialized with:', data);
    this.matchId = data.matchId || '';
    this.playerId = data.playerId || '';
    this.isOnlineMode = data.mode !== 'offline';
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

    // Connect to WebSocket if in online mode
    if (this.isOnlineMode && this.matchId) {
      this.connectToMatch();
    } else {
      console.log('🐞 Running in offline mode');
    }
  }

  // ========================================
  // WEBSOCKET INTEGRATION
  // ========================================

  private connectToMatch(): void {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4000';
      
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      console.log(`🎮 Match ID: ${this.matchId}`);

      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.joinMatch();
      });

      this.socket.on('disconnect', () => {
        console.warn('⚠️ WebSocket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.isConnected = false;
      });

      // Match events
      this.socket.on('match:state', (state: CombatState) => {
        this.handleMatchState(state);
      });

      this.socket.on('match:action', (action: any) => {
        this.handleMatchAction(action);
      });

      this.socket.on('match:end', (result: any) => {
        this.handleMatchEnd(result);
      });

      this.socket.on('match:round_start', (data: any) => {
        console.log(`🔔 Round ${data.round} started`);
        this.currentRound = data.round;
        this.roundTime = 180;
        this.isRoundActive = true;
        if (this.roundText) {
          this.roundText.setText(`Round ${this.currentRound}/12`);
        }
      });

      this.socket.on('match:round_end', (data: any) => {
        console.log(`🔔 Round ${data.round} ended`);
        this.isRoundActive = false;
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isOnlineMode = false;
    }
  }

  private joinMatch(): void {
    if (!this.socket || !this.isConnected) return;

    console.log(`📝 Joining match: ${this.matchId}`);
    this.socket.emit('match:join', {
      matchId: this.matchId,
      playerId: this.playerId,
    });
  }

  private handleMatchState(state: CombatState): void {
    console.log('Received match state:', state);

    // Update player states
    if (state.player1) {
      const isPlayer1 = state.player1.playerId === this.playerId;
      if (isPlayer1) {
        this.playerHP = state.player1.health;
        this.playerStamina = state.player1.stamina;
        if (state.player2) {
          this.opponentHP = state.player2.health;
          this.opponentStamina = state.player2.stamina;
        }
      } else {
        this.playerHP = state.player2?.health || 100;
        this.playerStamina = state.player2?.stamina || 100;
        this.opponentHP = state.player1.health;
        this.opponentStamina = state.player1.stamina;
      }
    }

    // Update round and time
    if (state.round) {
      this.currentRound = state.round;
    }
    if (typeof state.timeRemaining === 'number') {
      this.roundTime = state.timeRemaining;
    }
    this.isRoundActive = state.isActive;

    // Update UI
    this.updateHealthBars();
    this.updateStaminaBars();
    if (this.roundText) {
      this.roundText.setText(`Round ${this.currentRound}/12`);
    }

    // Check for winner
    if (state.winner) {
      const isWinner = state.winner === this.playerId;
      this.declareWinner(isWinner ? 'player' : 'opponent');
    }
  }

  private handleMatchAction(action: any): void {
    console.log('Match action:', action);

    const { attacker, defender, actionType, damage, success } = action;

    // Determine which fighter is attacking
    const isPlayerAttacking = attacker === this.playerId;
    const attackerSprite = isPlayerAttacking ? this.player : this.opponent;
    const defenderSprite = isPlayerAttacking ? this.opponent : this.player;

    if (success && defenderSprite) {
      // Visual feedback for hit
      this.tweens.add({
        targets: defenderSprite,
        x: defenderSprite.x + (isPlayerAttacking ? 10 : -10),
        duration: 100,
        yoyo: true,
      });

      // Flash damage effect
      this.tweens.add({
        targets: defenderSprite,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
      });

      // Show damage number
      this.showDamageNumber(defenderSprite.x, defenderSprite.y - 50, damage || 0);
    }

    // Play attack animation
    if (attackerSprite) {
      this.playAttackAnimation(attackerSprite, actionType);
    }
  }

  private handleMatchEnd(result: any): void {
    console.log('Match ended:', result);
    this.isRoundActive = false;

    const isWinner = result.winner === this.playerId;
    this.declareWinner(isWinner ? 'player' : 'opponent', result);
  }

  private sendAction(actionType: string, targetArea: string = 'head'): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Not connected to match, action not sent');
      // Fallback to offline mode
      this.handlePunch('player', actionType);
      return;
    }

    console.log(`Sending action: ${actionType} to ${targetArea}`);
    this.socket.emit('match:action', {
      matchId: this.matchId,
      playerId: this.playerId,
      actionType,
      targetArea,
      timestamp: Date.now(),
    });
  }

  // ========================================
  // RING SETUP
  // ========================================

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

  // ========================================
  // HUD
  // ========================================

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

    // Player stamina bar background
    const playerStaminaBg = this.add.rectangle(100, 55, 200, 12, 0x333333);
    playerStaminaBg.setOrigin(0, 0);
    playerStaminaBg.setDepth(100);

    // Player stamina bar
    this.playerStaminaBar = this.add.rectangle(102, 57, 196, 8, 0xFFFF00);
    this.playerStaminaBar.setOrigin(0, 0);
    this.playerStaminaBar.setDepth(101);

    // Opponent health bar background
    const opponentHPBg = this.add.rectangle(1820, 30, -200, 20, 0x333333);
    opponentHPBg.setOrigin(0, 0);
    opponentHPBg.setDepth(100);

    // Opponent health bar
    this.opponentHealthBar = this.add.rectangle(1818, 32, -196, 16, 0x4444FF);
    this.opponentHealthBar.setOrigin(0, 0);
    this.opponentHealthBar.setDepth(101);

    // Opponent stamina bar background
    const opponentStaminaBg = this.add.rectangle(1820, 55, -200, 12, 0x333333);
    opponentStaminaBg.setOrigin(0, 0);
    opponentStaminaBg.setDepth(100);

    // Opponent stamina bar
    this.opponentStaminaBar = this.add.rectangle(1818, 57, -196, 8, 0xFFFF00);
    this.opponentStaminaBar.setOrigin(0, 0);
    this.opponentStaminaBar.setDepth(101);

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

    // Connection indicator
    const connectionColor = this.isOnlineMode ? 0x00FF00 : 0xFF0000;
    const connectionIndicator = this.add.circle(50, 50, 10, connectionColor);
    connectionIndicator.setDepth(103);
  }

  // ========================================
  // INPUT HANDLING
  // ========================================

  private setupInput(): void {
    // Keyboard controls
    const cursors = this.input.keyboard.createCursorKeys();

    // Action buttons (1-6 keys)
    this.input.keyboard.on('keydown-ONE', () => this.sendAction('jab', 'head'));
    this.input.keyboard.on('keydown-TWO', () => this.sendAction('cross', 'head'));
    this.input.keyboard.on('keydown-THREE', () => this.sendAction('hook', 'head'));
    this.input.keyboard.on('keydown-FOUR', () => this.sendAction('uppercut', 'head'));
    this.input.keyboard.on('keydown-FIVE', () => this.sendAction('body_shot', 'body'));
    this.input.keyboard.on('keydown-SIX', () => this.sendAction('throat_punch', 'throat'));

    // Mouse click for basic punch
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isRoundActive) {
        this.sendAction('jab', 'head');
      }
    });
  }

  // ========================================
  // COMBAT LOGIC (OFFLINE FALLBACK)
  // ========================================

  private handlePunch(fighter: 'player' | 'opponent', punchType: string): void {
    const target = fighter === 'player' ? this.opponent : this.player;
    if (!target) return;

    // Simple damage calculation
    const baseDamage = this.getPunchDamage(punchType);
    const damage = baseDamage + Phaser.Math.Between(-2, 2); // Variance

    // Apply damage
    const currentHealth = target.getData('health');
    target.setData('health', Math.max(0, currentHealth - damage));

    // Update local state
    if (fighter === 'player') {
      this.opponentHP = target.getData('health');
    } else {
      this.playerHP = target.getData('health');
    }

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

  // ========================================
  // UI UPDATES
  // ========================================

  private updateHealthBars(): void {
    // Update player health bar width (max 196)
    if (this.playerHealthBar) {
      this.playerHealthBar.setDisplayOrigin(0, 0);
      this.playerHealthBar.width = (this.playerHP / 100) * 196;
    }

    // Update opponent health bar width (negative for right alignment)
    if (this.opponentHealthBar) {
      this.opponentHealthBar.setDisplayOrigin(0, 0);
      this.opponentHealthBar.width = -(this.opponentHP / 100) * 196;
    }
  }

  private updateStaminaBars(): void {
    // Update player stamina bar
    if (this.playerStaminaBar) {
      this.playerStaminaBar.setDisplayOrigin(0, 0);
      this.playerStaminaBar.width = (this.playerStamina / 100) * 196;
    }

    // Update opponent stamina bar
    if (this.opponentStaminaBar) {
      this.opponentStaminaBar.setDisplayOrigin(0, 0);
      this.opponentStaminaBar.width = -(this.opponentStamina / 100) * 196;
    }
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.add.text(x, y, `-${damage}`, {
      fontSize: '24px',
      color: '#FF0000',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setDepth(200);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  private playAttackAnimation(sprite: Phaser.Physics.Arcade.Sprite, actionType: string): void {
    // Simple punch animation (extend forward then back)
    const direction = sprite === this.player ? 1 : -1;
    this.tweens.add({
      targets: sprite,
      x: sprite.x + (20 * direction),
      duration: 150,
      yoyo: true,
    });
  }

  // ========================================
  // ROUND & VICTORY LOGIC
  // ========================================

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
    // Knockout condition
    if (this.playerHP <= 0) {
      this.declareWinner('opponent');
    } else if (this.opponentHP <= 0) {
      this.declareWinner('player');
    }
  }

  private declareWinner(winner: 'player' | 'opponent', result?: any): void {
    this.isRoundActive = false;

    const message = winner === 'player' ? '🎉 YOU WIN!' : '❌ YOU LOSE!';
    const text = this.add.text(960, 540, message, {
      fontSize: '64px',
      color: '#FFD700',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setDepth(200);

    // Show result details if available
    if (result) {
      const detailsText = this.add.text(960, 620, 
        `Method: ${result.method || 'Decision'}\nDuration: ${result.duration || 0}s`,
        {
          fontSize: '24px',
          color: '#FFFFFF',
          align: 'center',
        }
      );
      detailsText.setOrigin(0.5);
      detailsText.setDepth(200);
    }

    // Disconnect WebSocket
    if (this.socket) {
      this.socket.disconnect();
    }

    // Return to menu after 3 seconds
    this.time.delayedCall(3000, () => {
      this.scene.start('MenuScene');
    });
  }

  private endFight(): void {
    // Points decision (use health comparison)
    const winner = this.playerHP > this.opponentHP ? 'player' : 'opponent';
    this.declareWinner(winner);
  }

  // ========================================
  // CLEANUP
  // ========================================

  shutdown(): void {
    // Clean up WebSocket connection
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  update(): void {
    // Game loop updates
  }
}
