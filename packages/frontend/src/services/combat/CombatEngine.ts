import { Boxer } from './Boxer';

export interface RoundScore {
  player: number;
  opponent: number;
}

export class CombatEngine {
  private player: Boxer;
  private opponent: Boxer;
  private playerScore: number = 0;
  private opponentScore: number = 0;
  private roundLogs: string[] = [];

  constructor(player: Boxer, opponent: Boxer) {
    this.player = player;
    this.opponent = opponent;
  }

  /**
   * ОСНОВНОЙ ЦИКЛ ОБНОВЛЕНИЯ
   */
  public update() {
    // Обновляем боксеров
    this.player.update();
    this.opponent.update();

    // Применяем ИИ оппоненту
    this.updateOpponentAI();

    // Проверяем условия победы
    if (!this.opponent.isAlive()) {
      this.logRound('Opponent KO!');
    }
    if (!this.player.isAlive()) {
      this.logRound('Player KO!');
    }
  }

  /**
   * ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ ОППОНЕНТА
   */
  private updateOpponentAI() {
    const opponentStats = this.opponent.getStats();
    
    // Рандомное решение для ИИ
    const randomAction = Math.random();
    const playerStats = this.player.getStats();

    // Если здоровье низкое - защищаться больше
    if (opponentStats.hp < 30) {
      if (randomAction < 0.6) {
        this.opponent.guard();
      } else if (randomAction < 0.8) {
        const punches = ['jab', 'straight', 'hook'] as const;
        const punchType = punches[Math.floor(Math.random() * punches.length)];
        this.opponent.punch(punchType, 'left');
      }
    }
    // Нормальная агрессивность
    else if (randomAction < 0.4) {
      const punches = ['jab', 'straight', 'hook', 'uppercut'] as const;
      const punchType = punches[Math.floor(Math.random() * punches.length)];
      const side = Math.random() < 0.5 ? 'left' : 'right';
      this.opponent.punch(punchType, side);
    } else if (randomAction < 0.6) {
      this.opponent.guard();
    } else if (randomAction < 0.75) {
      if (Math.random() < 0.5) {
        this.opponent.moveLeft();
      } else {
        this.opponent.moveRight();
      }
    } else {
      this.opponent.stop();
      this.opponent.unGuard();
    }
  }

  /**
   * СИСТЕМА ПОДСЧЕТА РАУНДА
   */
  public calculateRoundScore(): RoundScore {
    const playerStats = this.player.getStats();
    const opponentStats = this.opponent.getStats();

    // Базовая оценка: 10 - 9 или 10 - 8
    let playerScore = 10;
    let opponentScore = 10;

    // Сравниваем статы
    const playerHealthPercent = playerStats.hp / playerStats.maxHp;
    const opponentHealthPercent = opponentStats.hp / opponentStats.maxHp;

    // Кто ударил сильнее
    const playerCombo = this.player.getComboCount();
    const playerComboMult = this.player.getComboMultiplier();

    // Система оценки
    if (playerHealthPercent > opponentHealthPercent) {
      playerScore = 10;
      opponentScore = 9;
    } else if (playerHealthPercent < opponentHealthPercent) {
      playerScore = 9;
      opponentScore = 10;
    } else {
      // Ничья
      playerScore = 10;
      opponentScore = 10;
    }

    // Бонусы за комбо
    if (playerCombo > 3) {
      playerScore = 10;
      opponentScore = 8;
    }

    this.playerScore += playerScore;
    this.opponentScore += opponentScore;

    return { player: playerScore, opponent: opponentScore };
  }

  /**
   * СИСТЕМА КОНТАКТА МЕЖДУ УДАРАМИ
   */
  public checkCollisions(
    playerPunch: any,
    opponentPunch: any,
    playerGuard: boolean,
    opponentGuard: boolean
  ) {
    if (!playerPunch || !opponentPunch) return;

    // Логика контакта
    const playerDamage = playerPunch.damage;
    const opponentDamage = opponentPunch.damage;

    // Если противник защищается - урон уменьшается
    if (opponentGuard) {
      const reducedDamage = this.opponent.takeDamage(playerDamage * 0.3);
      this.logRound(`Player hit opponent for ${reducedDamage} damage (blocked)`);
    } else {
      const finalDamage = this.opponent.takeDamage(playerDamage);
      this.logRound(`Player hit opponent for ${finalDamage} damage`);
    }

    // Оппонент наносит ответный удар
    if (playerGuard) {
      const reducedDamage = this.player.takeDamage(opponentDamage * 0.3);
      this.logRound(`Opponent hit player for ${reducedDamage} damage (blocked)`);
    } else {
      const finalDamage = this.player.takeDamage(opponentDamage);
      this.logRound(`Opponent hit player for ${finalDamage} damage`);
    }
  }

  /**
   * ПОЛУЧИТЬ ИТОГОВЫЙ РЕЗУЛЬТАТ БОЯ
   */
  public getFinalResult(): {
    winner: 'player' | 'opponent' | 'draw';
    playerScore: number;
    opponentScore: number;
  } {
    if (this.playerScore > this.opponentScore) {
      return {
        winner: 'player',
        playerScore: this.playerScore,
        opponentScore: this.opponentScore,
      };
    } else if (this.opponentScore > this.playerScore) {
      return {
        winner: 'opponent',
        playerScore: this.playerScore,
        opponentScore: this.opponentScore,
      };
    } else {
      return {
        winner: 'draw',
        playerScore: this.playerScore,
        opponentScore: this.opponentScore,
      };
    }
  }

  /**
   * ЛОГИРОВАНИЕ
   */
  private logRound(message: string) {
    this.roundLogs.push(message);
    if (this.roundLogs.length > 100) {
      this.roundLogs.shift();
    }
  }

  public getLogs(): string[] {
    return [...this.roundLogs];
  }
}
