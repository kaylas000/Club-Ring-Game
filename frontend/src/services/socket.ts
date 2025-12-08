import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.VITE_WS_URL || 'ws://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(WS_URL, {
          namespace: '/combat',
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to WebSocket');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Combat events
  joinMatch(playerId: string): void {
    this.emit('player:join', { playerId });
  }

  findMatch(playerId: string, characterId: string): void {
    this.emit('match:find', { playerId, characterId });
  }

  sendAction(matchId: string, action: any): void {
    this.emit('match:action', { matchId, ...action });
  }

  cancelMatch(playerId: string): void {
    this.emit('match:cancel', { playerId });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
