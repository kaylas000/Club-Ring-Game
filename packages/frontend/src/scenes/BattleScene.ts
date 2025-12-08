import Phaser from 'phaser';
import { CombatEngine } from '@/services/combat/CombatEngine';
import { Boxer } from '@/services/combat/Boxer';

export class BattleScene extends Phaser.Scene {
  private player!: Boxer;
  private opponent!: Boxer;
  private combatEngine!: CombatEngine;
  private roundsCompleted: number = 0;
  private maxRounds: number = 12;
  private roundTimer!: Phaser.Time.TimerEvent;
  private roundTimeLeft: number = 180; // 3 мин в секундах

  constructor() {
    super({ key: 'BattleScene' });
  }

  create() {
    // Создаем арену
    this.createRing();
    
    // Инициализируем боксеров
    this.player = new Boxer(this, 200, 300, 'player');
    this.opponent = new Boxer(this, 800, 300, 'opponent');
    
    // Инициализируем движок боя
    this.combatEngine = new CombatEngine(this.player, this.opponent);
    
    // Настраиваем камеру
    this.cameras.main.setBounds(0, 0, 1024, 768);
    this.cameras.main.startFollow(this.player);
    
    // Начинаем раунд
    this.startRound();
  }

  private createRing() {
    // Фон
    this.add.rectangle(512, 384, 1024, 768, 0x1a1a1a);
    
    // Канвас
    const ring = this.add.rectangle(512, 384, 600, 600, 0x8b7355);
    this.physics.add.existing(ring, true);
    
    // Канаты
    const ropeColor = 0xffffff;
    const ropeY = [250, 320, 450, 520];
    ropeY.forEach((y) => {
      this.add.line(0, y, 200, 0, 1024, 0, ropeColor);
    });
    
    // Углы
    const corners = [
      { x: 210, y: 210 }, { x: 810, y: 210 },
      { x: 210, y: 550 }, { x: 810, y: 550 }
    ];
    corners.forEach(corner => {
      this.add.circle(corner.x, corner.y, 20, 0xff0000);
    });
  }

  private startRound() {
    this.roundsCompleted++;
    this.roundTimeLeft = 180;
    
    // Таймер раунда
    this.roundTimer = this.time.addTimer({
      delay: 1000,
      callback: () => {
        this.roundTimeLeft--;
        if (this.roundTimeLeft <= 0) {
          this.endRound();
        }
      },
      loop: true,
    });
  }

  private endRound() {
    this.roundTimer.remove();
    // Скоринг раунда
    const roundScore = this.combatEngine.calculateRoundScore();
    console.log(`Round ${this.roundsCompleted}: Player ${roundScore.player} - Opponent ${roundScore.opponent}`);
    
    if (this.roundsCompleted >= this.maxRounds) {
      this.endBattle();
    } else {
      this.time.delayedCall(5000, () => this.startRound());
    }
  }

  private endBattle() {
    this.scene.start('MenuScene', { result: 'victory' });
  }

  update() {
    this.handleInput();
    this.combatEngine.update();
  }

  private handleInput() {
    const keys = this.input.keyboard?.createCursorKeys();
    if (!keys) return;
    
    // Управление: стрелки для движения
    if (keys.left.isDown) {
      this.player.moveLeft();
    } else if (keys.right.isDown) {
      this.player.moveRight();
    }
    
    // Управление ударами (W, A, S, D)
    const punchKeys = this.input.keyboard?.addKeys('W,A,S,D');
    if (punchKeys) {
      if (Phaser.Input.Keyboard.JustDown(punchKeys.W)) {
        this.player.punch('jab', 'left');
      }
      if (Phaser.Input.Keyboard.JustDown(punchKeys.A)) {
        this.player.punch('straight', 'left');
      }
      if (Phaser.Input.Keyboard.JustDown(punchKeys.S)) {
        this.player.punch('hook', 'left');
      }
      if (Phaser.Input.Keyboard.JustDown(punchKeys.D)) {
        this.player.punch('uppercut', 'right');
      }
    }
  }
}
