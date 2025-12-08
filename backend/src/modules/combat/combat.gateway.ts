import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CombatService } from './combat.service';

interface MatchAction {
  matchId: string;
  playerId: string;
  actionType: 'ATTACK' | 'DEFEND';
  moveType: string;
  timestamp: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/combat',
})
export class CombatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('CombatGateway');
  private activePlayers = new Map<string, string>(); // socketId -> playerId

  constructor(private combatService: CombatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const playerId = this.activePlayers.get(client.id);
    if (playerId) {
      this.activePlayers.delete(client.id);
      this.logger.log(`Player ${playerId} disconnected`);
      
      // Notify match about disconnect
      this.server.emit('player:disconnected', { playerId });
    }
  }

  @SubscribeMessage('player:join')
  handlePlayerJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { playerId: string },
  ) {
    this.activePlayers.set(client.id, data.playerId);
    this.logger.log(`Player ${data.playerId} joined`);
    
    return { success: true, message: 'Player joined successfully' };
  }

  @SubscribeMessage('match:find')
  async handleFindMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { playerId: string; characterId: string },
  ) {
    this.logger.log(`Player ${data.playerId} searching for match...`);
    
    // Add to matchmaking queue
    const match = await this.combatService.findMatch(data.playerId, data.characterId);
    
    if (match) {
      // Match found - notify both players
      client.emit('match:found', match);
      this.server.to(match.opponentSocketId).emit('match:found', {
        ...match,
        playerId: match.opponentId,
        opponentId: data.playerId,
      });
      
      return { success: true, match };
    }
    
    return { success: true, message: 'Added to matchmaking queue' };
  }

  @SubscribeMessage('match:action')
  async handleMatchAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() action: MatchAction,
  ) {
    this.logger.debug(`Match action: ${action.actionType} - ${action.moveType}`);
    
    // Process action
    const result = await this.combatService.processAction(action);
    
    // Broadcast to both players in the match
    this.server.to(action.matchId).emit('match:action_result', result);
    
    // Check for round end or match end
    if (result.roundEnd) {
      this.server.to(action.matchId).emit('match:round_end', result.roundData);
    }
    
    if (result.matchEnd) {
      this.server.to(action.matchId).emit('match:end', result.matchData);
    }
    
    return { success: true };
  }

  @SubscribeMessage('match:cancel')
  handleCancelMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { playerId: string },
  ) {
    this.logger.log(`Player ${data.playerId} cancelled matchmaking`);
    this.combatService.removeFromQueue(data.playerId);
    return { success: true };
  }
}
