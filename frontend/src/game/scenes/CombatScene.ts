import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { CombatUI } from '../ui/CombatUI';
import { InputManager, InputCommand } from '../utils/InputManager';
import { GAME_CONFIG } from '../config';
import { FighterStats } from '@types/combat';

export class CombatScene extends Phaser.Scene {
  private player!: Fighter;
  private opponent!: Fighter;
  private ui!: CombatUI;
  private inputManager!: InputManager;
  
  private round: number = 1;
  private roundTimer: number = GAME_CONFIG.roundDuration;
  private isPaused: boolean = false;
  private isRoundActive: boolean = false;
  
  constructor() {
    super({ key: 'CombatScene' });
  }

  create(): void {
    console.log('🥊 Combat Scene started');
    
    // Background
    this.add.image(960, 540, 'ring_bg');
    
    // Create fighters
    this.createFighters();
    
    // Setup input
    this.inputManager = new InputManager(this);
    
    // Create UI
    this.ui = new CombatUI(this, this.player, this.opponent);
    
    // Start first round
    this.time.delayedCall(2000, () => {
      this.startRound();
    });
  }
  
  private createFighters(): void {
    const playerStats: FighterStats = {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      power: 80,
      speed: 75,
      defense: 70,
      criticalHitChance: 15,
    };
    
    const opponentStats: FighterStats = {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      power: 75,
      speed: 80,
      defense: 75,
      criticalHitChance: 12,
    };
    
    this.player = new Fighter(
      this,
      500,
      700,
      'fighter_red',
      'Player',
      playerStats,
      true
    );
    
    this.opponent = new Fighter(
      this,
      1420,
      700,
      'fighter_blue',
      'Opponent',
      opponentStats,
      false
    );
  }
  
  private startRound(): void {
    console.log(`🔔 Round ${this.round} - FIGHT!`);
    this.isRoundActive = true;
    this.roundTimer = GAME_CONFIG.roundDuration;
    
    // Play bell sound
    // this.sound.play('bell');
    
    this.ui.showMessage('FIGHT!', 1000);
  }
  
  private endRound(): void {
    console.log(`🔔 Round ${this.round} - END!`);
    this.isRoundActive = false;
    
    // Calculate round winner
    const playerScore = this.player.getRoundScore();
    const opponentScore = this.opponent.getRoundScore();
    
    const winner = playerScore > opponentScore ? 'Player' : 'Opponent';
    this.ui.showMessage(`Round ${this.round} - ${winner} wins!`, 3000);
    
    // Reset fighters
    this.player.resetRoundStats();
    this.opponent.resetRoundStats();
    
    // Next round or end match
    if (this.round < GAME_CONFIG.maxRounds) {
      this.round++;
      this.time.delayedCall(3000, () => {
        this.startRound();
      });
    } else {
      this.endMatch();
    }
  }
  
  private endMatch(): void {
    console.log('🏆 Match ended!');
    const playerWins = this.player.getTotalScore() > this.opponent.getTotalScore();
    this.ui.showMessage(playerWins ? 'VICTORY!' : 'DEFEAT!', 5000);
    
    this.time.delayedCall(5000, () => {
      // TODO: Return to menu or show results
      this.scene.start('MenuScene');
    });
  }

  update(time: number, delta: number): void {
    if (this.isPaused || !this.isRoundActive) return;
    
    // Update round timer
    this.roundTimer -= delta / 1000;
    if (this.roundTimer <= 0) {
      this.endRound();
      return;
    }
    
    // Handle input
    const command = this.inputManager.update();
    if (command) {
      this.handlePlayerCommand(command);
    }
    
    // Update fighters
    this.player.update(delta);
    this.opponent.update(delta);
    
    // AI for opponent
    this.updateOpponentAI();
    
    // Update UI
    this.ui.update(this.round, this.roundTimer);
    
    // Check for knockouts
    if (this.player.isKnockedOut() || this.opponent.isKnockedOut()) {
      this.handleKnockout();
    }
  }
  
  private handlePlayerCommand(command: InputCommand): void {
    if (command.type === 'ATTACK' && command.action) {
      this.player.attack(command.action as any, this.opponent);
    } else if (command.type === 'DEFEND' && command.action) {
      this.player.defend(command.action as any);
    }
  }
  
  private updateOpponentAI(): void {
    // Simple AI - randomly attacks or defends
    if (Math.random() < 0.02) { // 2% chance per frame
      const actions = ['JAB', 'CROSS', 'HOOK', 'BLOCK', 'DODGE'];
      const action = Phaser.Utils.Array.GetRandom(actions);
      
      if (action === 'BLOCK' || action === 'DODGE') {
        this.opponent.defend(action as any);
      } else {
        this.opponent.attack(action as any, this.player);
      }
    }
  }
  
  private handleKnockout(): void {
    this.isRoundActive = false;
    const winner = this.player.isKnockedOut() ? 'Opponent' : 'Player';
    
    console.log(`💥 KNOCKOUT! ${winner} wins!`);
    this.ui.showMessage('KNOCKOUT!', 3000);
    
    this.time.delayedCall(3000, () => {
      this.endMatch();
    });
  }
}
