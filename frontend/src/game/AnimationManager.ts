import Phaser from 'phaser';
import { ANIMATIONS } from './constants';

export class AnimationManager {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createAnimations();
  }
  
  private createAnimations(): void {
    // Punch animations (placeholder - in production these would use sprite sheets)
    this.createSimpleAnimation(ANIMATIONS.JAB, 3, 6);
    this.createSimpleAnimation(ANIMATIONS.CROSS, 4, 8);
    this.createSimpleAnimation(ANIMATIONS.HOOK, 5, 10);
    this.createSimpleAnimation(ANIMATIONS.UPPERCUT, 6, 12);
    this.createSimpleAnimation(ANIMATIONS.BODY_SHOT, 4, 8);
    this.createSimpleAnimation(ANIMATIONS.THROAT_PUNCH, 5, 10);
    
    // Defense animations
    this.createSimpleAnimation(ANIMATIONS.BLOCK, 2, 4);
    this.createSimpleAnimation(ANIMATIONS.DODGE, 3, 6);
    
    // Other animations
    this.createSimpleAnimation(ANIMATIONS.HIT, 2, 4);
    this.createSimpleAnimation(ANIMATIONS.KNOCKDOWN, 4, 8);
    this.createSimpleAnimation(ANIMATIONS.VICTORY, 5, 10);
    this.createSimpleAnimation(ANIMATIONS.DEFEAT, 4, 8);
  }
  
  private createSimpleAnimation(
    key: string,
    frames: number,
    duration: number
  ): void {
    // Placeholder animation - in production use sprite sheets
    if (!this.scene.anims.get(key)) {
      this.scene.anims.create({
        key,
        frames: this.scene.anims.generateFrameNumbers('placeholder', {
          start: 0,
          end: Math.min(frames - 1, 0),
        }),
        frameRate: frames,
        duration,
        repeat: 0,
      });
    }
  }
  
  playAttackAnimation(punchType: string, onComplete?: () => void): void {
    // Animations will be tied to fighter sprites
    if (onComplete) {
      setTimeout(onComplete, 300);
    }
  }
  
  playDefenseAnimation(defenseType: string, onComplete?: () => void): void {
    if (onComplete) {
      setTimeout(onComplete, 200);
    }
  }
  
  playHitAnimation(target: Phaser.GameObjects.Image): void {
    // Flash effect
    this.scene.tweens.add({
      targets: target,
      tint: 0xff0000,
      duration: 50,
      yoyo: true,
      repeat: 1,
    });
  }
  
  playKnockdownAnimation(target: Phaser.GameObjects.Container): void {
    // Knockdown effect
    this.scene.tweens.add({
      targets: target,
      rotation: Math.PI / 2,
      scale: 0.8,
      y: target.y + 100,
      duration: 500,
      ease: 'Power2.easeIn',
    });
  }
}
