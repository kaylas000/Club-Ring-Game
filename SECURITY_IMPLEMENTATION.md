# 🔒 Security Implementation Guide

**Status**: Implementation Phase  
**Last Updated**: December 9, 2025  
**Target Coverage**: 85%+ by launch

---

## 📋 Security Checklist

### API Security

- [ ] **Rate Limiting**
  - [ ] 100 requests/minute for general endpoints
  - [ ] 10 requests/minute for auth endpoints
  - [ ] 1000 requests/minute for battle endpoints (time-sensitive)
  - [ ] Implementation: NestJS Throttler Guard

- [ ] **Input Validation**
  - [ ] All DTOs with class-validator
  - [ ] Whitelist validation (only allowed fields)
  - [ ] Type checking (no unexpected types)
  - [ ] Length limits (no huge payloads)
  - [ ] Implementation: Validation Pipe

- [ ] **SQL Injection Prevention**
  - [ ] Use ORM (TypeORM with prepared statements)
  - [ ] Never concatenate SQL strings
  - [ ] Parameterized queries only
  - [ ] Audit: Run sqlmap tests

- [ ] **HTTPS Enforcement**
  - [ ] All traffic https://
  - [ ] Redirect http → https
  - [ ] HSTS header enabled (1 year)
  - [ ] TLS 1.2+ only
  - [ ] Strong cipher suites

### Backend Security

- [ ] **Authentication**
  - [ ] JWT tokens (exp: 15 min)
  - [ ] Refresh tokens (exp: 7 days)
  - [ ] Secure token storage (httpOnly cookies)
  - [ ] Token validation on every request

- [ ] **Authorization**
  - [ ] Role-based access control (RBAC)
  - [ ] Only own data accessible
  - [ ] Admin endpoints protected
  - [ ] Audit logging for sensitive operations

- [ ] **Environment Variables**
  - [ ] .env.example committed (no secrets)
  - [ ] All secrets in .env (git-ignored)
  - [ ] No hardcoded passwords/keys
  - [ ] Audit: grep for secrets

- [ ] **Error Handling**
  - [ ] No stack traces to clients
  - [ ] Generic error messages
  - [ ] Proper HTTP status codes
  - [ ] Logging for debugging

- [ ] **CORS**
  - [ ] Whitelist allowed origins
  - [ ] No '*' in production
  - [ ] Specific methods allowed
  - [ ] Credentials properly configured

### Frontend Security

- [ ] **XSS Prevention**
  - [ ] React auto-escapes by default
  - [ ] DOMPurify for user content
  - [ ] No dangerouslySetInnerHTML
  - [ ] Content Security Policy header

- [ ] **CSRF Protection**
  - [ ] SameSite cookies
  - [ ] CSRF tokens for state-changing requests
  - [ ] Origin validation

- [ ] **Local Storage Security**
  - [ ] No sensitive data in localStorage
  - [ ] Tokens in httpOnly cookies only
  - [ ] Encrypted cache

### Blockchain Security

- [ ] **Smart Contract Audit**
  - [ ] Certik audit (Stage 1: February)
  - [ ] Trail of Bits audit (Stage 2: February)
  - [ ] Internal security review
  - [ ] Fix all findings

- [ ] **Private Keys**
  - [ ] Never in code
  - [ ] In .env only
  - [ ] Rotated regularly
  - [ ] Multi-sig for admin keys

- [ ] **TON Testnet Only Until Audit**
  - [ ] No mainnet until audited
  - [ ] Public beta on testnet
  - [ ] Community testing period
  - [ ] Post-audit deployment

### Anti-Cheat Measures

- [ ] **Server-Side Validation**
  - [ ] All battle logic server-side
  - [ ] Client sends action, server calculates damage
  - [ ] No trusting client damage values
  - [ ] Validate strike timing

- [ ] **Impossible Action Detection**
  - [ ] Cannot attack without stamina
  - [ ] Cannot exceed max stats
  - [ ] Cannot KO with 0 damage
  - [ ] Cannot beat yourself instantly

- [ ] **Rate Limiting by Player**
  - [ ] Max battles per hour (100)
  - [ ] Max quest completions per day (20)
  - [ ] Max rewards per day (5000 RING cap)
  - [ ] Progressive cooldowns

- [ ] **Statistical Anomaly Detection**
  - [ ] 100% win rate after 1000 battles → flag
  - [ ] Average 500 damage per strike → flag
  - [ ] Same opponent always loses → flag
  - [ ] Manual review system

- [ ] **Action Logging**
  - [ ] Every battle logged with timestamps
  - [ ] Damage values logged
  - [ ] Winner recorded
  - [ ] Audit trail for disputes

---

## 🛡️ Implementation Examples

### Rate Limiting (NestJS)

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests
      },
    ]),
  ],
})
export class AppModule {}

// battle.controller.ts
import { Throttle } from '@nestjs/throttler';

@Controller('battles')
export class BattleController {
  @Throttle({ default: { limit: 1000, ttl: 60000 } }) // 1000/min for battles
  @Post('start')
  async startBattle()
}
```

### Input Validation (DTOs)

```typescript
// start-battle.dto.ts
import { IsString, IsNumber, Min, Max, Length } from 'class-validator';

export class StartBattleDto {
  @IsString()
  @Length(1, 50)
  opponentId: string;

  @IsNumber()
  @Min(1)
  @Max(3)
  difficulty: 1 | 2 | 3; // EASY, MEDIUM, HARD
}

// With validation pipe in main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, // strip unknown properties
  forbidNonWhitelisted: true, // error on unknown properties
  transform: true, // type conversion
}));
```

### Anti-Cheat: Server-Side Damage

```typescript
// battle.service.ts
async executeAction(battleId: string, action: BattleAction) {
  const battle = await this.getBattle(battleId);
  
  // Validate action is possible
  if (battle.currentPlayer.stamina < action.staminaCost) {
    throw new BadRequestException('Not enough stamina');
  }

  // Server calculates damage (never trust client)
  const damage = this.combatService.calculateDamage(
    battle.currentPlayer,
    battle.opponent,
    action.strikeType,
  );

  // Apply damage (not action.damage from client)
  battle.opponent.health -= damage;
  battle.opponent.stamina -= action.staminaCost;

  // Save to database (audit trail)
  await this.battleRepository.save({
    ...battle,
    actions: [...battle.actions, action],
    timestamp: new Date(),
  });
}
```

---

## 🔍 Security Testing

### Automated Tests

```bash
# SQL Injection
sqlmap -u "http://localhost:3000/api/users?id=1" -p id

# XSS
npm run test:xss

# OWASP Top 10
npm run test:security

# Rate limiting
wrk -t12 -c400 -d30s http://localhost:3000/api/battles
```

### Manual Tests

1. **Try to access other player's data**
   - Should get 403 Forbidden

2. **Try impossible battle stats**
   - Damage = 9999
   - Should be rejected/corrected server-side

3. **Flood with requests**
   - Should hit rate limit after 100 requests

4. **SQL Injection in search**
   - Name: `' OR '1'='1`
   - Should be escaped properly

---

## 📊 Security Audit Timeline

| Phase | Date | Task | Status |
|-------|------|------|--------|
| **Phase 1** | Dec 9-15 | Internal review | 🟡 In Progress |
| **Phase 2** | Dec 16-Jan 10 | Implementation | ⏳ Planned |
| **Phase 3** | Jan 11-Feb 1 | External audit (Certik) | ⏳ Planned |
| **Phase 4** | Feb 2-28 | External audit (Trail of Bits) | ⏳ Planned |
| **Phase 5** | Mar 1-10 | Fix all findings | ⏳ Planned |
| **Phase 6** | Mar 11+ | Public beta (testnet only) | ⏳ Planned |

---

## 📞 Security Contacts

- **Security Issues**: security@clubringgame.io
- **Bug Bounty**: https://www.hackerone.com/clubringgame (Coming Q1 2026)
- **Incident Response**: [On-call team details]

---

## ✅ Pre-Launch Security Checklist

Must be 100% complete before launch:

- [ ] All tests passing
- [ ] Rate limiting deployed
- [ ] Input validation on all endpoints
- [ ] HTTPS everywhere
- [ ] No secrets in git
- [ ] Admin endpoints protected
- [ ] Error messages sanitized
- [ ] Audit logging enabled
- [ ] Anti-cheat logic deployed
- [ ] Smart contracts audited
- [ ] TON testnet only
- [ ] CORS configured
- [ ] Backups working
- [ ] Monitoring active
- [ ] Incident response plan documented

---

**Next Update**: December 16, 2025  
**Review Frequency**: Weekly  
**Approval**: Lead Security Engineer
