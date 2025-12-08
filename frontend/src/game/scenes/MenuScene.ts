import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    this.cameras.main.setBackgroundColor('#004E89');
    
    // Title
    const title = this.add.text(width / 2, height / 4, '🥊 CLUB RING', {
      fontSize: '80px',
      color: '#FF6B35',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setScale(1.2);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 4 + 100, 'Telegram Boxing Game', {
      fontSize: '32px',
      color: '#FFD23F',
    });
    subtitle.setOrigin(0.5);
    
    // Buttons
    this.createButton(width / 2, height / 2 - 80, 'START MATCH', () => {
      this.scene.start('CombatScene');
    });
    
    this.createButton(width / 2, height / 2, 'LEADERBOARD', () => {
      console.log('Leaderboard not implemented yet');
    });
    
    this.createButton(width / 2, height / 2 + 80, 'TRAINING', () => {
      console.log('Training not implemented yet');
    });
    
    this.createButton(width / 2, height / 2 + 160, 'SHOP', () => {
      console.log('Shop not implemented yet');
    });
    
    // Version info
    const version = this.add.text(width - 20, height - 20, 'v0.1.0 - MVP', {
      fontSize: '14px',
      color: '#888888',
    });
    version.setOrigin(1, 1);
  }
  
  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): void {
    const button = this.add.rectangle(x, y, 300, 60, 0xFF6B35);
    button.setInteractive();
    button.on('pointerover', () => button.setFillStyle(0xFF8558));
    button.on('pointerout', () => button.setFillStyle(0xFF6B35));
    button.on('pointerdown', callback);
    
    const buttonText = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5);
  }
}
