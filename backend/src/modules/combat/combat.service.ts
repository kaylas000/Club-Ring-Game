import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../players/player.entity';
import { Match } from '../matches/match.entity';

interface FighterStats {
  power: number;
  accuracy: number;
  defense?: number;
  evasion?: number;
  stamina?: number;
  health?: number;
}

interface BattleStats {
  health: number;
  damageDealt: number;
  damageReceived: number;
}

interface MatchState {
  matchId: string;
  player1Id: string;
  player2Id: string;
  player1Health: number;
  player2Health: number;
  player1Stamina: number;
  player2Stamina: number;
  player1DamageDealt: number;
  player2DamageDealt: number;
  currentRound: number;
  maxRounds: number;
  roundStartTime: number;
  roundActions: Array<{ playerId: string; action: string; damage: number; timestamp: number }>;
}

type StrikeType = 'JAB' | 'CROSS' | 'HOOK' | 'UPPERCUT' | 'GUARD' | 'SLIP';
type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

const STRIKE_DAMAGE: Record<StrikeType, { base: number; stamina: number }> = {
  JAB: { base: 8, stamina: 10 },
  CROSS: { base: 15, stamina: 12 },
  HOOK: { base: 20, stamina: 15 },
  UPPERCUT: { base: 25, stamina: 20 },
  GUARD: { base: 0, stamina: -15 },
  SLIP: { base: 0, stamina: 8 },
};

const STAMINA_MAX = 100;
const HEALTH_MAX = 100;
const ROUND_DURATION_SECONDS = 180;

@Injectable()
export class CombatService {
  private readonly logger = new Logger('CombatService');
  private matchStates = new Map<string, MatchState>();

  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
  ) {}

  /**
   * Initialize a new match state
   */
  initializeMatch(matchId: string, player1Id: string, player2Id: string): MatchState {
    const matchState: MatchState = {
      matchId,
      player1Id,
      player2Id,
      player1Health: HEALTH_MAX,
      player2Health: HEALTH_MAX,
      player1Stamina: STAMINA_MAX,
      player2Stamina: STAMINA_MAX,
      player1DamageDealt: 0,
      player2DamageDealt: 0,
      currentRound: 1,
      maxRounds: 3,
      roundStartTime: Date.now(),
      roundActions: [],
    };

    this.matchStates.set(matchId, matchState);
    return matchState;
  }

  /**
   * Get current match state
   */
  getMatchState(matchId: string): MatchState {
    const state = this.matchStates.get(matchId);
    if (!state) {
      throw new BadRequestException(`Match ${matchId} not found`);
    }
    return state;
  }

  /**
   * Calculate damage based on attacker stats, defender stats, and strike type
   */
  calculateDamage(
    attacker: FighterStats,
    defender: FighterStats,
    strikeType: StrikeType,
  ): number {
    if (!attacker || !defender) {
      throw new BadRequestException('Invalid fighter stats');
    }

    if (!this.isValidStrike(strikeType)) {
      throw new BadRequestException(`Invalid strike type: ${strikeType}`);
    }

    // Cannot deal damage if out of stamina
    if ((attacker.stamina || 0) <= 0 && strikeType !== 'GUARD') {
      return 0;
    }

    // Non-damaging strikes
    if (strikeType === 'GUARD' || strikeType === 'SLIP') {
      return 0;
    }

    const baseStrikeDamage = STRIKE_DAMAGE[strikeType].base;

    // Attacker multiplier
    const attackerMultiplier = (attacker.power || 50) / 100;

    // Accuracy vs Evasion
    const hitChance =
      ((attacker.accuracy || 80) - (defender.evasion || 50)) / 100;
    const accuracy = Math.max(0.1, Math.min(1, hitChance));

    // Defense reduction
    const defenseReduction = (defender.defense || 50) / 200;
    const defenseMultiplier = 1 - defenseReduction;

    // Fatigue penalty
    const fatigueMultiplier =
      (attacker.stamina || 100) > 30 ? 1 : 0.7 + ((attacker.stamina || 30) / 100) * 0.3;

    const totalDamage =
      baseStrikeDamage *
      attackerMultiplier *
      accuracy *
      defenseMultiplier *
      fatigueMultiplier;

    return Math.max(0, Math.round(totalDamage));
  }

  /**
   * Execute a battle action
   */
  async executeAction(
    matchId: string,
    playerId: string,
    strikeType: StrikeType,
  ): Promise<{ damage: number; staminaDrained: number; defendHealth: number }> {
    const state = this.getMatchState(matchId);

    // Determine attacker and defender
    const isPlayer1 = playerId === state.player1Id;
    const attacker = await this.playersRepository.findOne({ where: { id: playerId } });
    const defender = await this.playersRepository.findOne({
      where: { id: isPlayer1 ? state.player2Id : state.player1Id },
    });

    if (!attacker || !defender) {
      throw new BadRequestException('Player not found');
    }

    // Build fighter stats (basic level-based scaling)
    const attackerStats = this.buildFighterStats(attacker);
    const defenderStats = this.buildFighterStats(defender);

    // Update attacker stamina
    const staminaCost = STRIKE_DAMAGE[strikeType].stamina;
    if (isPlayer1) {
      state.player1Stamina = Math.max(0, state.player1Stamina - staminaCost);
    } else {
      state.player2Stamina = Math.max(0, state.player2Stamina - staminaCost);
    }

    // Calculate damage
    const damage = this.calculateDamage(attackerStats, defenderStats, strikeType);

    // Apply damage to defender
    if (isPlayer1) {
      state.player2Health = Math.max(0, state.player2Health - damage);
      state.player1DamageDealt += damage;
    } else {
      state.player1Health = Math.max(0, state.player1Health - damage);
      state.player2DamageDealt += damage;
    }

    // Log action
    state.roundActions.push({
      playerId,
      action: strikeType,
      damage,
      timestamp: Date.now(),
    });

    return {
      damage,
      staminaDrained: staminaCost,
      defendHealth: isPlayer1 ? state.player2Health : state.player1Health,
    };
  }

  /**
   * Drain stamina based on strike type
   */
  drainStamina(currentStamina: number, strikeType: StrikeType): number {
    if (!this.isValidStrike(strikeType)) {
      throw new BadRequestException(`Invalid strike type: ${strikeType}`);
    }

    const staminaCost = STRIKE_DAMAGE[strikeType].stamina;
    return Math.max(0, currentStamina - staminaCost);
  }

  /**
   * Recover stamina
   */
  recoverStamina(currentStamina: number, action: StrikeType): number {
    if (action === 'GUARD') {
      return Math.min(STAMINA_MAX, currentStamina + 20);
    }
    if (action === 'SLIP') {
      return Math.min(STAMINA_MAX, currentStamina + 8);
    }
    return currentStamina;
  }

  /**
   * Apply fatigue effects
   */
  applyFatigue(stats: FighterStats, staminaPercentage: number): FighterStats {
    if (staminaPercentage > 30) {
      return stats;
    }

    const fatigueMultiplier = 0.7 + (staminaPercentage / 100) * 0.3;

    return {
      ...stats,
      power: Math.round((stats.power || 50) * fatigueMultiplier),
      accuracy: Math.round((stats.accuracy || 80) * fatigueMultiplier),
    };
  }

  /**
   * Check if fighter is knocked out
   */
  checkKO(health: number): boolean {
    return health <= 0;
  }

  /**
   * Determine winner
   */
  determineWinner(
    player1Stats: BattleStats,
    player2Stats: BattleStats,
  ): number {
    // Check for KO
    if (player1Stats.health <= 0 && player2Stats.health > 0) return 2;
    if (player2Stats.health <= 0 && player1Stats.health > 0) return 1;
    if (player1Stats.health <= 0 && player2Stats.health <= 0) return 0; // double KO

    // Compare by damage dealt
    if (player1Stats.damageDealt > player2Stats.damageDealt) return 1;
    if (player2Stats.damageDealt > player1Stats.damageDealt) return 2;

    return 0; // tie
  }

  /**
   * Get AI move based on difficulty and current health
   */
  getAIMove(difficulty: AIDifficulty, currentHealth: number): StrikeType {
    const healthPercent = currentHealth / HEALTH_MAX;

    if (difficulty === 'EASY') {
      return this.getRandomMove();
    }

    if (difficulty === 'MEDIUM') {
      if (Math.random() > 0.5) {
        return this.getRandomMove();
      }
      return this.getIntelligentMove(healthPercent);
    }

    // HARD
    return this.getIntelligentMove(healthPercent);
  }

  private getRandomMove(): StrikeType {
    const moves: StrikeType[] = ['JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'GUARD', 'SLIP'];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private getIntelligentMove(healthPercent: number): StrikeType {
    if (healthPercent < 0.3) {
      return Math.random() > 0.5 ? 'GUARD' : 'SLIP';
    }

    if (healthPercent < 0.6) {
      const rand = Math.random();
      if (rand > 0.6) return 'GUARD';
      if (rand > 0.3) return 'HOOK';
      return 'JAB';
    }

    const rand = Math.random();
    if (rand > 0.7) return 'UPPERCUT';
    if (rand > 0.4) return 'HOOK';
    return 'CROSS';
  }

  /**
   * Recovery between rounds
   */
  betweenRoundRecovery(currentStamina: number): number {
    return Math.min(STAMINA_MAX, currentStamina + 20);
  }

  /**
   * Check if round is over
   */
  isRoundOver(matchState: MatchState): boolean {
    // Time-based
    const elapsedSeconds = (Date.now() - matchState.roundStartTime) / 1000;
    if (elapsedSeconds >= ROUND_DURATION_SECONDS) {
      return true;
    }

    // KO-based
    if (matchState.player1Health <= 0 || matchState.player2Health <= 0) {
      return true;
    }

    return false;
  }

  /**
   * Complete a round
   */
  completeRound(matchState: MatchState): void {
    if (matchState.currentRound < matchState.maxRounds && matchState.player1Health > 0 && matchState.player2Health > 0) {
      matchState.currentRound++;
      matchState.roundStartTime = Date.now();
      matchState.player1Stamina = this.betweenRoundRecovery(matchState.player1Stamina);
      matchState.player2Stamina = this.betweenRoundRecovery(matchState.player2Stamina);
      matchState.roundActions = [];
    }
  }

  /**
   * Finish match
   */
  async finishMatch(matchId: string): Promise<{ winnerId: string; player1Damage: number; player2Damage: number }> {
    const state = this.getMatchState(matchId);

    // Determine winner
    const winner = this.determineWinner(
      {
        health: state.player1Health,
        damageDealt: state.player1DamageDealt,
        damageReceived: state.player2DamageDealt,
      },
      {
        health: state.player2Health,
        damageDealt: state.player2DamageDealt,
        damageReceived: state.player1DamageDealt,
      },
    );

    let winnerId = '';
    if (winner === 1) winnerId = state.player1Id;
    else if (winner === 2) winnerId = state.player2Id;
    else winnerId = 'DRAW';

    // Save to database
    const match = await this.matchesRepository.findOne({ where: { matchId } });
    if (match) {
      match.status = 'COMPLETED';
      match.winnerId = winnerId;
      match.player1Score = state.player1DamageDealt;
      match.player2Score = state.player2DamageDealt;
      match.completedAt = new Date();
      match.duration = Math.floor((Date.now() - match.createdAt.getTime()) / 1000);
      await this.matchesRepository.save(match);
    }

    // Clean up match state
    this.matchStates.delete(matchId);

    return {
      winnerId,
      player1Damage: state.player1DamageDealt,
      player2Damage: state.player2DamageDealt,
    };
  }

  /**
   * Build fighter stats from player
   */
  private buildFighterStats(player: Player): FighterStats {
    // Basic level-based scaling: +2 power per level, etc
    const levelBonus = Math.max(0, player.level - 1) * 2;

    return {
      power: Math.min(100, 50 + levelBonus),
      accuracy: Math.min(100, 80 + levelBonus),
      defense: Math.min(100, 50 + levelBonus / 2),
      evasion: Math.min(100, 50 + levelBonus / 2),
      stamina: STAMINA_MAX,
      health: HEALTH_MAX,
    };
  }

  /**
   * Validate strike type
   */
  private isValidStrike(strikeType: string): strikeType is StrikeType {
    const validStrikes: StrikeType[] = [
      'JAB',
      'CROSS',
      'HOOK',
      'UPPERCUT',
      'GUARD',
      'SLIP',
    ];
    return validStrikes.includes(strikeType as StrikeType);
  }

  /**
   * Anti-cheat: validate action is possible
   */
  validateAction(
    matchState: MatchState,
    playerId: string,
    strikeType: StrikeType,
  ): { valid: boolean; reason?: string } {
    const isPlayer1 = playerId === matchState.player1Id;
    const stamina = isPlayer1 ? matchState.player1Stamina : matchState.player2Stamina;
    const health = isPlayer1 ? matchState.player1Health : matchState.player2Health;

    // Check health
    if (health <= 0) {
      return { valid: false, reason: 'Player is knocked out' };
    }

    // Check stamina
    const staminaCost = STRIKE_DAMAGE[strikeType].stamina;
    if (stamina + staminaCost < 0) {
      return { valid: false, reason: 'Not enough stamina' };
    }

    // Check impossible stats
    if (health > HEALTH_MAX || health < 0) {
      return { valid: false, reason: 'Invalid health value' };
    }

    return { valid: true };
  }
}
