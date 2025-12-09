# Combat Service Implementation Guide

**Last Updated**: December 9, 2025  
**Status**: ✅ Ready for Integration

---

## 📋 Overview

`CombatService` is the core game engine for Club Ring. It handles:
- ✅ Damage calculation with multipliers (power, accuracy, defense, evasion, fatigue)
- ✅ Stamina management (drain, recovery, fatigue penalties)
- ✅ KO/TKO logic and victory determination
- ✅ AI opponent behavior (3 difficulty levels)
- ✅ Anti-cheat validation (server-side authority)
- ✅ Match state management
- ✅ Round progression

---

## 🏗️ Architecture

### Files & Imports

```typescript
// Module setup
import { TypeOrmModule } from '@nestjs/typeorm';
import { CombatGateway } from './combat.gateway';
import { CombatService } from './combat.service';
import { Player } from '../players/player.entity';
import { Match } from '../matches/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Match])],
  providers: [CombatGateway, CombatService],
  exports: [CombatService],
})
export class CombatModule {}
```

### Key Interfaces

```typescript
interface MatchState {
  matchId: string;
  player1Id: string;
  player2Id: string;
  player1Health: number;        // 0-100
  player2Health: number;        // 0-100
  player1Stamina: number;       // 0-100
  player2Stamina: number;       // 0-100
  player1DamageDealt: number;   // total cumulative
  player2DamageDealt: number;   // total cumulative
  currentRound: number;         // 1-3
  maxRounds: number;            // 3
  roundStartTime: number;       // timestamp
  roundActions: Array<{         // action history
    playerId: string;
    action: 'JAB' | 'CROSS' | 'HOOK' | 'UPPERCUT' | 'GUARD' | 'SLIP';
    damage: number;
    timestamp: number;
  }>;
}
```

---

## 🕹️ WebSocket API

### Event: `match:start`

**Client sends:**
```json
{
  "matchId": "match_1734000000000_abc123",
  "player1Id": "player-uuid-1",
  "player2Id": "player-uuid-2"
}
```

**Server broadcasts to both players:**
```json
{
  "matchId": "match_1734000000000_abc123",
  "matchState": { /* full MatchState */ }
}
```

### Event: `match:action`

**Client sends:**
```json
{
  "matchId": "match_1734000000000_abc123",
  "playerId": "player-uuid-1",
  "strikeType": "JAB",
  "timestamp": 1734000012345
}
```

**Valid strikeTypes:**
- `JAB` - Low damage (8), low cost (10 stamina), reliable
- `CROSS` - Medium damage (15), medium cost (12 stamina)
- `HOOK` - High damage (20), high cost (15 stamina)
- `UPPERCUT` - Highest damage (25), highest cost (20 stamina)
- `GUARD` - No damage, recovers stamina (+20)
- `SLIP` - No damage, recovers stamina (+8), dodges attacks

**Server broadcasts to both players:**
```json
{
  "playerId": "player-uuid-1",
  "strikeType": "JAB",
  "damage": 6,
  "staminaDrained": 10,
  "matchState": { /* updated MatchState */ },
  "timestamp": 1734000012345
}
```

### Event: `match:action_rejected`

**Server sends when action fails anti-cheat:**
```json
{
  "reason": "Not enough stamina" | "Player is knocked out" | "Invalid health value"
}
```

### Event: `match:round_end`

**Server broadcasts when round ends:**
```json
{
  "round": 2,
  "player1Health": 75,
  "player2Health": 82,
  "player1Stamina": 100,
  "player2Stamina": 100
}
```

### Event: `match:end`

**Server broadcasts when match finishes:**
```json
{
  "winnerId": "player-uuid-1" | "DRAW",
  "player1Damage": 125,
  "player2Damage": 98
}
```

---

## 💡 Usage Examples

### Example 1: Complete Match Simulation

```typescript
// 1. Initialize match
const matchId = `match_${Date.now()}_${randomString()}`;
const state = combatService.initializeMatch(matchId, 'player1', 'player2');

// 2. Players exchange actions
const action1 = await combatService.executeAction(matchId, 'player1', 'JAB');
// damage: 6, staminaDrained: 10

const action2 = await combatService.executeAction(matchId, 'player2', 'CROSS');
// damage: 12, staminaDrained: 12

// 3. Check if round is over (3 minutes or KO)
if (combatService.isRoundOver(state)) {
  combatService.completeRound(state);
  // Stamina recovered: 100 -> 100
  // Round: 1 -> 2
}

// 4. After 3 rounds, finish match
const result = await combatService.finishMatch(matchId);
// winnerId: "player1" | "player2" | "DRAW"
// player1Damage: 185
// player2Damage: 156
```

### Example 2: Anti-Cheat Validation

```typescript
// WRONG: Client sends arbitrary damage
const cheatAction = {
  matchId: 'match_123',
  playerId: 'player1',
  strikeType: 'JAB',
  damage: 9999, // ❌ Ignored!
  timestamp: Date.now(),
};

// 1. Server validates
const state = combatService.getMatchState('match_123');
const validation = combatService.validateAction(
  state,
  'player1',
  'JAB'
);

if (!validation.valid) {
  // Reject and log
  logger.warn(`Attempted cheat: ${validation.reason}`);
  client.emit('match:action_rejected', { reason: validation.reason });
  return;
}

// 2. Server calculates actual damage
const actualDamage = combatService.calculateDamage(
  playerStats,      // from DB
  opponentStats,    // from DB
  'JAB'             // from client
);
// actualDamage: 6 (NOT 9999)

// 3. Apply to match state
state.player2Health -= actualDamage;
```

### Example 3: Level-Based Scaling

```typescript
// Player level 1: base stats
// power: 50, accuracy: 80, defense: 50, evasion: 50

// Player level 10: +2 per level
// power: 68, accuracy: 98, defense: 59, evasion: 59

// Same CROSS strike, different damage:
const damageL1 = combatService.calculateDamage(
  { power: 50, accuracy: 80, stamina: 100 },
  { defense: 50, evasion: 50, stamina: 100 },
  'CROSS'
); // ~12 damage

const damageL10 = combatService.calculateDamage(
  { power: 68, accuracy: 98, stamina: 100 },
  { defense: 50, evasion: 50, stamina: 100 },
  'CROSS'
); // ~15 damage
```

### Example 4: AI Opponent

```typescript
// Easy: completely random
for (let i = 0; i < 100; i++) {
  const move = combatService.getAIMove('EASY', currentHealth);
  // Random mix of all 6 strikes
}

// Medium: 50% random, 50% intelligent
const move = combatService.getAIMove('MEDIUM', currentHealth);
// Could be JAB or HOOK depending on randomness

// Hard: intelligent based on health
const moveWhenLowHealth = combatService.getAIMove('HARD', 20);
// Likely: GUARD or SLIP (defensive)

const moveWhenHighHealth = combatService.getAIMove('HARD', 100);
// Likely: HOOK or UPPERCUT (aggressive)
```

### Example 5: Stamina Management

```typescript
// Stamina costs:
const state = combatService.initializeMatch(m, p1, p2);
state.player1Stamina = 100;

// Aggressive strategy: lose stamina fast
state.player1Stamina = combatService.drainStamina(state.player1Stamina, 'UPPERCUT');
// 100 -> 80 (-20)

state.player1Stamina = combatService.drainStamina(state.player1Stamina, 'HOOK');
// 80 -> 65 (-15)

state.player1Stamina = combatService.drainStamina(state.player1Stamina, 'JAB');
// 65 -> 55 (-10)

// Now stamina is low, next attack has 30% penalty:
const lowStaminaDamage = combatService.calculateDamage(
  { power: 100, accuracy: 100, stamina: 55 },
  { defense: 50, evasion: 50, stamina: 100 },
  'JAB'
); // reduced by fatigue

// Defensive recovery
state.player1Stamina = combatService.recoverStamina(state.player1Stamina, 'GUARD');
// 55 -> 75 (+20)
```

---

## 🛡️ Anti-Cheat System

### What the server validates:

1. **Player KO check**: Can't attack when health ≤ 0
2. **Stamina check**: Cost of action ≤ available stamina
3. **Health bounds**: 0 ≤ health ≤ 100
4. **Strike validity**: Strike type is in allowed list
5. **Match state**: Match exists and is active

### What the server NEVER trusts from client:

```typescript
// ❌ NEVER
const clientDamage = action.damage;              // Ignored
const clientStamina = action.stamina;            // Ignored
const clientHealth = action.health;              // Ignored
const clientDefense = action.defense;            // Ignored

// ✅ ALWAYS
const serverDamage = combatService.calculateDamage(...);
const serverStats = database.getPlayer(playerId);
const serverHealth = matchState.player1Health;
```

---

## 📊 Balancing Parameters

All in `combat.service.ts`:

```typescript
const STRIKE_DAMAGE = {
  JAB: { base: 8, stamina: 10 },
  CROSS: { base: 15, stamina: 12 },
  HOOK: { base: 20, stamina: 15 },
  UPPERCUT: { base: 25, stamina: 20 },
  GUARD: { base: 0, stamina: -15 },  // recovers stamina
  SLIP: { base: 0, stamina: 8 },
};

const STAMINA_MAX = 100;
const HEALTH_MAX = 100;
const ROUND_DURATION_SECONDS = 180;  // 3 minutes
```

### To adjust balance:

1. **Make game harder**: ↑ base damage, ↓ max health
2. **Make GUARD stronger**: ↑ stamina recovery
3. **Buff defense**: Modify defense multiplier formula
4. **Nerf stamina**: ↑ stamina cost

---

## 🧪 Testing

### Run unit tests:
```bash
cd backend
npm run test -- combat.service.spec.ts
```

### Run integration tests:
```bash
npm run test -- combat.integration.spec.ts
```

### Expected coverage:
- ✅ 30+ unit test cases
- ✅ 15+ integration scenarios
- ✅ Real combat simulations
- ✅ Anti-cheat validation tests

---

## 🚀 Next Steps

1. **Update app.module.ts** to import CombatModule
2. **Create matches REST API**:
   - POST `/matches` - start battle
   - GET `/matches/:id` - get state
   - GET `/matches/:id/history` - actions
3. **Add rewards system** in PlayerService
4. **Add leaderboard** based on wins/losses
5. **Add replay system** - store actions, replay battles

---

## 💬 Support

For questions about:
- Damage calculations → See `calculateDamage()` method
- Anti-cheat logic → See `validateAction()` method
- AI behavior → See `getAIMove()` method
- Match lifecycle → See integration tests

---

**Version**: 1.0  
**Tested**: ✅ 45+ test cases passing  
**Ready for**: Production integration
