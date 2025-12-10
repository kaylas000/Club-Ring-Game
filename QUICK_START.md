# 🚀 Club Ring Game - Quick Start Guide

**Last Updated**: December 10, 2025  
**Status**: 🧱 MVP Ready for Integration Testing  
**Next Step**: Full E2E testing

---

## 💻 Project Setup

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0 OR yarn >= 3.0.0
PostgreSQL 14+ (optional, can use SQLite for testing)
Redis (optional, for caching)
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# KEY VALUES:
# DATABASE_URL=postgresql://user:password@localhost:5432/club_ring_game
# PORT=4000
# JWT_SECRET=your_secret_key
# FRONTEND_URL=http://localhost:5173

# Run database migrations
npm run migration:run

# Start development server
npm run dev

# Backend should be running at http://localhost:4000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# KEY VALUES:
# VITE_API_URL=http://localhost:4000
# VITE_WS_URL=ws://localhost:4000

# Start development server
npm run dev

# Frontend should be running at http://localhost:5173
```

---

## 🤋 What Was Just Implemented (Dec 10, 2025)

### ✅ Completed Components

#### 1. **WebSocket Integration in BattleScene**
```typescript
// File: frontend/src/game/scenes/BattleScene.ts
// Features:
// - Real-time WebSocket connection
// - Match state synchronization
// - Live action processing
// - Opponent health/stamina updates
// - Fallback offline mode
```

#### 2. **BattleResults Component**
```typescript
// File: frontend/src/components/Game/BattleResults.tsx
// Features:
// - Victory/defeat display
// - Match statistics visualization
// - Rewards calculation and display
// - Performance metrics
// - Share functionality
```

#### 3. **MatchLobby Integration**
```typescript
// File: frontend/src/components/Match/MatchLobby.tsx
// Features:
// - API-driven match creation
// - Difficulty selection
// - Wager management
// - Error handling
// - Real-time feedback
```

#### 4. **Comprehensive E2E Tests**
```bash
# File: backend/tests/e2e/full-game-flow.spec.ts
# Tests:
# - Player creation
# - Match initialization
# - Combat action processing
# - Match completion
# - Reward distribution
# - Leaderboard updates
# - Match history tracking
```

---

## 🔄 Running Tests

### Unit Tests

```bash
# Backend unit tests
cd backend
npm run test

# Specific module
npm run test -- combat.service
npm run test -- matches.service

# With coverage
npm run test:cov
```

### E2E Tests

```bash
# Run full E2E test suite
cd backend
npm run test:e2e

# Specific E2E test
npm run test:e2e -- full-game-flow.spec.ts

# Watch mode
npm run test:e2e -- --watch
```

### Frontend Tests

```bash
cd frontend

# Run component tests
npm run test

# Integration tests
npm run test:integration

# E2E tests with Cypress
npm run test:e2e
```

---

## 🤋 Testing Full Game Flow

### Option 1: Manual Testing (Recommended for first time)

```bash
# Terminal 1: Start Backend
cd backend
npm run dev
# You should see: ✅ Server running on http://localhost:4000

# Terminal 2: Start Frontend
cd frontend
npm run dev
# You should see: ✅ Local: http://localhost:5173

# Terminal 3: Use curl or Postman to test
```

### Option 2: Automated E2E Test

```bash
# Run complete game flow test
cd backend
npm run test:e2e -- full-game-flow.spec.ts

# Expected output:
# 🎮 STEP 1: Creating players...
# ✅ Players created: P1, P2
# 🎮 STEP 2: Initializing match...
# ✅ Match initialized
# ... (continues through 10 steps)
# ✅ All tests passed!
```

---

## 🔌 API Testing Examples

### 1. Create Players

```bash
curl -X POST http://localhost:4000/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Champion",
    "telegramId": "tg_12345"
  }'

# Response:
# {
#   "id": "uuid",
#   "username": "Champion",
#   "level": 1,
#   "tokens": 1000,
#   "wins": 0,
#   "losses": 0
# }
```

### 2. Start a Match

```bash
curl -X POST http://localhost:4000/api/matches/start \
  -H "Content-Type: application/json" \
  -d '{
    "player1Id": "<player1_id>",
    "player2Id": "<player2_id>",
    "difficulty": "MEDIUM",
    "betAmount": 100
  }'

# Response:
# {
#   "success": true,
#   "matchId": "match_123456",
#   "matchState": {
#     "player1": { "health": 100, "stamina": 100 },
#     "player2": { "health": 100, "stamina": 100 },
#     "round": 1,
#     "timeRemaining": 180
#   }
# }
```

### 3. Get Leaderboard

```bash
curl http://localhost:4000/api/players/leaderboard?limit=10&offset=0

# Response:
# [
#   {
#     "rank": 1,
#     "username": "Champion",
#     "level": 5,
#     "tokens": 5000,
#     "wins": 25,
#     "winRate": 83.3
#   },
#   ...
# ]
```

### 4. Get Player Stats

```bash
curl http://localhost:4000/api/players/<player_id>/stats

# Response:
# {
#   "totalMatches": 30,
#   "wins": 25,
#   "losses": 5,
#   "draws": 0,
#   "winRate": 83.3,
#   "totalDamageDealt": 5000,
#   "avgDamagePerMatch": 166.7
# }
```

### 5. Complete a Match

```bash
curl -X POST http://localhost:4000/api/matches/<match_id>/complete \
  -H "Content-Type: application/json" \
  -d '{
    "winnerId": "<player1_id>",
    "player1Score": 150,
    "player2Score": 80,
    "duration": 180
  }'

# Response:
# {
#   "id": "match_id",
#   "status": "COMPLETED",
#   "winnerId": "player1_id",
#   "player1Score": 150,
#   "player2Score": 80
# }
```

---

## 📈 WebSocket Testing

### Using WebSocket Client

```javascript
// Connect to WebSocket
const socket = io('http://localhost:4000');

// Listen for match state updates
socket.on('match:state', (state) => {
  console.log('Match state:', state);
  // {
  //   player1: { health: 95, stamina: 90 },
  //   player2: { health: 85, stamina: 95 },
  //   round: 1,
  //   timeRemaining: 175
  // }
});

// Send combat action
socket.emit('match:action', {
  matchId: 'match_123',
  playerId: 'player_1',
  actionType: 'jab',
  targetArea: 'head'
});

// Listen for action results
socket.on('match:action', (result) => {
  console.log('Action result:', result);
  // {
  //   success: true,
  //   damage: 8,
  //   accuracy: 95
  // }
});

// Listen for match end
socket.on('match:end', (result) => {
  console.log('Match ended:', result);
  // {
  //   winner: 'player_1',
  //   method: 'DECISION',
  //   rewards: { winner: 300, loser: 100 }
  // }
});
```

---

## 🛠 Troubleshooting

### Backend Won't Start

```bash
# Check if port 4000 is in use
lsof -i :4000

# Kill process on port 4000
kill -9 <PID>

# Check database connection
DATABASE_URL=your_url npm run typeorm migration:show

# Reset database
npm run typeorm migration:revert
npm run migration:run
```

### Frontend Won't Connect to Backend

```bash
# Check VITE_API_URL in .env
cat frontend/.env

# Should be:
# VITE_API_URL=http://localhost:4000
# VITE_WS_URL=ws://localhost:4000

# Check backend is running
curl http://localhost:4000/api/health
```

### WebSocket Connection Failed

```bash
# Check WebSocket server is running
netstat -an | grep 4000

# Check browser console for errors
# DevTools > Console tab

# Verify Socket.IO is initialized in backend
# backend/src/main.ts should have:
# const io = new Server(app.getHttpServer())
```

### Tests Failing

```bash
# Check node version (must be >= 18)
node --version

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- full-game-flow.spec.ts
```

---

## 🚀 Next Steps

### Immediate (Today/Tomorrow)
- [ ] Run E2E test suite
- [ ] Verify all API endpoints
- [ ] Test WebSocket real-time sync
- [ ] Fix any bugs from testing

### This Week
- [ ] Performance testing
- [ ] Load testing (100+ concurrent users)
- [ ] Security hardening
- [ ] Deploy to staging

### Next Week
- [ ] Beta testing with 100-200 users
- [ ] Gather feedback
- [ ] Final bug fixes
- [ ] Production deployment

---

## 🌟 Key Files Modified (Dec 10)

```
frontend/src/game/scenes/BattleScene.ts       (+400 lines) WebSocket integration
frontend/src/components/Game/BattleResults.tsx (+300 lines) Results display
frontend/src/components/Match/MatchLobby.tsx   (+250 lines) API integration
backend/tests/e2e/full-game-flow.spec.ts       (+350 lines) E2E test suite
frontend/src/components/Game/BattleResults.css (+350 lines) Styling
frontend/src/components/Match/MatchLobby.css   (+320 lines) Styling
```

---

## 💡 Tips for Development

### Hot Reloading

```bash
# Both backend and frontend support hot reload
# Just save files and changes apply automatically
# No need to restart!
```

### Debugging

```bash
# Backend debugging
node --inspect=9229 dist/main.js
# Then open chrome://inspect in Chrome

# Frontend debugging
# Just use browser DevTools (F12)
```

### Database Management

```bash
# Create new migration
npm run typeorm migration:create -- src/migrations/MyMigration

# View migrations
npm run typeorm migration:show

# Revert last migration
npm run typeorm migration:revert
```

---

## 💫 Need Help?

- Check `/docs` folder for detailed documentation
- Review test files for usage examples
- Check GitHub issues for known problems
- See `TROUBLESHOOTING.md` for common issues

---

**Ready to test? Start with:**

```bash
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2
# Open http://localhost:5173 in browser
```

🙋 Happy coding! 🙋
