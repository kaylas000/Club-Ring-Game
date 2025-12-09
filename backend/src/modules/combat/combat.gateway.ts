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
import { Logger, BadRequestException } from '@nestjs/common';
import { CombatService } from './combat.service';

type StrikeType = 'JAB' | 'CROSS' | 'HOOK' | 'UPPERCUT' | 'GUARD' | 'SLIP';

interface MatchActionData {
  matchId: string;
  playerId: string;
  strikeType: StrikeType;
  timestamp: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/combat',
  transports: ['websocket', 'polling'],
})
export class CombatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('CombatGateway');
  private activePlayers = new Map<string, string>(); // socketId -> playerId
  private playerMatches = new Map<string, string>(); // playerId -> matchId

  constructor(private combatService: CombatService) {}

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const playerId = this.activePlayers.get(client.id);
    if (playerId) {
      this.activePlayers.delete(client.id);
      const matchId = this.playerMatches.get(playerId);
      if (matchId) {
        this.server.to(matchId).emit('player:disconnected', { playerId });
        this.playerMatches.delete(playerId);
      }
      this.logger.log(`Player ${playerId} disconnected`);
    }
  }

  @SubscribeMessage('player:join')
  handlePlayerJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { playerId: string },
  ) {
    this.activePlayers.set(client.id, data.playerId);
    this.logger.log(`Player ${data.playerId} joined (socket: ${client.id})`);
    return { success: true, message: 'Player joined successfully' };
  }

  @SubscribeMessage('match:find')
  async handleFindMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { playerId: string; characterId: string },
  ) {
    this.logger.log(`Player ${data.playerId} searching for match...`);
    // TODO: Implement matchmaking queue logic with CombatService
    return { success: true, message: 'Added to matchmaking queue' };
  }

  @SubscribeMessage('match:start')
  async handleStartMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; player1Id: string; player2Id: string },
  ) {
    try {
      // Initialize match in CombatService
      const matchState = this.combatService.initializeMatch(
        data.matchId,
        data.player1Id,
        data.player2Id,
      );

      this.playerMatches.set(data.player1Id, data.matchId);
      this.playerMatches.set(data.player2Id, data.matchId);

      this.logger.log(`Match started: ${data.matchId}`);

      // Notify both players
      this.server.to(data.matchId).emit('match:started', {
        matchId: data.matchId,
        matchState,
      });

      return { success: true, matchState };
    } catch (error) {
      this.logger.error(`Error starting match: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('match:action')
  async handleMatchAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() action: MatchActionData,
  ) {
    try {
      // Get match state
      const matchState = this.combatService.getMatchState(action.matchId);

      // Anti-cheat: validate action is possible
      const validation = this.combatService.validateAction(
        matchState,
        action.playerId,
        action.strikeType,
      );

      if (!validation.valid) {
        this.logger.warn(
          `Invalid action from ${action.playerId}: ${validation.reason}`,
        );
        client.emit('match:action_rejected', {
          reason: validation.reason,
        });
        return { success: false, reason: validation.reason };
      }

      // Execute action
      const result = await this.combatService.executeAction(
        action.matchId,
        action.playerId,
        action.strikeType,
      );

      // Get updated match state
      const updatedState = this.combatService.getMatchState(action.matchId);

      // Broadcast to both players
      this.server.to(action.matchId).emit('match:action_result', {
        playerId: action.playerId,
        strikeType: action.strikeType,
        damage: result.damage,
        staminaDrained: result.staminaDrained,
        matchState: updatedState,
        timestamp: Date.now(),
      });

      // Check for round end
      if (this.combatService.isRoundOver(updatedState)) {
        this.combatService.completeRound(updatedState);

        if (updatedState.currentRound > updatedState.maxRounds) {
          // Match end
          const result = await this.combatService.finishMatch(action.matchId);
          this.server.to(action.matchId).emit('match:end', {
            winnerId: result.winnerId,
            player1Damage: result.player1Damage,
            player2Damage: result.player2Damage,
          });

          this.playerMatches.delete(matchState.player1Id);
          this.playerMatches.delete(matchState.player2Id);
        } else {
          // Round end
          this.server.to(action.matchId).emit('match:round_end', {
            round: updatedState.currentRound,
            player1Health: updatedState.player1Health,
            player2Health: updatedState.player2Health,
            player1Stamina: updatedState.player1Stamina,
            player2Stamina: updatedState.player2Stamina,
          });
        }
      }

      return { success: true, result };
    } catch (error) {
      this.logger.error(`Error processing action: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('match:cancel')
  handleCancelMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; playerId: string },
  ) {
    try {
      const matchId = this.playerMatches.get(data.playerId);
      if (matchId) {
        this.playerMatches.delete(data.playerId);
        this.server.to(matchId).emit('match:cancelled', { playerId: data.playerId });
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Error cancelling match: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('match:state')
  handleGetMatchState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    try {
      const matchState = this.combatService.getMatchState(data.matchId);
      return { success: true, matchState };
    } catch (error) {
      this.logger.error(`Error getting match state: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
