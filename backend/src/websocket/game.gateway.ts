import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../game/game.service';

@WebSocketGateway({
  namespace: '/game',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private activeUsers = new Map<string, Socket>();
  private matchmakingQueue: string[] = [];

  constructor(private gameService: GameService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId || client.id;
    this.activeUsers.set(userId, client);
    
    console.log(`✍️ User connected: ${userId}`);
    
    client.emit('connected', {
      message: 'Connected to game server',
      userId,
    });
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId || client.id;
    this.activeUsers.delete(userId);
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);
    
    console.log(`🚪sUser disconnected: ${userId}`);
  }

  @SubscribeMessage('combat:action')
  async handleCombatAction(
    client: Socket,
    data: { combatId: string; actionType: string },
  ) {
    try {
      const playerId = client.handshake.auth.userId || client.id;
      const result = await this.gameService.executeAction(
        data.combatId,
        playerId,
        { actionType: data.actionType },
      );

      if (result.winner) {
        this.server
          .to(data.combatId)
          .emit(`combat:${data.combatId}:end`, result);
      } else {
        this.server
          .to(data.combatId)
          .emit(`combat:${data.combatId}:update`, result);
      }
    } catch (error) {
      client.emit('error', { message: 'Action failed' });
    }
  }

  @SubscribeMessage('matchmaking:join')
  async handleMatchmakingJoin(client: Socket) {
    const playerId = client.handshake.auth.userId || client.id;
    
    if (this.matchmakingQueue.includes(playerId)) {
      return;
    }

    this.matchmakingQueue.push(playerId);
    client.emit('matchmaking:waiting', {
      position: this.matchmakingQueue.length,
    });

    if (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.shift();
      const player2 = this.matchmakingQueue.shift();

      const combatId = await this.startMatch(player1, player2);

      const player1Socket = this.activeUsers.get(player1);
      const player2Socket = this.activeUsers.get(player2);

      if (player1Socket) {
        player1Socket.emit('match:found', { combatId, opponent: player2 });
      }
      if (player2Socket) {
        player2Socket.emit('match:found', { combatId, opponent: player1 });
      }
    }
  }

  @SubscribeMessage('matchmaking:leave')
  handleMatchmakingLeave(client: Socket) {
    const playerId = client.handshake.auth.userId || client.id;
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== playerId);
    client.emit('matchmaking:left');
  }

  private async startMatch(player1Id: string, player2Id: string): Promise<string> {
    const combat = await this.gameService.startCombat(player1Id, player2Id);
    return combat.combatId;
  }

  notifyAchievement(playerId: string, achievement: any) {
    const client = this.activeUsers.get(playerId);
    if (client) {
      client.emit('achievement:earned', achievement);
    }
  }

  updateLeaderboard(leaderboard: any[]) {
    this.server.emit('leaderboard:updated', leaderboard);
  }
}
