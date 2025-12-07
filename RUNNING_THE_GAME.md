# 🎮 Running the Complete Game

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+
- npm or yarn
- Git

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/kaylas000/Club-Ring-Game.git
cd Club-Ring-Game
git checkout production-setup
```

### 2. Setup Environment
```bash
cp .env.example .env

# Edit .env with your settings:
# - JWT_SECRET (minimum 32 characters)
# - DB_PASSWORD
# - NODE_ENV
```

### 3. Update Backend Module

Edit `backend/src/app.module.ts` and add:

```typescript
import { GameModule } from './game/game.module';
import { GameGateway } from './websocket/game.gateway';

@Module({
  imports: [
    // ... existing imports
    GameModule,
  ],
  providers: [GameGateway],
})
export class AppModule {}
```

### 4. Start All Services

```bash
# Build and start containers
docker-compose up -d

# Wait for services to start (30 seconds)
sleep 30

# Check status
docker-compose ps
```

### 5. Initialize Database

```bash
# Create migrations
docker-compose exec backend npm run typeorm migration:generate -- -n CreateGameTables

# Run migrations
docker-compose exec backend npm run typeorm migration:run
```

### 6. Access the Game

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432
- **Redis Cache**: localhost:6379

## Verification

```bash
# Check backend health
curl http://localhost:3001/health

# Expected response: {"status":"ok"}

# Get empty leaderboard
curl http://localhost:3001/api/game/leaderboard/level

# Expected response: []
```

## Testing the Game

### In Browser Console (F12)

```javascript
// Connect to game socket
const socket = io('ws://localhost:3001/game', {
  auth: { userId: 'test-player-1' }
});

socket.on('connected', (data) => console.log('Connected:', data));

// Join matchmaking
socket.emit('matchmaking:join');
```

### API Testing

```bash
# Get player progress
curl http://localhost:3001/api/game/progress/test-player-1

# Get achievements
curl http://localhost:3001/api/game/achievements/test-player-1

# Get leaderboard by wins
curl http://localhost:3001/api/game/leaderboard/wins
```

## Docker Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U postgres -d club_ring

# Access backend container
docker-compose exec backend bash
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose up -d --build backend
```

### Database connection error
```bash
# Wait for postgres
docker-compose exec postgres pg_isready -U postgres

# If still failing, recreate
docker-compose down -v
docker-compose up -d
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Or change port in docker-compose.yml
```

### WebSocket connection failed
```bash
# Check CORS settings in game.gateway.ts
# Ensure FRONTEND_URL environment variable is correct
```

## Game Features Ready

✅ **Combat System**
- Attack, Defend, Skill, Heal actions
- Damage calculation with critical hits
- Stamina management
- Real-time battle updates

✅ **Progression**
- Level system (1-infinity)
- Experience tracking
- Stat growth per level

✅ **Achievements**
- 5 base achievements
- Coin rewards
- Achievement unlocking

✅ **Leaderboard**
- Top 100 by level
- Top 100 by wins
- Win rate calculation
- Player ranking

✅ **Real-time Features**
- WebSocket communication
- Live battle updates
- Matchmaking queue
- Achievement notifications

## Production Deployment

### Railway
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Railway auto-deploys on push

### Render
1. Create New > Web Service
2. Connect GitHub
3. Set build command: `docker-compose build`
4. Set start command: `docker-compose up`

### AWS/EC2
1. SSH into instance
2. Install Docker & Docker Compose
3. Clone repository
4. `docker-compose -f docker-compose.prod.yml up -d`

---

**Everything is ready to play! 🎮🚀**
