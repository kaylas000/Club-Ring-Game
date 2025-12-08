import Phaser from 'phaser';

export type PunchType = 'jab' | 'straight' | 'hook' | 'uppercut' | 'bodyshot';
export type PunchSide = 'left' | 'right';

export interface BoxerStats {
  maxHp: number;
  hp: number;
  maxStamina: number;
  stamina: number;
  power: number;
  speed: number;
  defense: number;
}

export class Boxer {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private stats: BoxerStats;
  private side: 'left' | 'right';
  private isGuarding: boolean = false;
  private currentCombo: { type: PunchType; side: PunchSide }[] = [];
  private comboMultiplier: number = 1.0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    side: 'left' | 'right'
  ) {
    this.scene = scene;
    this.side = side;
    this.stats = {
      maxHp: 100,
      hp: 100,
      maxStamina: 100,
      stamina: 100,
      power: 10,
      speed: 8,
      defense: 5,
    };

    // Создаем спрайт боксера
    this.sprite = scene.physics.add.sprite(x, y, 'boxer', 0);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setOrigin(0.5, 0.5);
    
    // Если на правой стороне - зеркально отражаем
    if (side === 'right') {
      this.sprite.setFlipX(true);
    }
  }

  /**
   * СИСТЕМА УДАРОВ
   */
  public punch(type: PunchType, side: PunchSide) {
    // Проверяем хватает ли стамины
    const staminaCost = this.getStaminaCost(type);
    if (this.stats.stamina < staminaCost) return;

    // Расходуем стамину
    this.stats.stamina = Math.max(0, this.stats.stamina - staminaCost);

    // Добавляем в комбо
    this.currentCombo.push({ type, side });
    this.updateComboMultiplier();

    // Вычисляем урон
    const baseDamage = this.getBaseDamage(type);
    const damage = baseDamage * this.comboMultiplier * (this.stats.power / 10);

    // Проигрываем анимацию
    this.playPunchAnimation(type, side, damage);
  }

  /**
   * СИСТЕМА ЗАЩИТЫ
   */
  public guard() {
    if (this.isGuarding) return;
    this.isGuarding = true;
    this.sprite.setTint(0x0099ff); // Визуальная подсказка
  }

  public unGuard() {
    this.isGuarding = false;
    this.sprite.clearTint();
  }

  public takeDamage(damage: number): number {
    let finalDamage = damage;

    // Если охраняется - уменьшаем урон на 70%
    if (this.isGuarding) {
      finalDamage = damage * 0.3;
      this.stats.stamina = Math.max(0, this.stats.stamina - 3);
    } else {
      // Базовая защита
      finalDamage = damage * (1 - this.stats.defense / 100);
    }

    // Применяем урон
    this.stats.hp = Math.max(0, this.stats.hp - finalDamage);

    // Визуальный эффект
    this.sprite.setTint(0xff0000);
    this.scene.tweens.add({
      targets: this.sprite,
      duration: 200,
      onComplete: () => {
        if (!this.isGuarding) {
          this.sprite.clearTint();
        }
      },
    });

    return finalDamage;
  }

  /**
   * ПЕРЕМЕЩЕНИЕ
   */
  public moveLeft() {
    this.sprite.setVelocityX(-150);
  }

  public moveRight() {
    this.sprite.setVelocityX(150);
  }

  public stop() {
    this.sprite.setVelocity(0, 0);
  }

  /**
   * ВОССТАНОВЛЕНИЕ СТАМИНЫ
   */
  public update() {
    // Восстанавливаем стамину (50% в секунду когда не действуем)
    if (this.currentCombo.length === 0) {
      this.stats.stamina = Math.min(
        this.stats.maxStamina,
        this.stats.stamina + 0.5
      );
    }

    // Очищаем комбо если давно не было ударов
    if (this.currentCombo.length > 0) {
      // Будем использовать таймер в сцене
    }
  }

  /**
   * ВНУТРЕННИЕ МЕТОДЫ
   */

  private getStaminaCost(type: PunchType): number {
    const costs: Record<PunchType, number> = {
      jab: 3,
      straight: 5,
      hook: 6,
      uppercut: 8,
      bodyshot: 7,
    };
    return costs[type];
  }

  private getBaseDamage(type: PunchType): number {
    const damages: Record<PunchType, number> = {
      jab: 5,
      straight: 12,
      hook: 10,
      uppercut: 15,
      bodyshot: 8,
    };
    return damages[type];
  }

  private updateComboMultiplier() {
    // Максимум 3x мультипликатор за 5 ударов подряд
    if (this.currentCombo.length >= 5) {
      this.comboMultiplier = 3.0;
    } else if (this.currentCombo.length >= 3) {
      this.comboMultiplier = 2.0;
    } else {
      this.comboMultiplier = 1.0 + this.currentCombo.length * 0.15;
    }
  }

  private playPunchAnimation(
    type: PunchType,
    side: PunchSide,
    damage: number
  ) {
    const animationKey = `${type}_${side}`;
    
    // Play animation (будет добавлена позже с Spine)
    this.sprite.play(animationKey, true);

    // Создаем визуальный эффект удара
    const hitX = this.side === 'left' 
      ? this.sprite.x + 100 
      : this.sprite.x - 100;
    
    const particles = this.scene.add.particles('punch-hit');
    particles.emitParticleAt(hitX, this.sprite.y, 10);
    particles.setSpeed(-100, 100);
    particles.setLifespan(500);
  }

  /**
   * GETTERS
   */
  public getStats(): BoxerStats {
    return { ...this.stats };
  }

  public isAlive(): boolean {
    return this.stats.hp > 0;
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public getComboCount(): number {
    return this.currentCombo.length;
  }

  public getComboMultiplier(): number {
    return this.comboMultiplier;
  }
}
