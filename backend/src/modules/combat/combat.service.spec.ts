import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CombatService } from './combat.service';
import { Player } from '../players/player.entity';
import { Match } from '../matches/match.entity';
import { BadRequestException } from '@nestjs/common';

describe('CombatService', () => {
  let service: CombatService;
  let mockPlayerRepository: any;
  let mockMatchRepository: any;

  const mockPlayer = (overrides = {}): Player => ({
    id: 'player-1',
    telegramId: '123456',
    username: 'TestPlayer',
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

  beforeEach(async () => {
    mockPlayerRepository = {
      findOne: jest.fn(),
    };

    mockMatchRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CombatService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockPlayerRepository,
        },
        {
          provide: getRepositoryToken(Match),
          useValue: mockMatchRepository,
        },
      ],
    }).compile();

    service = module.get<CombatService>(CombatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeMatch', () => {
    it('should create match state with initial values', () => {
      const matchId = 'match-1';
      const player1Id = 'p1';
      const player2Id = 'p2';

      const state = service.initializeMatch(matchId, player1Id, player2Id);

      expect(state.matchId).toBe(matchId);
      expect(state.player1Id).toBe(player1Id);
      expect(state.player2Id).toBe(player2Id);
      expect(state.player1Health).toBe(100);
      expect(state.player2Health).toBe(100);
      expect(state.player1Stamina).toBe(100);
      expect(state.player2Stamina).toBe(100);
      expect(state.currentRound).toBe(1);
    });
  });

  describe('calculateDamage', () => {
    it('should calculate basic JAB damage', () => {
      const attacker = { power: 100, accuracy: 100 };
      const defender = { defense: 50, evasion: 50, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'JAB');

      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(8); // base damage
    });

    it('should handle CROSS strike', () => {
      const attacker = { power: 100, accuracy: 100 };
      const defender = { defense: 50, evasion: 50, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'CROSS');

      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(15); // base damage
    });

    it('should handle HOOK strike', () => {
      const attacker = { power: 100, accuracy: 100 };
      const defender = { defense: 50, evasion: 50, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'HOOK');

      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(20); // base damage
    });

    it('should handle UPPERCUT strike', () => {
      const attacker = { power: 100, accuracy: 100 };
      const defender = { defense: 50, evasion: 50, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'UPPERCUT');

      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(25); // base damage
    });

    it('should not deal damage with GUARD', () => {
      const attacker = { power: 100, accuracy: 100 };
      const defender = { defense: 50, evasion: 50, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'GUARD');

      expect(damage).toBe(0);
    });

    it('should not deal damage with SLIP', () => {
      const attacker = { power: 100, accuracy: 100 };
      const defender = { defense: 50, evasion: 50, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'SLIP');

      expect(damage).toBe(0);
    });

    it('should reduce damage with high evasion', () => {
      const attacker = { power: 100, accuracy: 80, stamina: 100 };
      const defender = { defense: 50, evasion: 100, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'CROSS');

      expect(damage).toBeLessThanOrEqual(5); // much lower due to evasion
    });

    it('should reduce damage with high defense', () => {
      const attacker = { power: 100, accuracy: 100, stamina: 100 };
      const defender = { defense: 100, evasion: 50, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'CROSS');

      expect(damage).toBeLessThanOrEqual(8); // reduced by defense
    });

    it('should apply fatigue penalty when low stamina', () => {
      const attacker = { power: 100, accuracy: 100, stamina: 20 }; // low stamina
      const defender = { defense: 50, evasion: 50, stamina: 100 };

      const damageNormal = service.calculateDamage(
        { power: 100, accuracy: 100, stamina: 100 },
        defender,
        'CROSS',
      );
      const damageFatigued = service.calculateDamage(attacker, defender, 'CROSS');

      expect(damageFatigued).toBeLessThan(damageNormal);
    });

    it('should return 0 damage if no stamina and attacking', () => {
      const attacker = { power: 100, accuracy: 100, stamina: 0 };
      const defender = { defense: 50, evasion: 50, stamina: 100 };

      const damage = service.calculateDamage(attacker, defender, 'JAB');

      expect(damage).toBe(0);
    });

    it('should throw on invalid strike type', () => {
      const attacker = { power: 100, accuracy: 100 };
      const defender = { defense: 50, evasion: 50 };

      expect(() => {
        service.calculateDamage(attacker, defender, 'INVALID' as any);
      }).toThrow(BadRequestException);
    });

    it('should throw on missing stats', () => {
      expect(() => {
        service.calculateDamage(null, { defense: 50 }, 'JAB');
      }).toThrow(BadRequestException);
    });
  });

  describe('drainStamina', () => {
    it('should drain stamina for JAB', () => {
      const stamina = service.drainStamina(100, 'JAB');
      expect(stamina).toBe(90); // -10
    });

    it('should drain stamina for CROSS', () => {
      const stamina = service.drainStamina(100, 'CROSS');
      expect(stamina).toBe(88); // -12
    });

    it('should not go below 0', () => {
      const stamina = service.drainStamina(5, 'UPPERCUT');
      expect(stamina).toBe(0); // would be -15 but clamped
    });
  });

  describe('recoverStamina', () => {
    it('should recover with GUARD', () => {
      const stamina = service.recoverStamina(50, 'GUARD');
      expect(stamina).toBe(70); // +20
    });

    it('should recover with SLIP', () => {
      const stamina = service.recoverStamina(50, 'SLIP');
      expect(stamina).toBe(58); // +8
    });

    it('should not exceed max', () => {
      const stamina = service.recoverStamina(90, 'GUARD');
      expect(stamina).toBe(100); // clamped to max
    });
  });

  describe('checkKO', () => {
    it('should detect KO at 0 health', () => {
      expect(service.checkKO(0)).toBe(true);
    });

    it('should detect KO at negative health', () => {
      expect(service.checkKO(-10)).toBe(true);
    });

    it('should not detect KO at positive health', () => {
      expect(service.checkKO(1)).toBe(false);
      expect(service.checkKO(100)).toBe(false);
    });
  });

  describe('determineWinner', () => {
    it('should return player 1 if player 2 KOed', () => {
      const player1Stats = { health: 50, damageDealt: 100, damageReceived: 50 };
      const player2Stats = { health: 0, damageDealt: 50, damageReceived: 100 };

      const winner = service.determineWinner(player1Stats, player2Stats);

      expect(winner).toBe(1);
    });

    it('should return player 2 if player 1 KOed', () => {
      const player1Stats = { health: 0, damageDealt: 50, damageReceived: 100 };
      const player2Stats = { health: 50, damageDealt: 100, damageReceived: 50 };

      const winner = service.determineWinner(player1Stats, player2Stats);

      expect(winner).toBe(2);
    });

    it('should return 0 (draw) if both KOed', () => {
      const player1Stats = { health: 0, damageDealt: 50, damageReceived: 50 };
      const player2Stats = { health: 0, damageDealt: 50, damageReceived: 50 };

      const winner = service.determineWinner(player1Stats, player2Stats);

      expect(winner).toBe(0);
    });

    it('should pick player 1 if more damage dealt', () => {
      const player1Stats = { health: 50, damageDealt: 150, damageReceived: 50 };
      const player2Stats = { health: 50, damageDealt: 100, damageReceived: 150 };

      const winner = service.determineWinner(player1Stats, player2Stats);

      expect(winner).toBe(1);
    });

    it('should pick player 2 if more damage dealt', () => {
      const player1Stats = { health: 50, damageDealt: 100, damageReceived: 150 };
      const player2Stats = { health: 50, damageDealt: 150, damageReceived: 50 };

      const winner = service.determineWinner(player1Stats, player2Stats);

      expect(winner).toBe(2);
    });

    it('should return 0 (tie) if same damage', () => {
      const player1Stats = { health: 50, damageDealt: 100, damageReceived: 100 };
      const player2Stats = { health: 50, damageDealt: 100, damageReceived: 100 };

      const winner = service.determineWinner(player1Stats, player2Stats);

      expect(winner).toBe(0);
    });
  });

  describe('getAIMove', () => {
    it('should return random move on EASY difficulty', () => {
      const validMoves = ['JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'GUARD', 'SLIP'];
      const moves = new Set();

      // Run multiple times to get variety
      for (let i = 0; i < 50; i++) {
        const move = service.getAIMove('EASY', 100);
        moves.add(move);
      }

      // Should have multiple different moves
      expect(moves.size).toBeGreaterThan(1);
      moves.forEach((move) => {
        expect(validMoves).toContain(move);
      });
    });

    it('should be defensive when low health', () => {
      const defensiveMoves = ['GUARD', 'SLIP'];
      const moves = new Set();

      for (let i = 0; i < 50; i++) {
        const move = service.getAIMove('HARD', 20); // low health
        moves.add(move);
      }

      // Most moves should be defensive
      const defensiveCount = Array.from(moves).filter((m) =>
        defensiveMoves.includes(m),
      ).length;
      expect(defensiveCount).toBeGreaterThan(0);
    });

    it('should be aggressive when high health', () => {
      const aggressiveMoves = ['HOOK', 'UPPERCUT', 'CROSS'];
      const moves = new Set();

      for (let i = 0; i < 50; i++) {
        const move = service.getAIMove('HARD', 100); // high health
        moves.add(move);
      }

      // Should include aggressive moves
      const aggressiveCount = Array.from(moves).filter((m) =>
        aggressiveMoves.includes(m),
      ).length;
      expect(aggressiveCount).toBeGreaterThan(0);
    });
  });

  describe('validateAction (Anti-cheat)', () => {
    it('should reject action if player is knocked out', () => {
      const state = service.initializeMatch('m1', 'p1', 'p2');
      state.player1Health = 0;

      const result = service.validateAction(state, 'p1', 'JAB');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('knocked out');
    });

    it('should reject action if not enough stamina', () => {
      const state = service.initializeMatch('m1', 'p1', 'p2');
      state.player1Stamina = 5; // not enough for UPPERCUT (costs 20)

      const result = service.validateAction(state, 'p1', 'UPPERCUT');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('stamina');
    });

    it('should accept valid action', () => {
      const state = service.initializeMatch('m1', 'p1', 'p2');

      const result = service.validateAction(state, 'p1', 'JAB');

      expect(result.valid).toBe(true);
    });
  });

  describe('isRoundOver', () => {
    it('should return false for new round', () => {
      const state = service.initializeMatch('m1', 'p1', 'p2');

      expect(service.isRoundOver(state)).toBe(false);
    });

    it('should return true if player knocked out', () => {
      const state = service.initializeMatch('m1', 'p1', 'p2');
      state.player1Health = 0;

      expect(service.isRoundOver(state)).toBe(true);
    });
  });

  describe('betweenRoundRecovery', () => {
    it('should recover 20 stamina between rounds', () => {
      const stamina = service.betweenRoundRecovery(60);
      expect(stamina).toBe(80);
    });

    it('should not exceed max stamina', () => {
      const stamina = service.betweenRoundRecovery(90);
      expect(stamina).toBe(100);
    });
  });

  describe('Performance', () => {
    it('should calculate 1000 damages in < 100ms', () => {
      const attacker = { power: 80, accuracy: 85, stamina: 100 };
      const defender = { power: 75, accuracy: 80, stamina: 100, defense: 50, evasion: 50 };

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        service.calculateDamage(attacker, defender, 'CROSS');
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});
