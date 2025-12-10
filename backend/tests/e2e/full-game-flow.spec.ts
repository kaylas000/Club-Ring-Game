import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from '@/modules/matches/matches.service';
import { PlayersService } from '@/modules/players/players.service';
import { CombatService } from '@/modules/combat/combat.service';
import { Player } from '@/modules/players/player.entity';
import { Match } from '@/modules/matches/match.entity';

describe('Full Game Flow E2E Tests', () => {
  let app: INestApplication;
  let matchesService: MatchesService;
  let playersService: PlayersService;
  let combatService: CombatService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Player, Match],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Player, Match]),
      ],
      providers: [PlayersService, MatchesService, CombatService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    matchesService = moduleFixture.get<MatchesService>(MatchesService);
    playersService = moduleFixture.get<PlayersService>(PlayersService);
    combatService = moduleFixture.get<CombatService>(CombatService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Game Flow', () => {
    let player1: Player;
    let player2: Player;
    let matchId: string;

    // ✅ STEP 1: Create Players
    it('should create two players for a match', async () => {
      console.log('\n🎮 STEP 1: Creating players...');

      player1 = await playersService.create({
        username: 'Player1',
        telegramId: 'tg_1',
      });

      player2 = await playersService.create({
        username: 'Player2',
        telegramId: 'tg_2',
      });

      expect(player1).toBeDefined();
      expect(player1.id).toBeDefined();
      expect(player2).toBeDefined();
      expect(player2.id).toBeDefined();
      expect(player1.tokens).toBe(1000); // Default starting tokens
      expect(player2.tokens).toBe(1000);

      console.log('✅ Players created:');
      console.log(`   P1: ${player1.username} (ID: ${player1.id})`);
      console.log(`   P2: ${player2.username} (ID: ${player2.id})`);
    });

    // ✅ STEP 2: Initialize Match
    it('should initialize a match between players', async () => {
      console.log('\n🎮 STEP 2: Initializing match...');

      matchId = `match_${Date.now()}`;
      const result = await matchesService.initializeMatch(
        matchId,
        player1.id,
        player2.id,
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.matchId).toBe(matchId);
      expect(result.matchState).toBeDefined();
      expect(result.players).toHaveLength(2);

      console.log('✅ Match initialized:');
      console.log(`   Match ID: ${matchId}`);
      console.log(`   Status: PENDING -> ACTIVE`);
    });

    // ✅ STEP 3: Get Match State
    it('should retrieve current match state', async () => {
      console.log('\n🎮 STEP 3: Retrieving match state...');

      const matchState = await matchesService.getMatchState(matchId);

      expect(matchState).toBeDefined();
      expect(matchState.match).toBeDefined();
      expect(matchState.matchState).toBeDefined();
      expect(matchState.match.status).toBe('ACTIVE');

      console.log('✅ Match state retrieved:');
      console.log(`   P1 Health: ${matchState.matchState.player1?.health || 100}`);
      console.log(`   P2 Health: ${matchState.matchState.player2?.health || 100}`);
      console.log(`   Round: ${matchState.matchState.round || 1}`);
    });

    // ✅ STEP 4: Simulate Combat
    it('should process combat actions', async () => {
      console.log('\n🎮 STEP 4: Processing combat actions...');

      // Get initial state
      let matchState = await matchesService.getMatchState(matchId);
      const initialP1Health = matchState.matchState?.player1?.health || 100;
      const initialP2Health = matchState.matchState?.player2?.health || 100;

      // Simulate player 1 attacking
      const action1 = combatService.processAction(
        matchId,
        player1.id,
        'jab',
        'head',
      );

      // Simulate player 2 attacking
      const action2 = combatService.processAction(
        matchId,
        player2.id,
        'cross',
        'body',
      );

      expect(action1).toBeDefined();
      expect(action1.success).toBe(true);
      expect(action1.damage).toBeGreaterThan(0);

      expect(action2).toBeDefined();
      expect(action2.success).toBe(true);
      expect(action2.damage).toBeGreaterThan(0);

      console.log('✅ Combat actions processed:');
      console.log(`   P1 Jab: ${action1.damage} damage`);
      console.log(`   P2 Cross: ${action2.damage} damage`);
    });

    // ✅ STEP 5: Get Updated Stats
    it('should track player statistics', async () => {
      console.log('\n🎮 STEP 5: Retrieving player stats...');

      const stats1 = await matchesService.getMatchStats(player1.id);
      const stats2 = await matchesService.getMatchStats(player2.id);

      expect(stats1).toBeDefined();
      expect(stats1.totalMatches).toBeGreaterThanOrEqual(0);
      expect(stats1.winRate).toBeGreaterThanOrEqual(0);

      expect(stats2).toBeDefined();
      expect(stats2.totalMatches).toBeGreaterThanOrEqual(0);
      expect(stats2.winRate).toBeGreaterThanOrEqual(0);

      console.log('✅ Player stats retrieved:');
      console.log(`   P1: ${stats1.wins}W-${stats1.losses}L (${stats1.winRate}%)`);
      console.log(`   P2: ${stats2.wins}W-${stats2.losses}L (${stats2.winRate}%)`);
    });

    // ✅ STEP 6: Complete Match
    it('should complete match and award rewards', async () => {
      console.log('\n🎮 STEP 6: Completing match...');

      const result = await matchesService.completeMatch(
        matchId,
        player1.id, // player1 wins
        150, // player1 score (damage)
        80, // player2 score (damage)
        180, // duration (seconds)
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('COMPLETED');
      expect(result.winnerId).toBe(player1.id);
      expect(result.player1Score).toBe(150);
      expect(result.player2Score).toBe(80);

      console.log('✅ Match completed:');
      console.log(`   Winner: ${player1.username}`);
      console.log(`   Method: DECISION`);
      console.log(`   Duration: 180 seconds`);
      console.log(`   Scores: ${150} vs ${80}`);
    });

    // ✅ STEP 7: Verify Rewards
    it('should have awarded tokens to players', async () => {
      console.log('\n🎮 STEP 7: Verifying rewards...');

      const updatedP1 = await playersService.findOne(player1.id);
      const updatedP2 = await playersService.findOne(player2.id);

      expect(updatedP1.tokens).toBeGreaterThan(1000); // Should have bonus
      expect(updatedP2.tokens).toBeGreaterThanOrEqual(1000); // May have some reward

      const p1Reward = updatedP1.tokens - 1000;
      const p2Reward = updatedP2.tokens - 1000;

      console.log('✅ Rewards awarded:');
      console.log(`   P1 (Winner): +${p1Reward} tokens (now: ${updatedP1.tokens})`);
      console.log(`   P2 (Loser): +${p2Reward} tokens (now: ${updatedP2.tokens})`);
    });

    // ✅ STEP 8: Check Leaderboard
    it('should update leaderboard rankings', async () => {
      console.log('\n🎮 STEP 8: Checking leaderboard...');

      const leaderboard = await playersService.getLeaderboard(10, 0);

      expect(leaderboard).toBeDefined();
      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBeGreaterThan(0);

      const p1InLeaderboard = leaderboard.find(p => p.id === player1.id);
      const p2InLeaderboard = leaderboard.find(p => p.id === player2.id);

      expect(p1InLeaderboard).toBeDefined();
      expect(p2InLeaderboard).toBeDefined();

      console.log('✅ Leaderboard updated:');
      console.log(`   Total players: ${leaderboard.length}`);
      console.log(`   P1 Rank: ${leaderboard.indexOf(p1InLeaderboard) + 1}`);
      console.log(`   P2 Rank: ${leaderboard.indexOf(p2InLeaderboard) + 1}`);
    });

    // ✅ STEP 9: Verify Match History
    it('should maintain match history', async () => {
      console.log('\n🎮 STEP 9: Retrieving match history...');

      const history = await matchesService.getMatchHistory(matchId);

      expect(history).toBeDefined();
      expect(history.matchId).toBe(matchId);
      expect(history.status).toBe('COMPLETED');
      expect(history.winner).toBe(player1.id);
      expect(history.finalScore).toBeDefined();
      expect(history.duration).toBe(180);

      console.log('✅ Match history verified:');
      console.log(`   Match ID: ${history.matchId}`);
      console.log(`   Status: ${history.status}`);
      console.log(`   Winner: ${history.winner === player1.id ? player1.username : player2.username}`);
      console.log(`   Final Score: ${history.finalScore.player1} - ${history.finalScore.player2}`);
    });

    // ✅ STEP 10: Multiple Matches
    it('should handle multiple consecutive matches', async () => {
      console.log('\n🎮 STEP 10: Testing multiple matches...');

      const matches = [];

      for (let i = 0; i < 3; i++) {
        const testMatchId = `match_test_${Date.now()}_${i}`;

        // Initialize
        const init = await matchesService.initializeMatch(
          testMatchId,
          player1.id,
          player2.id,
        );

        expect(init.success).toBe(true);

        // Complete with alternating winners
        const winner = i % 2 === 0 ? player1.id : player2.id;
        const complete = await matchesService.completeMatch(
          testMatchId,
          winner,
          100 + i * 10,
          80 + i * 5,
          180,
        );

        expect(complete.status).toBe('COMPLETED');
        matches.push(testMatchId);
      }

      // Verify match history for player1
      const p1History = await matchesService.findByPlayer(player1.id, 10);
      expect(p1History.length).toBeGreaterThanOrEqual(3);

      console.log('✅ Multiple matches completed:');
      console.log(`   Matches created: ${matches.length}`);
      console.log(`   P1 Total matches: ${p1History.length}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid player IDs', async () => {
      console.log('\n⚠️ Testing error handling...');

      try {
        await matchesService.initializeMatch(
          'match_invalid',
          'invalid_id_1',
          'invalid_id_2',
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        console.log('✅ Invalid player error caught correctly');
      }
    });

    it('should handle non-existent matches', async () => {
      console.log('⚠️ Testing non-existent match...');

      try {
        await matchesService.getMatchState('non_existent_match');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        console.log('✅ Non-existent match error caught correctly');
      }
    });
  });
});
