import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'Club Ring Backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }

  getVersion() {
    return {
      version: '0.1.0',
      phase: 'MVP Development',
      features: [
        'Health Check',
        'WebSocket Support',
        'PostgreSQL Database',
        'Redis Cache',
        'JWT Authentication (coming soon)',
        'Combat System (coming soon)',
      ],
    };
  }
}
