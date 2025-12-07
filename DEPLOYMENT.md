# Club Ring Game - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose 2.0+
- Git
- (Optional) Node.js 18+ for local development

### 1-Minute Setup

```bash
# Clone repository
git clone https://github.com/kaylas000/Club-Ring-Game.git
cd Club-Ring-Game

# Switch to production branch
git checkout production-setup

# Copy and configure environment
cp .env.example .env

# Edit .env with your settings (change JWT_SECRET, database password, etc.)
nano .env

# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# View logs
docker-compose logs -f
```

**Access points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

## 📋 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                    │
└──────────────────────┬──────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
     ┌─────▼─────┐          ┌──────▼──────┐
     │  Frontend │          │   Backend   │
     │ Next.js   │◄────────►│  NestJS     │
     │ :3000     │          │  :3001      │
     └─────┬─────┘          └──────┬──────┘
           │                       │
           └───────────┬───────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ┌────▼─────┐              ┌──────▼──────┐
   │ PostgreSQL│              │   Redis      │
   │  DB       │              │   Cache      │
   │  :5432    │              │   :6379      │
   └───────────┘              └──────────────┘
        │
   ┌────▼─────────────────────────────┐
   │  TON / Ethereum / Polygon / Solana│
   │  Blockchain Integration           │
   └───────────────────────────────────┘
```

## 🐳 Docker Compose Services

### PostgreSQL
- Image: `postgres:15-alpine`
- Port: 5432
- Database: `club_ring_game`
- User: `clubring`
- Volume: `postgres_data`
- Health: Automatic checks every 10s

### Redis
- Image: `redis:7-alpine`
- Port: 6379
- Volume: `redis_data`
- Purpose: Session cache, rate limiting, real-time updates

### Backend API
- Language: Node.js + NestJS
- Port: 3001
- Dependencies: PostgreSQL, Redis
- Features:
  - RESTful API
  - WebSocket support
  - TON blockchain integration
  - EVM chains support (Ethereum, Polygon)
  - Solana integration
  - JWT authentication

### Frontend App
- Framework: Next.js + React
- Port: 3000
- Dependencies: Backend API
- Features:
  - Phaser.js game engine
  - TON wallet integration
  - Real-time combat system
  - NFT marketplace
  - Leaderboards

## 🔧 Environment Configuration

### Critical Variables

```bash
# Change these in production!
JWT_SECRET=generate-a-strong-random-string-32chars+
DB_PASSWORD=create-strong-db-password
NODE_ENV=production

# Blockchain configuration
TON_NETWORK=mainnet  # or testnet
ETHEREUM_RPC=your-rpc-endpoint
POLYGON_RPC=your-rpc-endpoint

# API endpoints
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Database Setup

### Initial Migration

```bash
# Run migrations automatically on startup
docker-compose exec backend npm run migration:run

# Or manually
docker-compose up -d postgres
docker-compose exec backend npm run typeorm migration:run
```

### Connect to Database

```bash
# Using psql
psql -h localhost -U clubring -d club_ring_game

# Using DBeaver/TablePlus/pgAdmin
Host: localhost
Port: 5432
Username: clubring
Password: (from .env)
Database: club_ring_game
```

## 🚀 Production Deployment

### Option 1: AWS EC2 + RDS

```bash
# 1. Update .env with RDS endpoint
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432

# 2. Deploy with docker-compose
SSH_KEY=~/.ssh/aws-key.pem
ssh -i $SSH_KEY ec2-user@your-instance-ip
git clone ...
cd Club-Ring-Game
cp .env.example .env
# Edit .env
docker-compose up -d
```

### Option 2: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create club-ring-game

# Set environment variables
heroku config:set JWT_SECRET=your-secret -a club-ring-game
heroku config:set DB_HOST=your-db-host -a club-ring-game

# Deploy
git push heroku main
```

### Option 3: Railway.app

```bash
# Connect GitHub repository
# Railway automatically detects docker-compose.yml
# Configure environment variables in dashboard
# Deploy with git push
```

### Option 4: Self-Hosted (VPS)

```bash
# On your VPS (Ubuntu 22.04)
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repo and deploy
git clone https://github.com/kaylas000/Club-Ring-Game.git
cd Club-Ring-Game
cp .env.example .env
sudo docker-compose up -d

# Setup Nginx as reverse proxy
sudo apt install nginx
sudo systemctl enable nginx
# Configure /etc/nginx/sites-available/default
```

## 📈 Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail 100 backend

# Follow and filter
docker-compose logs -f backend | grep ERROR
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Backend health
curl http://localhost:3001/health

# Frontend health
curl http://localhost:3000

# Database health
docker-compose exec postgres pg_isready -U clubring

# Redis health
docker-compose exec redis redis-cli ping
```

### Performance Monitoring

```bash
# CPU and memory usage
docker stats

# Database query logs
docker-compose exec postgres tail -f /var/log/postgresql/postgresql.log
```

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall (ufw on Linux)
- [ ] Enable database backups
- [ ] Setup log aggregation
- [ ] Configure rate limiting
- [ ] Enable WAF (Web Application Firewall)
- [ ] Regular security updates
- [ ] Monitor failed login attempts
- [ ] Setup DDoS protection (Cloudflare)

## 📦 Backup & Recovery

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U clubring club_ring_game > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U clubring club_ring_game
```

### Redis Backup

```bash
# Redis persistence is enabled via volumes
# Backups stored in redis_data volume

# Manual backup
docker-compose exec redis redis-cli BGSAVE

# Check backup
docker-compose exec redis redis-cli LASTSAVE
```

## 🐛 Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs [service-name]

# Rebuild images
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database connection error

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check connection
docker-compose exec backend npm run typeorm migration:run

# Reset database (⚠️ DELETES DATA)
docker-compose down -v
docker-compose up -d
```

### Redis connection refused

```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a

# Remove old logs
docker-compose logs --tail 0
```

## 📚 Documentation Links

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Docker Compose](https://docs.docker.com/compose)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Redis Docs](https://redis.io/docs)
- [TON Docs](https://ton.org/docs)

## 🤝 Support

- Issues: https://github.com/kaylas000/Club-Ring-Game/issues
- Discussions: https://github.com/kaylas000/Club-Ring-Game/discussions
- Email: kaylas000@yandex.com

## 📄 License

MIT License - See LICENSE file
