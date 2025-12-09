# ✅ PHASE 1 VERIFICATION - Quick Commands

**What**: Verify all Phase 1 integration is working  
**Duration**: 5 minutes
**When**: Right after integration (NOW)

---

## 🛠️ STEP 1: Check TypeScript Compilation

```bash
cd backend
npm run build
```

**Expected Output**:
```
✅ Successfully compiled
✅ No errors
✅ Output generated
```

**If Error**: Check import statements in matches.module.ts

---

## 🛠️ STEP 2: Start Development Server

```bash
npm run dev
```

**Expected Output**:
```
[✅] Nest application successfully started
[✅] Listening on port 3000
```

**Wait**: ~10 seconds for startup  
**Check**: No red error messages in console

---

## 🛠️ STEP 3: Run Combat Tests (In Another Terminal)

```bash
# NEW TERMINAL while 'npm run dev' is running
cd backend
npm run test -- combat.service.spec.ts
```

**Expected Output**:
```
PASS  src/modules/combat/combat.service.spec.ts
  CombatService
    ✓ initializeMatch
    ✓ calculateDamage
    ✓ drainStamina
    ... (25 more tests)

Tests: 30 passed, 30 total
Time: 2.345s
```

---

## 🛠️ STEP 4: Run Integration Tests

```bash
npm run test -- combat.integration.spec.ts
```

**Expected Output**:
```
PASS  test/combat.integration.spec.ts
  Combat Integration Tests
    Match Lifecycle
      ✓ should initialize match correctly
      ✓ should process full battle simulation
      ... (13 more tests)

Tests: 15+ passed
Time: 3.xxx s
```

---

## 🛠️ STEP 5: Test New API Endpoints

```bash
# Use curl or Postman

# Test 1: Start a battle
curl -X POST http://localhost:3000/matches/start \
  -H "Content-Type: application/json" \
  -d '{
    "player1Id": "123e4567-e89b-12d3-a456-426614174000",
    "player2Id": "223e4567-e89b-12d3-a456-426614174000"
  }'
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "matchId": "match_1734000000000_abc123",
  "matchState": {
    "player1Health": 100,
    "player2Health": 100,
    "currentRound": 1
  },
  "players": {
    "player1": { "id": "...", "username": "...", "level": 1 },
    "player2": { "id": "...", "username": "...", "level": 1 }
  }
}
```

---

## 🛠️ STEP 6: Verify All Tests Pass

```bash
npm run test
```

**Expected Output**:
```
Test Suites: X passed, X total
Tests: Y passed, Y total
Snapshots: 0 total
Time: Z.xxxs
```

**Must**: 0 failures

---

## ✅ CHECKLIST

Mark each completed:

- [ ] `npm run build` - No errors
- [ ] `npm run dev` - Server starts
- [ ] Combat unit tests - 30 passing
- [ ] Integration tests - 15+ passing
- [ ] API endpoint test - Returns matchState
- [ ] `npm run test` - All tests pass

---

## 🚀 IF EVERYTHING PASSES

**Phase 1 Integration is COMPLETE ✅**

Next steps:
1. Read: `PHASE_1_COMPLETION_REPORT.md`
2. Read: `COMBAT_INTEGRATION_TODO.md` (Phase 2 & 3)
3. Start Phase 2: Add more REST endpoints

---

## 🚘 IF SOMETHING FAILS

### Error: "Cannot find module 'CombatModule'"
**Fix**: Check `matches.module.ts` imports are correct

### Error: "CombatService is not defined"
**Fix**: Check `matches.service.ts` constructor has CombatService injected

### Error: "Tests fail with database errors"
**Fix**: This is normal in test environment - mocks handle it

### Error: "Port 3000 already in use"
**Fix**: Kill existing process: `lsof -ti:3000 | xargs kill -9`

---

## 📅 Files Modified

- `matches.module.ts` ✅
- `matches.service.ts` ✅
- `matches.controller.ts` ✅
- `dto/start-match.dto.ts` ✅
- `dto/index.ts` ✅

---

**Time to Complete**: 5 minutes  
**Difficulty**: Easy (just run commands)
**Status**: Ready to verify

Let's go! 🚀
