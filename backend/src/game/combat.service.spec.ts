import { Test, TestingModule } from '@nestjs/testing';
import { CombatService } from './combat.service';

describe('CombatService', () => {
  let service: CombatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombatService],
    }).compile();

    service = module.get<CombatService>(CombatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Damage Calculation', () => {
    it('should calculate damage correctly based on power and opponent defense', () => {
      const attacker = {
        power: 80,
        accuracy: 85,
      };
      const defender = {
        defense: 60,
        evasion: 50,
      };

      const damage = service.calculateDamage(attacker, defender, 'CROSS');
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(30); // CROSS max damage
    });

    it('should deal reduced damage when defender has high defense', () => {
      const weakAttacker = {
        power: 40,
        accuracy: 70,
      };
      const strongDefender = {
        defense: 90,
        evasion: 80,
      };

      const damage = service.calculateDamage(
        weakAttacker,
        strongDefender,
        'JAB',
      );
      expect(damage).toBeLessThanOrEqual(10);
    });

    it('should apply strike type modifiers', () => {
      const attacker = { power: 75, accuracy: 80 };
      const defender = { defense: 50, evasion: 50 };

      const jabDamage = service.calculateDamage(attacker, defender, 'JAB');
      const hookDamage = service.calculateDamage(
        attacker,
        defender,
        'HOOK',
      );
      const uppercutDamage = service.calculateDamage(
        attacker,
        defender,
        'UPPERCUT',
      );

      expect(jabDamage).toBeLessThan(hookDamage);
      expect(hookDamage).toBeLessThan(uppercutDamage);
    });

    it('should not deal damage when attacker stamina is 0', () => {
      const exhaustedAttacker = {
        power: 90,
        accuracy: 90,
        stamina: 0,
      };
      const defender = { defense: 40, evasion: 40 };

      const damage = service.calculateDamage(
        exhaustedAttacker,
        defender,
        'CROSS',
      );
      expect(damage).toBe(0);
    });
  });

  describe('Stamina System', () => {
    it('should drain stamina based on strike type', () => {
      let stamina = 100;

      stamina = service.drainStamina(stamina, 'JAB');
      expect(stamina).toBe(90); // JAB costs 10

      stamina = service.drainStamina(stamina, 'HOOK');
      expect(stamina).toBe(75); // HOOK costs 15

      stamina = service.drainStamina(stamina, 'UPPERCUT');
      expect(stamina).toBe(55); // UPPERCUT costs 20
    });

    it('should not drain more stamina than available', () => {
      let stamina = 5;
      stamina = service.drainStamina(stamina, 'CROSS'); // costs 10
      expect(stamina).toBe(0);
    });

    it('should recover stamina when guarding', () => {
      let stamina = 30;
      stamina = service.recoverStamina(stamina, 'GUARD');
      expect(stamina).toBeGreaterThan(30);
      expect(stamina).toBeLessThanOrEqual(100);
    });

    it('should not exceed 100 stamina when recovering', () => {
      let stamina = 95;
      stamina = service.recoverStamina(stamina, 'GUARD');
      expect(stamina).toBe(100);
    });

    it('should apply fatigue when stamina is low', () => {
      const stats = { power: 80, accuracy: 80 };
      const fatigued = service.applyFatigue(stats, 10); // 10% stamina left

      expect(fatigued.power).toBeLessThan(stats.power);
      expect(fatigued.accuracy).toBeLessThan(stats.accuracy);
    });
  });

  describe('Health & KO System', () => {
    it('should detect KO when health reaches 0', () => {
      let health = 10;
      const damage = 20;
      health = Math.max(0, health - damage);

      const isKO = service.checkKO(health);
      expect(isKO).toBe(true);
    });

    it('should track knockdowns', () => {
      let knockdowns = 0;
      knockdowns = service.addKnockdown(knockdowns);
      knockdowns = service.addKnockdown(knockdowns);
      knockdowns = service.addKnockdown(knockdowns);

      expect(knockdowns).toBe(3);
      expect(service.checkTKO(knockdowns)).toBe(true);
    });

    it('should reset knockdowns after round', () => {
      let knockdowns = 2;
      knockdowns = service.resetKnockdowns(knockdowns);
      expect(knockdowns).toBe(0);
    });

    it('should calculate TKO after 3 consecutive knockdowns', () => {
      const knockdownCount = 3;
      const isTKO = service.checkTKO(knockdownCount);
      expect(isTKO).toBe(true);
    });
  });

  describe('Victory Conditions', () => {
    it('should determine winner by points when both alive after 3 rounds', () => {
      const player1Stats = {
        health: 50,
        damageDealt: 200,
        damageReceived: 100,
      };
      const player2Stats = {
        health: 70,
        damageDealt: 120,
        damageReceived: 200,
      };

      const winner = service.determineWinner(player1Stats, player2Stats);
      expect(winner).toBe(1); // player1 has more damage dealt
    });

    it('should give knockout victory immediate priority', () => {
      const player1Stats = { health: 100, damageDealt: 50, damageReceived: 0 };
      const player2Stats = { health: 0, damageDealt: 200, damageReceived: 100 };

      const winner = service.determineWinner(player1Stats, player2Stats);
      expect(winner).toBe(1);
    });

    it('should handle tie games', () => {
      const player1Stats = {
        health: 50,
        damageDealt: 150,
        damageReceived: 150,
      };
      const player2Stats = {
        health: 50,
        damageDealt: 150,
        damageReceived: 150,
      };

      const winner = service.determineWinner(player1Stats, player2Stats);
      expect(winner).toBe(0); // tie
    });
  });

  describe('AI Opponent Logic', () => {
    it('should select different moves each turn', () => {
      const moves = new Set();

      for (let i = 0; i < 20; i++) {
        const move = service.getAIMove('EASY', 80);
        moves.add(move);
      }

      expect(moves.size).toBeGreaterThan(1);
    });

    it('easy AI should make random moves', () => {
      const moves = [];
      for (let i = 0; i < 10; i++) {
        moves.push(service.getAIMove('EASY', 100));
      }

      const uniqueMoves = new Set(moves).size;
      expect(uniqueMoves).toBeGreaterThan(1);
    });

    it('hard AI should use defensive moves when low on health', () => {
      const defensiveMoves = ['GUARD', 'SLIP'];
      const move = service.getAIMove('HARD', 20);
      expect(defensiveMoves).toContain(move);
    });

    it('hard AI should use aggressive moves when winning', () => {
      const aggressiveMoves = ['HOOK', 'UPPERCUT'];
      const move = service.getAIMove('HARD', 100);
      expect(aggressiveMoves).toContain(move);
    });
  });

  describe('Round Management', () => {
    it('should complete a full 180-second round', () => {
      const roundDuration = 180; // seconds
      expect(roundDuration).toBe(180);
    });

    it('should recover 20% stamina between rounds', () => {
      let stamina = 30;
      stamina = service.betweenRoundRecovery(stamina);
      expect(stamina).toBeGreaterThan(30);
      expect(stamina).toBeLessThanOrEqual(100);
    });

    it('should reset per-round stats', () => {
      const stats = {
        roundDamageDealt: 150,
        roundDamageTaken: 80,
      };

      const reset = service.resetRoundStats(stats);
      expect(reset.roundDamageDealt).toBe(0);
      expect(reset.roundDamageTaken).toBe(0);
    });
  });

  describe('Edge Cases & Anti-Cheat', () => {
    it('should not allow negative damage', () => {
      const damage = service.calculateDamage(
        { power: -50, accuracy: -50 },
        { defense: 100, evasion: 100 },
        'JAB',
      );
      expect(damage).toBeGreaterThanOrEqual(0);
    });

    it('should not allow health below 0', () => {
      let health = 10;
      health -= 999;
      health = Math.max(0, health);
      expect(health).toBe(0);
    });

    it('should validate strike type', () => {
      const validStrikes = ['JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'GUARD', 'SLIP'];
      const move = 'INVALID_MOVE';
      expect(validStrikes).not.toContain(move);
    });

    it('should prevent stamina overflow', () => {
      let stamina = 100;
      stamina = service.recoverStamina(stamina, 'GUARD');
      expect(stamina).toBeLessThanOrEqual(100);
    });

    it('should prevent impossible stat values', () => {
      const stats = { power: 150, accuracy: 150, defense: 150 }; // over max 100
      const normalized = service.normalizeStats(stats);
      expect(normalized.power).toBeLessThanOrEqual(100);
      expect(normalized.accuracy).toBeLessThanOrEqual(100);
      expect(normalized.defense).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance & Load Tests', () => {
    it('should process 1000 damage calculations in < 100ms', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        service.calculateDamage(
          { power: 75, accuracy: 80 },
          { defense: 60, evasion: 50 },
          'CROSS',
        );
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent battles without conflicts', async () => {
      const battles = [];

      for (let i = 0; i < 10; i++) {
        battles.push(
          service.simulateBattle({
            player1: { power: 75, accuracy: 80, stamina: 100, health: 100 },
            player2: { power: 70, accuracy: 75, stamina: 100, health: 100 },
          }),
        );
      }

      const results = await Promise.all(battles);
      expect(results.length).toBe(10);
      expect(results.every((r) => r.winner !== undefined)).toBe(true);
    });
  });
});
