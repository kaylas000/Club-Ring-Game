# ⚡ Performance Optimization Guide

**Target Metrics**:
- Frontend load: < 3 seconds
- Battle FPS: 60 FPS (desktop) / 45 FPS (mobile)
- API latency: < 100ms (p95)
- Bundle size: < 300KB gzipped
- Lighthouse score: > 80

---

## 🚀 Frontend Optimization

### 1. Bundle Size Optimization

**Current Issues to Fix**:
- Phaser.js (8MB uncompressed) → tree-shake unused modules
- React dependencies → use code splitting
- Assets → lazy load during gameplay

**Implementation**:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: 'dist/stats.html' }), // analyze bundle
  ],
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'phaser': ['phaser'],
          'vendor': ['react', 'react-dom', 'axios'],
          'game': ['src/game/scenes'],
        },
      },
    },
  },
  server: {
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  },
});
```

**Targets**:
- [ ] Phaser: 2MB (from 8MB) via tree-shaking
- [ ] React vendor: 300KB (from 400KB)
- [ ] Game code: 200KB (optimized)
- **Total: < 300KB gzipped**

### 2. Image Optimization

```bash
# Install image optimization
npm install -D vite-plugin-compression

# Convert all PNGs to WebP
for f in src/**/*.png; do
  cwebp -q 80 "$f" -o "${f%.png}.webp"
done

# Compress remaining images
for f in src/**/*.jpg; do
  jpegoptim --max=80 "$f"
done
```

**Expected Savings**:
- PNG 500KB → WebP 80KB (84% reduction)
- JPG 200KB → optimized 60KB (70% reduction)

### 3. Code Splitting

```typescript
// Battle screen loaded only when needed
const BattleScreen = lazy(() => import('./screens/BattleScreen'));
const LeaderboardScreen = lazy(() => import('./screens/LeaderboardScreen'));

// Profile screen split by component
const PlayerStats = lazy(() => import('./components/PlayerStats'));
const AchievementsList = lazy(() => import('./components/AchievementsList'));
```

### 4. Lazy Loading

```typescript
// Intersection Observer for lazy loading
import { useEffect, useRef } from 'react';

const LazyImage = ({ src, alt }) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && imgRef.current) {
        imgRef.current.src = src;
        observer.unobserve(imgRef.current);
      }
    });

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} alt={alt} />;
};
```

### 5. Phaser Performance

```typescript
// config.ts
const config = {
  render: {
    type: Phaser.CANVAS, // use CANVAS for mobile instead of WEBGL
    canvas: canvas,
    antialias: true,
    roundPixels: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
    smoothStep: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      tileBias: 16,
    },
  },
};

// Disable unnecessary features
config.render.powerPreference = 'low-power'; // for mobile
```

---

## 📊 Backend Optimization

### 1. Database Query Optimization

```typescript
// battles.service.ts

// BEFORE: N+1 query problem
const battles = await this.battleRepository.find();
const withPlayers = battles.map(b => {
  b.player1 = this.playerRepository.findOne(b.player1Id); // N queries
  b.player2 = this.playerRepository.findOne(b.player2Id);
  return b;
});

// AFTER: Single optimized query
const battles = await this.battleRepository.find({
  relations: ['player1', 'player2'],
  select: {
    player1: { id: true, name: true, stats: true },
    player2: { id: true, name: true, stats: true },
  },
});
```

### 2. Caching Strategy

```typescript
// cache.interceptor.ts
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = `${context.switchToHttp().getRequest().url}` ;
    const cached = await this.cacheManager.get(key);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap((response) => {
        // Cache for 60 seconds
        this.cacheManager.set(key, response, 60000);
      }),
    );
  }
}

// Usage
@Get('/leaderboard')
@UseInterceptors(CacheInterceptor)
async getLeaderboard() {
  // Query happens only once every 60 seconds
}
```

### 3. WebSocket Performance

```typescript
// game.gateway.ts
@WebSocketGateway()
export class GameGateway {
  @SubscribeMessage('battle:action')
  async handleBattleAction(
    @MessageBody() data: BattleActionDto,
    @ConnectedSocket() client: Socket,
  ) {
    // Reduce payload size
    const minimized = {
      action: data.action,
      damage: this.combatService.calculateDamage(data),
      timestamp: Date.now(),
    };

    // Broadcast only deltas, not full game state
    this.server.emit('battle:update', minimized);
  }
}
```

### 4. Database Connection Pooling

```typescript
// database.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  poolSize: 20, // max connections
  poolErrorHandler: (err) => console.error(err),
  maxQueryExecutionTime: 1000, // log slow queries
});
```

---

## 📊 Performance Monitoring

### 1. Lighthouse CI

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3,
      "staticDistDir": "./dist"
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

### 2. Backend Performance Monitoring

```typescript
// performance.interceptor.ts
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const route = request.route?.path || request.url;

        if (duration > 100) {
          this.logger.warn(
            `Slow API: ${route} took ${duration}ms`,
          );
        }
      }),
    );
  }
}
```

### 3. Real User Monitoring

```typescript
// sentry.config.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when error occurs
});
```

---

## 🦠 Load Testing

### Using k6 (Recommended)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Stay at 100
    { duration: '2m', target: 200 },   // Ramp up more
    { duration: '5m', target: 200 },   // Stay at 200
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200'], // 95% < 200ms
    'http_req_failed': ['rate<0.1'],    // error rate < 10%
  },
};

export default function () {
  const url = 'http://localhost:3000/api/battles';
  const payload = JSON.stringify({ difficulty: 1 });

  const res = http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

### Running Load Test

```bash
# Local testing
k6 run load-test.js

# Cloud testing (Grafana Cloud)
k6 cloud load-test.js
```

---

## ✅ Performance Checklist

### Frontend
- [ ] Bundle size < 300KB gzipped
- [ ] Images optimized (WebP, compressed)
- [ ] Code splitting implemented
- [ ] Lazy loading working
- [ ] 60 FPS on desktop
- [ ] 45+ FPS on mobile
- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s

### Backend
- [ ] API p95 latency < 100ms
- [ ] Database queries optimized (< 10ms)
- [ ] Caching working
- [ ] Connection pooling enabled
- [ ] Can handle 1000 concurrent users
- [ ] Memory usage stable (no leaks)
- [ ] No N+1 queries

### Deployment
- [ ] CloudFront CDN enabled
- [ ] GZIP compression on
- [ ] HTTP/2 enabled
- [ ] Database backups working
- [ ] Monitoring alerts set up

---

**Last Updated**: December 9, 2025  
**Review**: Every 2 weeks
