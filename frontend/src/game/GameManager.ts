import Phaser from 'phaser';
import { PHASER_CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { CombatScene } from './scenes/CombatScene';

export class GameManager {
  private game: Phaser.Game | null = null;
  private isInitialized: boolean = false;
  
  init(containerId: string): Phaser.Game {
    if (this.isInitialized && this.game) {
      console.warn('Game already initialized');
      return this.game;
    }
    
    const config = {
      ...PHASER_CONFIG,
      parent: containerId,
      scene: [BootScene, CombatScene],
    };
    
    this.game = new Phaser.Game(config);
    this.isInitialized = true;
    
    console.log('✅ Phaser Game initialized');
    return this.game;
  }
  
  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.isInitialized = false;
      console.log('🗑️ Game destroyed');
    }
  }
  
  getGame(): Phaser.Game | null {
    return this.game;
  }
  
  isReady(): boolean {
    return this.isInitialized && this.game !== null;
  }
}

// Singleton instance
export const gameManager = new GameManager();
