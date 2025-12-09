import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CombatGateway } from '../src/modules/combat/combat.gateway';
import { CombatService } from '../src/modules/combat/combat.service';
import { Player } from '../src/modules/players/player.entity';
import { Match } from '../src/modules/matches/match.entity';
import { io, Socket as ClientSocket } from 'socket.io-client';

describe('Combat Integration Tests', () => {
  let app: INestApplication;
  let service: CombatService;
  let gateway: CombatGateway;
  let playerRepository: any;
  let matchRepository: any;

  const mockPlayer = (id: string, overrides = {}): Player => ({
    id,
    telegramId: `user_${id}`,
    username: `Player${id}`,
    avatar: null,
    level: 1,
    experience: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    totalMatches: 0,
    winRate: 0,
    ranking: 0,
    ringTokens: 1000,
    createdAt: new Date(),
    lastActive: new Date(),
    ...overrides,
  });

  beforeAll(async () => {
    playerRepository = {
      findOne: jest.fn().mockImplementation(({ where: { id } }) => {
        return Promise.resolve(mockPlayer(id));
      }),
    };

    matchRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((match) => Promise.resolve(match)),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CombatService,
        CombatGateway,
        {
          provide: getRepositoryToken(Player),
          useValue: playerRepository,
        },
        {
          provide: getRepositoryToken(Match),
          useValue: matchRepository,
        },
      ],
    }).compile();

    service = moduleFixture.get<CombatService>(CombatService);
    gateway = moduleFixture.get<CombatGateway>(CombatGateway);
  });

  describe('Match Lifecycle', () => {
    it('should initialize match correctly', () => {
      const matchId = 'match-1';
      const player1Id = 'p1';
      const player2Id = 'p2';

      const state = service.initializeMatch(matchId, player1Id, player2Id);

      expect(state.matchId).toBe(matchId);
      expect(state.player1Health).toBe(100);
      expect(state.player2Health).toBe(100);
      expect(state.player1Stamina).toBe(100);
      expect(state.player2Stamina).toBe(100);
      expect(state.currentRound).toBe(1);
    });

    it('should process full battle simulation', async () => {
      const matchId = 'match-sim-1';
      const player1Id = 'p1';
      const player2Id = 'p2';

      const state = service.initializeMatch(matchId, player1Id, player2Id);

      // Simulate 3 rounds of combat
      let round = 1;
      while (round <= 3 && state.player1Health > 0 && state.player2Health > 0) {
        // Player 1 attacks
        const result1 = await service.executeAction(matchId, player1Id, 'JAB');
        expect(result1.damage).toBeGreaterThanOrEqual(0);

        if (state.player2Health <= 0) break;

        // Player 2 attacks
        const result2 = await service.executeAction(matchId, player2Id, 'CROSS');
        expect(result2.damage).toBeGreaterThanOrEqual(0);

        round++;
      }

      // Determine winner
      const winner = service.determineWinner(
        { health: state.player1Health, damageDealt: state.player1DamageDealt, damageReceived: state.player2DamageDealt },
        { health: state.player2Health, damageDealt: state.player2DamageDealt, damageReceived: state.player1DamageDealt },
      );

      expect([0, 1, 2]).toContain(winner); // draw, p1 win, or p2 win
    });

    it('should handle player KO', async () => {
      const matchId = 'match-ko';
      const player1Id = 'p1';
      const player2Id = 'p2';

      const state = service.initializeMatch(matchId, player1Id, player2Id);

      // Force player 2 health to 0
      state.player2Health = 0;

      expect(service.checkKO(state.player2Health)).toBe(true);

      // Should finish match
      const result = await service.finishMatch(matchId);
      expect(result.winnerId).toBe(player1Id);
    });

    it('should complete rounds properly', () => {
      const matchId = 'match-rounds';
      const state = service.initializeMatch(matchId, 'p1', 'p2');

      expect(state.currentRound).toBe(1);
      expect(state.player1Stamina).toBe(100);
      expect(state.player2Stamina).toBe(100);

      // Complete first round
      service.completeRound(state);

      expect(state.currentRound).toBe(2);
      expect(state.player1Stamina).toBe(100); // recovered
      expect(state.player2Stamina).toBe(100);
    });
  });

  describe('Anti-Cheat Validation', () => {
    it('should reject action if player knocked out', () => {
      const state = service.initializeMatch('m-ac-1', 'p1', 'p2');
      state.player1Health = 0;

      const validation = service.validateAction(state, 'p1', 'JAB');

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('knocked out');
    });

    it('should reject action if insufficient stamina', () => {
      const state = service.initializeMatch('m-ac-2', 'p1', 'p2');
      state.player1Stamina = 5; // not enough for UPPERCUT

      const validation = service.validateAction(state, 'p1', 'UPPERCUT');

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('stamina');
    });

    it('should reject impossible health values', () => {
      const state = service.initializeMatch('m-ac-3', 'p1', 'p2');
      state.player1Health = 150; // impossible

      const validation = service.validateAction(state, 'p1', 'JAB');

      expect(validation.valid).toBe(false);
    });

    it('should accept valid action', () => {
      const state = service.initializeMatch('m-ac-4', 'p1', 'p2');

      const validation = service.validateAction(state, 'p1', 'JAB');

      expect(validation.valid).toBe(true);
    });
  });

  describe('Combat Balance', () => {
    it('should not allow one-shot KO', async () => {
      const matchId = 'match-balance-1';
      const state = service.initializeMatch(matchId, 'p1', 'p2');

      // Max damage is 25 (UPPERCUT) * multipliers. Health is 100.
      // Even with perfect stats, damage should be < 100
      let totalDamage = 0;
      for (let i = 0; i < 5; i++) {
        const damage = service.calculateDamage(
          { power: 100, accuracy: 100, stamina: 100 },
          { defense: 0, evasion: 0, stamina: 100 },
          'UPPERCUT',
        );
        totalDamage += damage;
      }

      expect(totalDamage).toBeLessThan(100); // can't one-shot even with 5 attacks
    });

    it('should be balanced between defense and attack', () => {
      const attacker = { power: 100, accuracy: 100, stamina: 100 };
      const highDefense = { defense: 100, evasion: 0, stamina: 100 };
      const lowDefense = { defense: 0, evasion: 0, stamina: 100 };

      const damageLow = service.calculateDamage(attacker, lowDefense, 'CROSS');
      const damageHigh = service.calculateDamage(attacker, highDefense, 'CROSS');

      // High defense should reduce damage, but not eliminate it
      expect(damageHigh).toBeGreaterThan(0);
      expect(damageHigh).toBeLessThan(damageLow);
    });

    it('should have stamina cost scale with power', () => {
      expect(service.drainStamina(100, 'JAB')).toBe(90); // -10
      expect(service.drainStamina(100, 'CROSS')).toBe(88); // -12
      expect(service.drainStamina(100, 'HOOK')).toBe(85); // -15
      expect(service.drainStamina(100, 'UPPERCUT')).toBe(80); // -20
    });
  });

  describe('AI Behavior', () => {
    it('should choose random moves on EASY', () => {
      const moves = new Set();
      for (let i = 0; i < 100; i++) {
        moves.add(service.getAIMove('EASY', 100));
      }
      expect(moves.size).toBeGreaterThan(2);
    });

    it('should be defensive when low health', () => {
      const moves = [];
      for (let i = 0; i < 30; i++) {
        moves.push(service.getAIMove('HARD', 20)); // 20% health
      }
      const defensiveMoves = moves.filter((m) => m === 'GUARD' || m === 'SLIP');
      expect(defensiveMoves.length).toBeGreaterThan(5); // mostly defensive
    });

    it('should be aggressive when high health', () => {
      const moves = [];
      for (let i = 0; i < 30; i++) {
        moves.push(service.getAIMove('HARD', 100)); // 100% health
      }
      const aggressiveMoves = moves.filter(
        (m) => m === 'HOOK' || m === 'UPPERCUT' || m === 'CROSS',
      );
      expect(aggressiveMoves.length).toBeGreaterThan(5); // mostly aggressive
    });
  });

  describe('Real Combat Scenarios', () => {
    it('Scenario 1: Strong attacker vs weak defender', async () => {
      const matchId = 'scenario-1';
      const strongPlayer = 'strong';
      const weakPlayer = 'weak';

      playerRepository.findOne.mockImplementation(({ where: { id } }) => {
        if (id === strongPlayer) {
          return Promise.resolve(mockPlayer(strongPlayer, { level: 10 }));
        }
        return Promise.resolve(mockPlayer(weakPlayer, { level: 1 }));
      });

      const state = service.initializeMatch(matchId, strongPlayer, weakPlayer);

      // Strong player should deal more damage
      const damageFromStrong = await service.executeAction(matchId, strongPlayer, 'CROSS');
      const damageFromWeak = await service.executeAction(matchId, weakPlayer, 'CROSS');

      expect(damageFromStrong.damage).toBeGreaterThan(damageFromWeak.damage);
    });

    it('Scenario 2: Defensive strategy wins', async () => {
      const matchId = 'scenario-2';
      const attacker = 'p1';
      const defender = 'p2';

      const state = service.initializeMatch(matchId, attacker, defender);

      // Defender uses GUARD to recover stamina
      for (let i = 0; i < 5; i++) {
        await service.executeAction(matchId, attacker, 'JAB');
        await service.executeAction(matchId, defender, 'GUARD');
      }

      // Defender should have more stamina due to GUARD recovery
      expect(state.player2Stamina).toBeGreaterThan(state.player1Stamina);
    });

    it('Scenario 3: Stamina management matters', async () => {
      const matchId = 'scenario-3';
      const p1 = 'p1';
      const p2 = 'p2';

      const state = service.initializeMatch(matchId, p1, p2);

      // Player 1 spams UPPERCUT (high cost)
      for (let i = 0; i < 8; i++) {
        await service.executeAction(matchId, p1, 'UPPERCUT');
      }

      // Player 1 stamina should be low
      expect(state.player1Stamina).toBeLessThan(30);

      // Low stamina means damage penalty
      const damage = service.calculateDamage(
        { power: 100, accuracy: 100, stamina: state.player1Stamina },
        { defense: 50, evasion: 50, stamina: 100 },
        'CROSS',
      );

      const damageFresh = service.calculateDamage(
        { power: 100, accuracy: 100, stamina: 100 },
        { defense: 50, evasion: 50, stamina: 100 },
        'CROSS',
      );

      expect(damage).toBeLessThan(damageFresh);
    });
  });
});
