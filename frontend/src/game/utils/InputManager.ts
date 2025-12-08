import Phaser from 'phaser';
import { PunchType, DefenseType } from '@types/combat';

export interface InputCommand {
  type: 'ATTACK' | 'DEFEND' | 'MOVE';
  action: PunchType | DefenseType | 'FORWARD' | 'BACKWARD' | null;
  timestamp: number;
}

export class InputManager {
  private scene: Phaser.Scene;
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  private touchControls: Map<string, Phaser.GameObjects.Rectangle>;
  private lastCommand: InputCommand | null = null;
  private commandQueue: InputCommand[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.keys = new Map();
    this.touchControls = new Map();
    this.setupKeyboard();
    this.setupTouchControls();
  }
  
  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) return;
    
    // Attack keys
    this.keys.set('JAB', this.scene.input.keyboard.addKey('Q'));
    this.keys.set('CROSS', this.scene.input.keyboard.addKey('W'));
    this.keys.set('HOOK', this.scene.input.keyboard.addKey('E'));
    this.keys.set('UPPERCUT', this.scene.input.keyboard.addKey('R'));
    this.keys.set('BODY_SHOT', this.scene.input.keyboard.addKey('A'));
    this.keys.set('THROAT_PUNCH', this.scene.input.keyboard.addKey('S'));
    
    // Defense keys
    this.keys.set('BLOCK', this.scene.input.keyboard.addKey('SPACE'));
    this.keys.set('DODGE', this.scene.input.keyboard.addKey('SHIFT'));
    this.keys.set('PARRY', this.scene.input.keyboard.addKey('D'));
    
    // Movement keys
    this.keys.set('FORWARD', this.scene.input.keyboard.addKey('UP'));
    this.keys.set('BACKWARD', this.scene.input.keyboard.addKey('DOWN'));
  }
  
  private setupTouchControls(): void {
    // Touch controls will be implemented with UI buttons
    // This is a placeholder for mobile support
  }
  
  update(): InputCommand | null {
    // Check keyboard input
    for (const [action, key] of this.keys.entries()) {
      if (Phaser.Input.Keyboard.JustDown(key)) {
        return this.createCommand(action);
      }
    }
    
    return null;
  }
  
  private createCommand(action: string): InputCommand {
    const punchTypes: PunchType[] = ['JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'BODY_SHOT', 'THROAT_PUNCH'];
    const defenseTypes: DefenseType[] = ['BLOCK', 'DODGE', 'PARRY', 'RETREAT', 'CLINCH'];
    
    if (punchTypes.includes(action as PunchType)) {
      return {
        type: 'ATTACK',
        action: action as PunchType,
        timestamp: Date.now(),
      };
    }
    
    if (defenseTypes.includes(action as DefenseType)) {
      return {
        type: 'DEFEND',
        action: action as DefenseType,
        timestamp: Date.now(),
      };
    }
    
    if (action === 'FORWARD' || action === 'BACKWARD') {
      return {
        type: 'MOVE',
        action: action,
        timestamp: Date.now(),
      };
    }
    
    return {
      type: 'ATTACK',
      action: null,
      timestamp: Date.now(),
    };
  }
  
  getLastCommand(): InputCommand | null {
    return this.lastCommand;
  }
  
  clearCommandQueue(): void {
    this.commandQueue = [];
  }
  
  destroy(): void {
    this.keys.clear();
    this.touchControls.clear();
  }
}
