import { io, Socket } from 'socket.io-client';
import type {
  SocketEvent,
  SocketMessage,
  MatchFoundPayload,
  MatchActionPayload,
  ApiResponse,
} from '@/types';

class SocketServiceClass {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

        this.socket = io(wsUrl, {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts,
          transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.warn('⚠️ WebSocket disconnected');
          this.isConnected = false;
        });

        this.socket.on('error', (error: any) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        });

        this.socket.on('connect_error', (error: any) => {
          this.reconnectAttempts++;
          console.error(`Connection error (attempt ${this.reconnectAttempts}):`, error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('WebSocket disconnected');
    }
  }

  emit<T>(event: SocketEvent, data: T): void {
    if (!this.socket || !this.isConnected) {
      console.warn(`Socket not connected, cannot emit ${event}`);
      return;
    }

    this.socket.emit(event, {
      event,
      data,
      timestamp: Date.now(),
    } as SocketMessage<T>);
  }

  on<T>(event: SocketEvent, callback: (data: T) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on(event, (message: SocketMessage<T>) => {
      callback(message.data);
    });
  }

  off(event: SocketEvent): void {
    if (!this.socket) return;
    this.socket.off(event);
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const SocketService = new SocketServiceClass();
