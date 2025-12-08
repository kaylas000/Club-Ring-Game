import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 320, height / 2 - 30, 640, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5, 0.5);
    
    // Update loading bar
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xFF6B35, 1);
      progressBar.fillRect(width / 2 - 310, height / 2 - 20, 620 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    // Load assets (placeholders for now)
    // TODO: Load actual sprites, sounds, etc.
    this.loadPlaceholderAssets();
  }
  
  private loadPlaceholderAssets(): void {
    // Placeholder colored rectangles for fighters
    this.load.image('fighter_red', this.createPlaceholderFighter(0xFF6B35));
    this.load.image('fighter_blue', this.createPlaceholderFighter(0x004E89));
    
    // Ring background
    this.load.image('ring_bg', this.createRingBackground());
  }
  
  private createPlaceholderFighter(color: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;
    
    // Body
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.fillRect(60, 100, 80, 200);
    
    // Head
    ctx.beginPath();
    ctx.arc(100, 70, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms
    ctx.fillRect(40, 120, 20, 100);
    ctx.fillRect(140, 120, 20, 100);
    
    // Legs
    ctx.fillRect(70, 300, 25, 100);
    ctx.fillRect(105, 300, 25, 100);
    
    return canvas.toDataURL();
  }
  
  private createRingBackground(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2c2c2c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Ring canvas
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(200, 400, 1520, 600);
    
    // Ring ropes
    ctx.strokeStyle = '#C41E3A';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(200, 500);
    ctx.lineTo(1720, 500);
    ctx.moveTo(200, 700);
    ctx.lineTo(1720, 700);
    ctx.moveTo(200, 900);
    ctx.lineTo(1720, 900);
    ctx.stroke();
    
    return canvas.toDataURL();
  }

  create(): void {
    console.log('✅ Boot Scene loaded');
    this.scene.start('CombatScene');
  }
}
