# 🥊 CLUB RING COMBAT SYSTEM SPECIFICATION

**Version**: 2.0 Production Ready  
**Last Updated**: December 8, 2025  
**Status**: Development Phase

---

## 📚 TABLE OF CONTENTS

1. [Combat Mechanics](#combat-mechanics)
2. [Strike System](#strike-system)
3. [Combo System](#combo-system)
4. [Defense System](#defense-system)
5. [Stamina System](#stamina-system)
6. [Damage System](#damage-system)
7. [Round System](#round-system)
8. [Implementation Guide](#implementation-guide)

---

## 💭 COMBAT MECHANICS

### Core Principles

- **Realism**: Base mechanics on real boxing (Undisputed level)
- **Accessibility**: Casual + Pro players can enjoy
- **Depth**: 100+ hours of content possible
- **Balance**: No pay-to-win mechanics
- **Fairness**: Deterministic outcomes with proper RNG

### Game Flow

```
Match Start
  ⮑️
Round Start (180 seconds)
  ⮑️
Player Turn
  ⮑️
AI/Opponent Turn
  ⮑️
Update Scores
  ⮑️
Round End? → Victory Check → Match End
```

---

## 🚨 STRIKE SYSTEM

### 1. Straight Punches (Jabs)

```typescript
interface Straight {
  name: "Jab" | "Cross";
  hand: "left" | "right";
  power: 5 | 6;           // Damage modifier
  speed: 10;              // Animation speed (frames)
  defenseBreak: 0 | 1;    // Can break guard?
  staminaCost: 3 | 4;     // Stamina drain
  accuracy: 0.85;         // Hit chance
  stunChance: 0;          // Stun probability
}

// Stats
const Jab = {
  LEFT: { power: 5, speed: 10, cost: 3 },
  RIGHT: { power: 6, speed: 10, cost: 4 }
};
```

**Purpose**: Fast setup strikes, low damage, low risk  
**Best For**: Building combos, maintaining range  

---

### 2. Hook Strikes

```typescript
interface Hook {
  name: "Hook";
  hand: "left" | "right";
  power: 10 | 11;
  speed: 6;
  defenseBreak: 4;        // High defense break
  staminaCost: 6;
  accuracy: 0.75;
  stunChance: 0.05;       // 5% stun
  range: "medium";
}

const Hook = {
  LEFT: { power: 10, speed: 6, cost: 6 },
  RIGHT: { power: 11, speed: 6, cost: 6 }
};
```

**Purpose**: High damage, medium-range, risky  
**Best For**: Breaking guards, combo closers  

---

### 3. Uppercut Strikes

```typescript
interface Uppercut {
  name: "Uppercut";
  hand: "left" | "right";
  power: 13 | 15;         // Highest damage
  speed: 5;               // Slowest animation
  defenseBreak: 5 | 6;    // Very risky
  staminaCost: 8;
  accuracy: 0.60;         // Low accuracy
  stunChance: 0.15;       // 15% stun
  criticality: 0.25;      // 25% critical hit
}

const Uppercut = {
  LEFT: { power: 13, speed: 5, cost: 8, stun: 0.15 },
  RIGHT: { power: 15, speed: 5, cost: 8, stun: 0.20 }
};
```

**Purpose**: Maximum damage, high risk/reward  
**Best For**: Finishing moves, aggressive play  

---

### 4. Body Shots

```typescript
interface BodyShot {
  name: "Body Shot";
  hand: "left" | "right";
  power: 8 | 9;
  speed: 7;
  defenseBreak: 3;
  staminaCost: 7;
  stamainaDrain: 2;       // Drains opponent stamina +2
  accuracy: 0.80;
  targetZone: "body";
}

const BodyShot = {
  LEFT: { power: 8, speed: 7, cost: 7, drain: 2 },
  RIGHT: { power: 9, speed: 7, cost: 7, drain: 2 }
};
```

**Purpose**: Stamina control, mid-range damage  
**Best For**: Attrition strategy, stamina management  

---

### 5. Clinch Strikes

```typescript
interface ClinicStrike {
  name: "Throat Strike" | "Clinch Knee";
  power: 7;
  speed: 8;
  staminaCost: 2;
  stunChance: 0.15;       // Can stun
  range: "close";
  requiresClinic: true;
}
```

---

## 🖗️ COMBO SYSTEM

### Combo Chain Logic

```typescript
interface Combo {
  name: string;
  sequence: Strike[];
  powerMultiplier: number;  // 1.0x - 3.0x
  staminaCost: number;
  successChance: number;     // 0.0 - 1.0
  description: string;
}

// Example: Jab > Cross > Hook
const JCH = {
  name: "Triple Combo",
  sequence: ["jab-left", "cross-right", "hook-left"],
  multiplier: 1.5,           // Each hit gains power
  stamina: 13,               // Sum of strikes
  chance: 0.90,              // 90% success if blocks at each stage
  speed: 1.2                 // 20% faster animation
};
```

### Combo Tiers

```
✖️ SIMPLE COMBOS (2-3 strikes):
- Jab → Cross
- Jab → Hook
- Jab → Jab → Cross
- Cross → Uppercut
PowerMultiplier: 1.3x - 1.5x

❌ COMPLEX COMBOS (3-5 strikes):
- Jab → Cross → Hook → Uppercut
- Jab → Body → Cross → Uppercut
PowerMultiplier: 1.6x - 1.9x

🔥 EXTREME COMBOS (5+ strikes):
- Perfect Combination (5 strikes, precise timing)
- K.O. Sequence (6 strikes leading to knockout)
PowerMultiplier: 2.0x - 3.0x

Mechanics:
- Each strike breaks if opponent blocks
- Success = higher damage per hit
- Failure = wasted stamina
- Counter = opponent gets 50% damage back
```

### Combo Building Algorithm

```python
def calculate_combo_damage(strikes: List[Strike], accuracy: float) -> float:
    """
    Calculate total combo damage with multiplier
    """
    if len(strikes) == 0:
        return 0
    
    base_damage = sum(s.power for s in strikes)
    
    # Multiplier increases with combo length
    multiplier = 1.0 + (len(strikes) - 1) * 0.15  # 1.0x, 1.15x, 1.30x, etc.
    
    # Accuracy penalty (each miss = 0% damage)
    success_chance = accuracy ** len(strikes)  # Exponential difficulty
    
    total_damage = base_damage * multiplier * success_chance
    
    return total_damage
```

---

## 🛡️ DEFENSE SYSTEM

### 1. Guard (Passive Block)

```typescript
const Guard = {
  defense: 10,              // Damage reduction: 60-80%
  staminaCost: 3,           // Per round
  canBreak: true,           // Strongest strikes break guard
  breakThreshold: 12,       // Damage needed
  animation: "guard_idle"
};
```

### 2. Slip (Active Dodge)

```typescript
const Slip = {
  defense: 15,              // 100% damage avoidance if successful
  staminaCost: 5,           // Per attempt
  accuracy: 0.70,           // 70% success rate
  counterChance: 0.20,       // 20% immediate counter
  counterMultiplier: 1.20,   // +20% damage on counter
  animation: "slip_dodge"
};
```

### 3. Parry (Redirect)

```typescript
const Parry = {
  defense: 20,              // High defense value
  staminaCost: 8,           // Expensive
  accuracy: 0.50,           // Very hard (50%)
  counterChance: 1.0,        // Always counter if successful
  counterMultiplier: 1.25,   // +25% damage
  counterStun: 0.30,         // 30% chance to stun
  animation: "parry_redirect"
};
```

### 4. Backpedal (Retreat)

```typescript
const Backpedal = {
  defense: 8,               // Minor defense
  staminaCost: 2,           // Cheap
  rangeBonus: 2,            // Move back 2 units
  damageReduction: 0.4,      // 40% of long-range damage
  staminarecovery: 0.05,     // Small recovery
  animation: "backpedal"
};
```

### 5. Clinch (Close Combat)

```typescript
const Clinch = {
  defense: 10,              // Moderate defense
  staminaCost: 4,           // Per round
  staminaRecovery: 5,       // +5 per round
  slowEffect: 0.5,          // Both boxers 50% slower
  mustBreakAfter: 3,        // Ref breaks after 3 rounds
  damageBonus: -0.25,       // 25% less damage overall
  animation: "clinch_hold"
};
```

---

## ⚡ STAMINA SYSTEM

### Stamina Costs

```
Jab:          3 stamina
Cross:        5 stamina
Hook:         6 stamina
Uppercut:     8 stamina
Body Shot:    7 stamina

Guard:        3 stamina/round
Slip:         5 stamina/attempt
Parry:        8 stamina/attempt
Backpedal:    2 stamina/round
Clinic:       4 stamina/round
```

### Stamina Recovery

```
Per Round (rest):        +40 stamina
In Clinic:               +5 stamina/round (+ guard effect)
With low stamina:        -50% recovery speed

Max Stamina:             100 points
```

### Fatigue Effects

```
50-99% stamina:   Normal (0% penalty)
30-49% stamina:   -20% Power, -0% Speed
10-29% stamina:   -40% Power, -50% Speed
0-9% stamina:     -60% Power, -80% Speed, -50% Defense
0 stamina:        Boxer can collapse from light hit
```

---

## 🐥 DAMAGE SYSTEM

### Damage Calculation

```python
def calculate_damage(
    strike: Strike,
    attacker_stats: Stats,
    defender_defense: int,
    zone: str = "body"
) -> int:
    """
    Calculate final damage with all modifiers
    """
    
    # Base damage from strike
    base = strike.power
    
    # Attacker bonus (power stat)
    attacker_bonus = attacker_stats.power * 0.1
    
    # Defense reduction
    defense_reduction = defender_defense * 0.05
    
    # Critical hit chance
    critical = 1.0
    if random() < strike.criticality:
        critical = 1.5
    
    # Zone multiplier
    zone_multiplier = {
        "head": 1.5,
        "jaw": 1.2,
        "liver": 1.3,
        "body": 1.0,
        "legs": 0.8
    }[zone]
    
    # Final calculation
    final_damage = (base + attacker_bonus - defense_reduction) * zone_multiplier * critical
    
    return max(1, int(final_damage))  # Minimum 1 damage
```

### Critical Zones

```
Head:      1.5x damage, 30% stun chance
Jaw:       1.2x damage, 20% stun chance + vision blur
Liver:     1.3x damage, -15% stamina recovery
Body:      1.0x damage, stamina drain
Legs:      0.8x damage, -10% speed
```

### Damage Effects

```
Stun (1-2 rounds):
  - -50% defense
  - -30% speed
  - Disorientation effect

Bleeding (ongoing):
  - -2 HP per round
  - Lasts until round ends

Knockdown (HP < 10):
  - Boxer falls
  - 10-second count
  - Get up = -5 HP additional
  - No get up = TKO loss
```

---

## 📢 ROUND SYSTEM

### Round Structure

```
Round Duration:    180 seconds (3 minutes)
Between Rounds:    60 seconds (rest/recovery)
Max Rounds:        12 (professional)

Round Phases:
1. Start Phase (5s)
   - Boxers in neutral corners
   - Ready prompt
2. Action Phase (170s)
   - Player/AI turns
   - Continuous action
3. End Phase (5s)
   - Judges score
   - Announce round winner
```

### Scoring System

```
3 Judges Score Each Round:
- 10-9 (Close round)
- 10-8 (Clear advantage)
- 10-7 (Domination)

Final Score:
- Sum of all judges
- Majority wins
- Possible draw

Win Conditions:
1. KO: Opponent doesn't get up
2. TKO: Ref stops fight (medical)
3. Points: Best judges' cards
4. DQ: Rule violation
5. Submission: Tap out
```

---

## 💻 IMPLEMENTATION GUIDE

### TypeScript Interfaces

```typescript
interface Strike {
  id: string;
  name: string;
  hand: "left" | "right";
  type: "jab" | "hook" | "uppercut" | "body";
  power: number;
  speed: number;              // Frames
  defenseBreak: number;
  staminaCost: number;
  accuracy: number;           // 0.0 - 1.0
  stunChance: number;
  criticality: number;
  animation: string;          // Spine animation name
}

interface BoxerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  power: number;             // 1-100
  speed: number;             // 1-100
  defense: number;           // 1-100
  accuracy: number;          // 0.5-1.0
}

interface BattleState {
  roundNumber: number;
  roundTime: number;         // Seconds elapsed
  player1: BoxerState;
  player2: BoxerState;
  judges: [number, number, number];  // Scores
  combatLog: CombatEvent[];
}

interface CombatEvent {
  timestamp: number;
  attacker: string;
  action: Strike | Defense;
  result: "hit" | "miss" | "blocked" | "parried";
  damage: number;
}
```

### Phaser Scene Structure

```typescript
export class BattleScene extends Phaser.Scene {
  private player: Boxer;
  private opponent: Boxer;
  private combatSystem: CombatSystem;
  private hud: HUDLayer;
  
  create() {
    // Initialize battle
    this.combatSystem = new CombatSystem(this);
    this.player = new Boxer(this, 200, 300, 'player');
    this.opponent = new Boxer(this, 1080, 300, 'opponent');
    this.hud = new HUDLayer(this);
  }
  
  update(time: number, delta: number) {
    // Update combat state
    this.combatSystem.update(delta);
    this.hud.update(this.combatSystem.getState());
  }
  
  playerAction(strike: Strike) {
    // Handle player input
    this.combatSystem.executeStrike(this.player, strike);
  }
}
```

---

**Next**: Begin implementation with Week 3-4 Combat System Setup  
**Estimated Completion**: December 30, 2025
