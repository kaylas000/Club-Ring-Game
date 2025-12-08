import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background gradient
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x004e89);
    bg.setOrigin(0.5);

    // Title
    const title = this.add.text(width / 2, height / 4, '🥊 CLUB RING', {
      fontSize: '96px',
      color: '#FF6B35',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 60, 'Telegram Boxing Game', {
      fontSize: '32px',
      color: '#FFFFFF',
    });
    subtitle.setOrigin(0.5);

    // Start button
    const startBtn = this.createButton(
      width / 2,
      height / 2,
      'START BATTLE',
      () => {
        this.scene.start('BattleScene');
      }
    );

    // Training button
    const trainingBtn = this.createButton(
      width / 2,
      height / 2 + 100,
      'TRAINING',
      () => {
        console.log('Training mode');
      }
    );

    // Settings button
    const settingsBtn = this.createButton(
      width / 2,
      height / 2 + 200,
      'SETTINGS',
      () => {
        console.log('Settings');
      }
    );

    // Version text
    this.add.text(width - 20, height - 20, 'v0.1.0 - MVP', {
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(1, 1);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 300, 60, 0xFF6B35);
    bg.setInteractive();

    // Button text
    const txt = this.add.text(0, 0, text, {
      fontSize: '28px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });
    txt.setOrigin(0.5);

    btn.add([bg, txt]);

    // Hover effects
    bg.on('pointerover', () => {
      this.tweens.add({
        targets: bg,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
      });
    });

    bg.on('pointerout', () => {
      this.tweens.add({
        targets: bg,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
      });
    });

    bg.on('pointerdown', callback);

    return btn;
  }
}
