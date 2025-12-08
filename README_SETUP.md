# Club Ring Game - Quick Start Guide

## 🥊 Что это?

Club Ring - мобильная боксерская игра для Telegram с полнофункциональной боевой системой, рейтингом и мультиплеерными матчами.

## ⚡ Быстрый старт (5 минут)

### Вариант 1: Docker (Рекомендуется)

```bash
# Клонируйте репозиторий
git clone https://github.com/kaylas000/Club-Ring-Game.git
cd Club-Ring-Game

# Запустите Docker Compose
docker-compose up -d

# Ждите инициализации (30-60 секунд)
```

**Приложение доступно на:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- WebSocket: ws://localhost:4000

### Вариант 2: Локальная установка

#### Требования:
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

#### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🎮 Как играть

1. Откройте приложение в Telegram
2. Авторизируйтесь через Telegram WebApp
3. Выберите сложность боя
4. Дождитесь соперника
5. Боритесь!
   - Q: Джаб (Jab)
   - W: Кросс (Cross)
   - E: Хук (Hook)
   - R: Аппенкат (Uppercut)
   - A: Удар в тело (Body shot)
   - S: Удар в горло (Throat punch)
   - SPACE: Блок (Block)
   - SHIFT: Уклон (Dodge)
   - D: Парирование (Parry)
6. Выигрывайте RING токены!

## 📊 Статус MVP

✅ **Завершено:**
- Боевая система (JAB, CROSS, HOOK, UPPERCUT, BODY_SHOT, THROAT_PUNCH)
- Система защиты (BLOCK, DODGE, PARRY, RETREAT, CLINCH)
- Комбо система
- Phaser game engine с анимациями
- React UI (Menu, HUD, Leaderboard, Shop)
- Backend API (Players, Matches)
- WebSocket реального времени
- Telegram WebApp интеграция
- Docker & CI/CD

## 📦 Architecture

```
Club Ring Game
├── Frontend (React + Phaser 3)
│   ├── Game Engine (Phaser 3)
│   ├── Combat System
│   ├── React UI Components
│   └── Socket.io Integration
├── Backend (NestJS + PostgreSQL)
│   ├── Players Module
│   ├── Matches Module
│   ├── Combat Module
│   ├── Auth Module
│   └── Database (PostgreSQL + Redis)
└── DevOps
    ├── Docker Compose
    ├── CI/CD (GitHub Actions)
    └── Nginx (Reverse Proxy)
```

## 🚀 Развертывание

### AWS Deployment

```bash
# 1. Создайте AWS ECS кластер
# 2. Создайте RDS PostgreSQL базу
# 3. Создайте ElastiCache Redis
# 4. Обновите .env переменные
# 5. Запустите CI/CD pipeline
```

## 🤝 Контрибьютинг

См. [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 Лицензия

MIT License
