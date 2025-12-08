# 📧 CLUB RING - TECHNICAL SETUP GUIDE

**Purpose**: Complete guide for developers to set up the Club Ring project  
**Version**: 1.0  
**Last Updated**: December 8, 2025  

---

## 📊 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Database Setup](#database-setup)
6. [Development Workflow](#development-workflow)
7. [Deployment](#deployment)

---

## ✅ PREREQUISITES

### Required Software

```bash
# Node.js 18+ (LTS recommended)
node --version  # v18.17.0 or higher

# Package Manager
npm --version   # v9.0.0 or higher

# Git
git --version   # 2.40.0 or higher

# Docker (for local database)
docker --version

# PostgreSQL 15+ (local development)
psql --version

# Redis 7+ (local caching)
redis-cli --version
```

### System Requirements

- **OS**: macOS, Linux, or Windows (WSL2)
- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 20GB free space
- **Internet**: Stable connection required

---

## 📡 PROJECT STRUCTURE

```
Club-Ring-Game/
├── frontend/
│   ├── src/
│   │   ├── scenes/          # Phaser scenes
│   │   ├── entities/        # Game objects (Boxer, Strike, etc)
│   │   ├── systems/        # Combat, HUD, etc
│   │   ├── components/     # React components
│   │   ├── services/       # API, Socket, Auth
│   │   ├── store/          # Zustand stores
│   │   ├┠── App.tsx
│   │   └── main.tsx
│   ├── public/         # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── users/          # User module
│   │   ├── game/           # Game logic
│   │   ├── battle/         # Battle system
│   │   ├── economy/        # RING token
│   │   ├─┠ app.module.ts
│   │   └── main.ts
│   ├── test/           # Unit tests
│   ├── package.json
│   └── tsconfig.json
│
├── smart-contracts/
│   ├── contracts/
│   │   ├── RingToken.fc    # TON FunC
│   │   ├── NFTFighter.fc
│   │   └── Marketplace.fc
│   ├── tests/
│   └── package.json
│
├── packages/
│   ├── shared/         # Shared types
│   └── ui/             # Common components
│
├── docs/
│   ├┠── COMBAT_SYSTEM_SPEC.md
│   ├── API.md
│   └── ARCHITECTURE.md
│
├── .github/
│   └── workflows/      # CI/CD pipelines
│
├── docker-compose.yml
├── package.json
├── turbo.json
└── README.md
```

---

## 👩‍💻 FRONTEND SETUP

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

**File: `.env.local`**
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Telegram Mini App
VITE_TELEGRAM_BOT_ID=YOUR_BOT_ID_HERE

# TON Blockchain
VITE_TON_MANIFEST=http://localhost:3000/tonconnect-manifest.json
VITE_TON_NETWORK=testnet  # or mainnet

# Analytics
VITE_ANALYTICS_ID=YOUR_ANALYTICS_ID

# Features
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_DATA=true
```

### 3. Start Development Server

```bash
# Terminal 1: Frontend
npm run dev
# Output: Local: http://localhost:5173/

# Terminal 2: Backend (see Backend Setup)
npm run dev
# Output: Server: http://localhost:3001/
```

### 4. Key NPM Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext ts,tsx",
  "type-check": "tsc --noEmit",
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

---

## 🖥️ BACKEND SETUP

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

**File: `.env`**
```env
# Application
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=club_ring_dev
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Telegram
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_API_KEY=YOUR_API_KEY_HERE

# TON Blockchain
TON_NETWORK=testnet
TON_MNEMONIC=your_mnemonic_phrase_here

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# AWS (for production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### 3. Database Setup

```bash
# Using Docker Compose
docker-compose up -d postgres redis

# Or using local installations
psql -U postgres -c "CREATE DATABASE club_ring_dev;"

# Run migrations
npm run migration:run

# Seed database (optional)
npm run seed
```

### 4. Start Backend Server

```bash
npm run dev

# Output:
# [Nest] 12/08/2025, 10:30:00 AM - Nest application successfully started
# Server running on http://localhost:3001
```

### 5. Key NPM Scripts

```json
{
  "dev": "nest start --watch",
  "build": "nest build",
  "start:prod": "node dist/main.js",
  "lint": "eslint src --ext ts",
  "test": "jest",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "migration:generate": "typeorm migration:generate",
  "migration:run": "typeorm migration:run",
  "seed": "ts-node src/seeds/main.seed.ts"
}
```

---

## 🖱️ DATABASE SETUP

### PostgreSQL Schema

```bash
# Create main tables
sudo -u postgres psql club_ring_dev < backend/schema.sql

# Or using migrations
npm run migration:run
```

### Essential Tables (v1)

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  rating INT DEFAULT 1000,
  level INT DEFAULT 1,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  ring_balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Boxers table
CREATE TABLE boxers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name VARCHAR(100),
  health INT DEFAULT 100,
  stamina INT DEFAULT 100,
  power INT DEFAULT 50,
  speed INT DEFAULT 50,
  defense INT DEFAULT 50,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Battles table
CREATE TABLE battles (
  id SERIAL PRIMARY KEY,
  player1_id INT REFERENCES users(id),
  player2_id INT REFERENCES users(id),
  winner_id INT REFERENCES users(id),
  battle_data JSONB NOT NULL,
  duration INT,  -- seconds
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Keys Pattern

```
# User caches
user:{id}:cache -> User data
user:{id}:stats -> Win/loss stats
user:{id}:wallet -> RING balance

# Battle state
battle:{id}:state -> Current battle
battle:{id}:log -> Combat events

# Leaderboard
leaderboard:global -> Top 100 players
leaderboard:weekly -> Week rankings

# Queues
queue:matchmaking -> Players waiting
queue:tasks -> Background jobs
```

---

## 🚀 DEVELOPMENT WORKFLOW

### 1. Start Development Environment

```bash
# Terminal 1: Database
docker-compose up -d postgres redis

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend
cd frontend && npm run dev

# Terminal 4: Logs
docker-compose logs -f postgres redis
```

### 2. Git Workflow

```bash
# Create feature branch
git checkout -b feature/combat-system

# Commit with semantic commits
git commit -m "feat(combat): implement basic strike system"

# Push and create PR
git push origin feature/combat-system

# Pull request checklist:
# - [ ] Tests pass
# - [ ] Code reviewed
# - [ ] Documentation updated
# - [ ] No console errors
```

### 3. Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test

# E2E tests
npm run test:e2e
```

---

## 🚀 DEPLOYMENT

### Production Build

```bash
# Build frontend
cd frontend
npm run build
# Output: dist/ folder

# Build backend
cd backend
npm run build
# Output: dist/ folder
```

### Docker Deployment

```bash
# Build Docker images
docker build -t club-ring-frontend ./frontend
docker build -t club-ring-backend ./backend

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### AWS ECS Deployment

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag club-ring-backend:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/club-ring-backend:latest

docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/club-ring-backend:latest

# Update ECS service
aws ecs update-service --cluster club-ring --service backend \
  --force-new-deployment
```

---

## 📄 DOCUMENTATION LINKS

- [API Documentation](./docs/API.md)
- [Combat System Spec](./COMBAT_SYSTEM_SPEC.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

**Next Steps**: Follow the [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for week-by-week tasks.
