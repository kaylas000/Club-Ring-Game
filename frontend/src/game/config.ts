import Phaser from 'phaser';

export const GAME_CONFIG = {
  // Canvas dimensions
  width: 1920,
  height: 1080,
  
  // Combat settings
  roundDuration: 180, // 3 minutes in seconds
  maxRounds: 12,
  
  // Fighter stats
  defaultHealth: 100,
  defaultStamina: 100,
  staminaRegenRate: 5, // per second
  
  // Physics
  gravity: 1500,
  
  // Timing
  punchCooldown: 300, // milliseconds
  dodgeCooldown: 500,
  blockCooldown: 200,
  
  // Damage multipliers
  criticalMultiplier: 1.5,
  counterMultiplier: 1.75,
  comboMultiplier: 1.25,
  
  // Visual
  bloodEffects: true,
  particleEffects: true,
  screenShake: true,
};

export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: '#2C2C2C',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME_CONFIG.gravity },
      debug: process.env.NODE_ENV === 'development',
    },
  },
  scene: [],
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};
