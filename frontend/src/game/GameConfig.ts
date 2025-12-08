import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { BattleScene } from './scenes/BattleScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: '#004E89',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      enableBody: true,
    },
  },
  scene: [MenuScene, BattleScene],
  render: {
    pixelArt: false,
    antialias: true,
    preferWebGL: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'parent',
    min: {
      width: 1024,
      height: 576,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },
};
