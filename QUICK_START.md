# 🚀 Quick Start Guide

## Option 1: Docker Compose (Recommended)

```bash
# 1. Clone and enter directory
git clone https://github.com/kaylas000/Club-Ring-Game.git
cd Club-Ring-Game
git checkout production-setup

# 2. Setup environment
cp .env.example .env
# Edit .env if needed (change passwords!)

# 3. Start services
docker-compose up -d

# 4. Wait for services
sleep 10
docker-compose ps

# 5. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Option 2: Local Development

```bash
# Terminal 1: Database & Cache
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine

# Terminal 2: Backend
cd backend
cp .env.local ../.env
npm install
npm run start:dev

# Terminal 3: Frontend
cd frontend
cp .env.local ../.env.local
npm install
npm run dev

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Option 3: Cloud Deployment

### Railway (5 minutes)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your fork of Club-Ring-Game
4. Add PostgreSQL and Redis from Railway marketplace
5. Set environment variables
6. Deploy!

### Render (10 minutes)

1. Create account at https://render.com
2. "New Web Service" → Connect GitHub
3. Select Club-Ring-Game
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Add PostgreSQL database
7. Deploy!

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart
docker-compose restart

# Remove everything (careful!)
docker-compose down -v

# Database migration
docker-compose exec backend npm run migration:run

# Database connection
psql -h localhost -U clubring -d club_ring_game
```

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # Database
lsof -i :6379  # Redis
```

**Services not healthy:**
```bash
docker-compose logs
docker-compose restart
```

**Database error:**
```bash
docker-compose down -v
docker-compose up -d
```

## What's Next?

1. Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup
2. Check [README.md](README.md) for project overview
3. Join our community at https://t.me/clubringgame

✨ That's it! Your Club Ring Game is ready!
