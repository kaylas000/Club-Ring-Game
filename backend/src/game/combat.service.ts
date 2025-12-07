import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface CombatAction {
  attackerId: string;
  targetId: string;
  actionType: 'attack' | 'defend' | 'skill' | 'heal';
  damage?: number;
  timestamp: number;
}

interface CombatStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  defense: number;
  attackPower: number;
  critChance: number;
}

interface CombatResult {
  winner: string;
  loser: string;
  duration: number;
  totalDamage: number;
  round: number;
  expGained: number;
  coinsEarned: number;
}

@Injectable()
export class CombatService {
  private activeCombats = new Map<string, any>();

  constructor(
    @InjectRepository('Player')
    private playerRepository: Repository<any>,
  ) {}

  /**
   * Инициализирует боевую сессию
   */
  initiateCombat(player1Id: string, player2Id: string): string {
    const combatId = `combat_${Date.now()}_${Math.random()}`;
    
    const combat = {
      id: combatId,
      player1: {
        id: player1Id,
        stats: this.getPlayerStats(player1Id),
        actions: [],
      },
      player2: {
        id: player2Id,
        stats: this.getPlayerStats(player2Id),
        actions: [],
      },
      startTime: Date.now(),
      round: 0,
      maxRounds: 10,
      status: 'active',
      log: [],
    };

    this.activeCombats.set(combatId, combat);
    return combatId;
  }

  /**
   * Получает статистику игрока для боя
   */
  private getPlayerStats(playerId: string): CombatStats {
    return {
      health: 100,
      maxHealth: 100,
      stamina: 80,
      maxStamina: 80,
      defense: 10,
      attackPower: 15,
      critChance: 0.25,
    };
  }

  /**
   * Выполняет действие в боевой системе
   */
  executeAction(
    combatId: string,
    playerId: string,
    action: CombatAction,
  ): any {
    const combat = this.activeCombats.get(combatId);
    if (!combat) return { error: 'Combat not found' };

    const isPlayer1 = combat.player1.id === playerId;
    const attacker = isPlayer1 ? combat.player1 : combat.player2;
    const defender = isPlayer1 ? combat.player2 : combat.player1;

    if (attacker.stats.stamina < 20) {
      return { error: 'Insufficient stamina' };
    }

    let damage = 0;
    let log = '';

    switch (action.actionType) {
      case 'attack':
        damage = this.calculateDamage(
          attacker.stats.attackPower,
          defender.stats.defense,
          attacker.stats.critChance,
        );
        log = `${playerId} атакует! Урон: ${damage}`;
        attacker.stats.stamina -= 20;
        break;

      case 'defend':
        attacker.stats.defense += 5;
        attacker.stats.stamina -= 15;
        log = `${playerId} защищается!`;
        break;

      case 'skill':
        damage = this.calculateDamage(
          attacker.stats.attackPower * 1.5,
          defender.stats.defense * 0.7,
          attacker.stats.critChance,
        );
        log = `${playerId} использует умение! Урон: ${damage}`;
        attacker.stats.stamina -= 40;
        break;

      case 'heal':
        const healed = 30;
        attacker.stats.health = Math.min(
          attacker.stats.health + healed,
          attacker.stats.maxHealth,
        );
        attacker.stats.stamina -= 25;
        log = `${playerId} исцеляется! Восстановлено ${healed} HP`;
        break;
    }

    defender.stats.health = Math.max(0, defender.stats.health - damage);

    combat.log.push(log);
    combat.round++;

    if (defender.stats.health <= 0) {
      return this.endCombat(combatId, attacker.id, defender.id);
    }

    if (combat.round >= combat.maxRounds) {
      return this.endCombat(
        combatId,
        attacker.stats.health > defender.stats.health
          ? attacker.id
          : defender.id,
        attacker.stats.health > defender.stats.health
          ? defender.id
          : attacker.id,
      );
    }

    return {
      combatId,
      round: combat.round,
      log: combat.log,
      stats: {
        player1: combat.player1.stats,
        player2: combat.player2.stats,
      },
    };
  }

  /**
   * Расчет урона с учетом защиты и крита
   */
  private calculateDamage(
    attackPower: number,
    defense: number,
    critChance: number,
  ): number {
    let baseDamage = Math.max(1, attackPower - defense / 2);
    
    if (Math.random() < critChance) {
      baseDamage *= 1.5;
    }

    baseDamage *= 0.8 + Math.random() * 0.4;

    return Math.floor(baseDamage);
  }

  /**
   * Завершение боя
   */
  private endCombat(
    combatId: string,
    winnerId: string,
    loserId: string,
  ): CombatResult {
    const combat = this.activeCombats.get(combatId);
    
    const duration = Date.now() - combat.startTime;
    const totalDamage = combat.log.filter(l => l.includes('Урон')).length;
    const expGained = 50 + combat.round * 10;
    const coinsEarned = 100 + combat.round * 25;

    const result: CombatResult = {
      winner: winnerId,
      loser: loserId,
      duration,
      totalDamage,
      round: combat.round,
      expGained,
      coinsEarned,
    };

    combat.status = 'completed';
    this.activeCombats.delete(combatId);

    return result;
  }

  /**
   * Получить статус боя
   */
  getCombatStatus(combatId: string): any {
    return this.activeCombats.get(combatId);
  }
}
