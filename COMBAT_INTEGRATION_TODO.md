# 💫 Combat Service Integration TODO

**Status**: Implementation Complete, Ready for Integration  
**Completed**: 
- ✅ CombatService with full game mechanics
- ✅ CombatGateway with WebSocket integration
- ✅ 45+ unit tests
- ✅ Integration tests
- ✅ Comprehensive documentation

**What to do next**: Follow this checklist to integrate into your app

---

## ❏ Phase 1: Module Integration (1-2 hours)

### ☐ Step 1: Update app.module.ts

**File**: `backend/src/app.module.ts`

```typescript
import { CombatModule } from './modules/combat/combat.module';
import { GatewayModule } from '@nestjs/websockets'; // if not present

@Module({
  imports: [
    // ... existing imports
    CombatModule,  // ✅ ADD THIS
  ],
  // ...
})
export class AppModule {}
```

### ☐ Step 2: Verify TypeORM configuration

**File**: `backend/src/app.module.ts` or `database.config.ts`

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  // ...
  entities: [
    // Make sure Player and Match are included
    'src/modules/**/**.entity{.ts,.js}',
    // OR explicitly:
    Player,
    Match,
  ],
  migrations: [],
  synchronize: process.env.NODE_ENV === 'development',
})
```

**Verify migration exists**:
```bash
ls backend/src/database/migrations/
# Should see Match and Player tables
```

### ☐ Step 3: Check WebSocket configuration

**File**: `backend/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for WebSocket
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
```

### ☐ Step 4: Run tests to verify integration

```bash
cd backend
npm install  # if missing any deps
npm run test -- combat.service.spec.ts
# Should see: ✅ PASS 30+ tests

npm run test -- combat.integration.spec.ts
# Should see: ✅ PASS 15+ tests
```

---

## ❏ Phase 2: REST API Endpoints (2-3 hours)

### ☐ Step 5: Create MatchesController

**File**: `backend/src/modules/matches/matches.controller.ts`

```typescript
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post('start')
  @UseGuards(AuthGuard('jwt'))
  async startMatch(@Body() dto: StartMatchDto) {
    // TODO: Call matchesService.startMatch()
    // Returns matchId to use in WebSocket
  }

  @Get(':id')
  async getMatch(@Param('id') matchId: string) {
    // TODO: Get match from database
    // Return Match entity with current scores
  }

  @Get(':id/history')
  async getMatchHistory(@Param('id') matchId: string) {
    // TODO: Return list of actions for replay
  }

  @Get('player/:playerId')
  async getPlayerMatches(@Param('playerId') playerId: string) {
    // TODO: Get all matches for player
    // Include stats: wins, losses, avg damage
  }
}
```

**DTO**: `backend/src/modules/matches/dto/start-match.dto.ts`

```typescript
import { IsString, IsEnum } from 'class-validator';

export class StartMatchDto {
  @IsString()
  opponentId: string;

  @IsEnum(['EASY', 'MEDIUM', 'HARD'])
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';

  @IsEnum(['PRACTICE', 'RANKED'])
  mode: 'PRACTICE' | 'RANKED';
}
```

### ☐ Step 6: Update MatchesService

**File**: `backend/src/modules/matches/matches.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { CombatService } from '../combat/combat.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private combatService: CombatService,
  ) {}

  async startMatch(
    player1Id: string,
    player2Id: string,
    difficulty: string,
    mode: string,
  ): Promise<Match> {
    // TODO:
    // 1. Create Match entity
    // 2. Save to DB
    // 3. Initialize combat state via combatService
    // 4. Return match
  }

  async finishMatch(matchId: string): Promise<void> {
    // TODO:
    // 1. Get match state from combatService
    // 2. Call combatService.finishMatch()
    // 3. Update player stats (wins/losses)
    // 4. Award rewards ($RING tokens)
  }
}
```

### ☐ Step 7: Add Matches to MatchesModule

**File**: `backend/src/modules/matches/matches.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './match.entity';
import { CombatModule } from '../combat/combat.module'; // ✅ ADD THIS

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    CombatModule,  // ✅ ADD THIS to use CombatService
  ],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
```

---

## ❏ Phase 3: Rewards System (1-2 hours)

### ☐ Step 8: Add Reward Calculation

**File**: `backend/src/modules/matches/matches.service.ts`

```typescript
async finishMatch(matchId: string): Promise<void> {
  const match = await this.matchRepository.findOne({ where: { matchId } });
  if (!match) return;

  const result = await this.combatService.finishMatch(matchId);

  // Calculate rewards
  let winnerReward = 0;
  let loserReward = 0;

  if (result.winnerId !== 'DRAW') {
    // Winner gets more
    winnerReward = 50 + Math.floor(result.player1Damage / 10);
    loserReward = 25 + Math.floor(result.player2Damage / 20);

    // Cap daily rewards
    winnerReward = Math.min(winnerReward, 300); // max 300 per battle
    loserReward = Math.min(loserReward, 100);
  } else {
    // Draw: both get equal
    winnerReward = 50;
    loserReward = 50;
  }

  // Award to players
  const player1 = await this.playersRepository.findOne({ where: { id: match.player1Id } });
  const player2 = await this.playersRepository.findOne({ where: { id: match.player2Id } });

  if (result.winnerId === match.player1Id) {
    player1.ringTokens += winnerReward;
    player1.wins++;
    player2.ringTokens += loserReward;
    player2.losses++;
  } else if (result.winnerId === match.player2Id) {
    player2.ringTokens += winnerReward;
    player2.wins++;
    player1.ringTokens += loserReward;
    player1.losses++;
  } else {
    player1.ringTokens += winnerReward;
    player2.ringTokens += loserReward;
    player1.draws++;
    player2.draws++;
  }

  await this.playersRepository.save([player1, player2]);
}
```

### ☐ Step 9: Update Player stats

**File**: `backend/src/modules/players/player.entity.ts`

```typescript
@Entity('players')
export class Player {
  // existing fields...

  @Column({ default: 0 })
  totalBattlesThisDay: number; // for daily cap

  @Column({ type: 'date' })
  lastRewardDate: Date; // reset daily

  @Column({ default: 0 })
  totalRingsEarnedToday: number; // for daily cap (5000)
}
```

---

## ❏ Phase 4: Frontend Integration (2-3 hours)

### ☐ Step 10: WebSocket Client Setup

**File**: `frontend/src/services/websocket.ts`

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/combat', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Emit match start
socket.emit('match:start', {
  matchId: 'match_' + Date.now() + '_' + random(),
  player1Id: currentUserId,
  player2Id: opponentId,
});

// Listen for match updates
socket.on('match:action_result', (data) => {
  console.log(`${data.playerId} dealt ${data.damage} damage with ${data.strikeType}`);
  updateUI(data.matchState);
});

// Listen for round end
socket.on('match:round_end', (data) => {
  console.log(`Round ${data.round} ended!`);
});

// Listen for match end
socket.on('match:end', (data) => {
  console.log(`Winner: ${data.winnerId}`);
  console.log(`Total damage - P1: ${data.player1Damage}, P2: ${data.player2Damage}`);
});
```

### ☐ Step 11: Battle UI Component

**File**: `frontend/src/components/BattleScreen.tsx`

```typescript
import { useEffect, useState } from 'react';
import { socket } from '../services/websocket';

export function BattleScreen({ matchId, playerId }) {
  const [state, setState] = useState(null);

  const sendAction = (strikeType: string) => {
    socket.emit('match:action', {
      matchId,
      playerId,
      strikeType,
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    socket.on('match:action_result', (data) => {
      setState(data.matchState);
    });

    return () => socket.off('match:action_result');
  }, []);

  if (!state) return <div>Loading...</div>;

  return (
    <div>
      {/* Player 1 Health Bar */}
      <div>P1 Health: {state.player1Health}/100</div>
      <div>P1 Stamina: {state.player1Stamina}/100</div>

      {/* Player 2 Health Bar */}
      <div>P2 Health: {state.player2Health}/100</div>
      <div>P2 Stamina: {state.player2Stamina}/100</div>

      {/* Strike Buttons */}
      <button onClick={() => sendAction('JAB')}>JAB</button>
      <button onClick={() => sendAction('CROSS')}>CROSS</button>
      <button onClick={() => sendAction('HOOK')}>HOOK</button>
      <button onClick={() => sendAction('UPPERCUT')}>UPPERCUT</button>
      <button onClick={() => sendAction('GUARD')}>GUARD</button>
      <button onClick={() => sendAction('SLIP')}>SLIP</button>

      {/* Action Log */}
      <div>
        {state.roundActions.map((action, i) => (
          <div key={i}>
            {action.playerId === playerId ? 'You' : 'Opponent'} used {action.action}
            {action.damage > 0 && ` - ${action.damage} damage`}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Verification Checklist

Before moving to next phase:

### Unit Tests
- [ ] `npm run test -- combat.service.spec.ts` ✅ PASSING
- [ ] Coverage > 70%
- [ ] All 30+ test cases pass

### Integration Tests
- [ ] `npm run test -- combat.integration.spec.ts` ✅ PASSING
- [ ] Real battle simulations work
- [ ] Anti-cheat validation works

### API
- [ ] `npm run dev` starts without errors
- [ ] POST `/matches` returns match ID
- [ ] GET `/matches/:id` returns match state

### WebSocket
- [ ] Connect to `/combat` namespace
- [ ] `match:start` initializes match
- [ ] `match:action` processes strikes
- [ ] `match:end` broadcasts winner

### Frontend
- [ ] Battle screen renders
- [ ] Buttons send actions
- [ ] Health bars update real-time
- [ ] Victory screen shows rewards

---

## 🚨 Common Issues & Solutions

### Issue: "TypeORM: entities not found"
**Solution**: Check `TypeOrmModule.forRoot()` has `entities` array with Player and Match

### Issue: "WebSocket connection failed"
**Solution**: Check CORS config in `main.ts` includes frontend URL

### Issue: "Tests fail with 'Player not found'"
**Solution**: Mock `playersRepository.findOne()` in tests (already done)

### Issue: "Combat doesn't initialize"
**Solution**: Verify `CombatModule` is imported in `app.module.ts`

---

## 📅 Estimated Timeline

- **Phase 1 (Integration)**: 1-2 hours
- **Phase 2 (REST API)**: 2-3 hours
- **Phase 3 (Rewards)**: 1-2 hours
- **Phase 4 (Frontend)**: 2-3 hours

**Total**: 6-10 hours to full integration

---

## 🏃 Next: After Integration

Once integrated:

1. [ ] Run full test suite: `npm run test`
2. [ ] Check coverage: `npm run test:cov`
3. [ ] Deploy to staging
4. [ ] Manual testing with real players
5. [ ] Gather balance feedback
6. [ ] Launch to production

---

**Version**: 1.0  
**Last Updated**: December 9, 2025  
**Status**: ✅ Ready for implementation
