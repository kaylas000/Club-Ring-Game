import { useEffect, useState, useCallback } from 'react';
import { useCombatStore } from '@store/combatStore';
import { socketService } from '@services/socket';
import { CombatAction } from '@types/combat';

export const useCombat = () => {
  const { combatState, setCombatState, updateCombatState, addMatchResult } = useCombatStore();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setup socket listeners
    socketService.on('match:found', (data) => {
      console.log('✅ Match found:', data);
      setCombatState(data);
    });

    socketService.on('match:action_result', (result) => {
      updateCombatState({
        player: result.playerState,
        opponent: result.opponentState,
      });
    });

    socketService.on('match:round_end', (roundData) => {
      console.log('🔔 Round ended:', roundData);
      updateCombatState({
        round: combatState?.round ? combatState.round + 1 : 2,
      });
    });

    socketService.on('match:end', (matchData) => {
      console.log('🏁 Match ended:', matchData);
      addMatchResult(matchData);
    });

    return () => {
      socketService.off('match:found', () => {});
      socketService.off('match:action_result', () => {});
      socketService.off('match:round_end', () => {});
      socketService.off('match:end', () => {});
    };
  }, [combatState, setCombatState, updateCombatState, addMatchResult]);

  const findMatch = useCallback(
    (playerId: string, characterId: string) => {
      try {
        socketService.findMatch(playerId, characterId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to find match';
        setError(message);
      }
    },
    []
  );

  const sendAction = useCallback(
    (matchId: string, action: CombatAction) => {
      try {
        socketService.sendAction(matchId, action);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send action';
        setError(message);
      }
    },
    []
  );

  const cancelMatch = useCallback(
    (playerId: string) => {
      try {
        socketService.cancelMatch(playerId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel match';
        setError(message);
      }
    },
    []
  );

  return {
    combatState,
    isConnected,
    error,
    findMatch,
    sendAction,
    cancelMatch,
  };
};
