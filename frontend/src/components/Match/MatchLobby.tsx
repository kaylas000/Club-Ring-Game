import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { SocketService } from '@/services/SocketService';
import { ApiService } from '@/services/ApiService';
import './MatchLobby.css';

interface MatchStartResponse {
  success: boolean;
  matchId: string;
  matchState?: any;
  error?: string;
}

export const MatchLobby: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer } = useGameStore();
  
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [wager, setWager] = useState(100);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStartMatch = useCallback(async () => {
    if (!currentPlayer) {
      setError('Please create a fighter first');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('🎮 Starting match creation...');
      console.log('Player ID:', currentPlayer.id);
      console.log('Difficulty:', difficulty);
      console.log('Wager:', wager);

      // Call backend API to start match
      const response = await ApiService.post<MatchStartResponse>('/matches/start', {
        player1Id: currentPlayer.id,
        player2Id: generateOpponentId(), // Simulate opponent
        difficulty,
        betAmount: wager,
      });

      if (!response.success || !response.matchId) {
        throw new Error(response.error || 'Failed to create match');
      }

      console.log('✅ Match created successfully');
      console.log('Match ID:', response.matchId);
      setSuccessMessage('Match found! Loading battle...');

      // Wait briefly for smooth UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to battle with match data
      navigate(`/battle/${response.matchId}`, {
        state: {
          matchId: response.matchId,
          playerId: currentPlayer.id,
          difficulty,
          wager,
          mode: 'online',
        },
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Match creation failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  }, [currentPlayer, difficulty, wager, navigate]);

  const handleTestOfflineMatch = () => {
    console.log('🧪 Starting offline test match...');
    navigate('/battle/test-offline', {
      state: {
        matchId: `test_${Date.now()}`,
        playerId: currentPlayer?.id || 'test-player',
        difficulty,
        mode: 'offline',
      },
    });
  };

  if (!currentPlayer) {
    return (
      <div className="match-lobby-container">
        <div className="lobby-content">
          <h1 className="lobby-title">⚙️ MATCH SETUP</h1>
          <div className="error-message">
            <p>You need to create a fighter first!</p>
            <button 
              onClick={() => navigate('/fighters/create')}
              className="btn btn-primary"
            >
              Create Fighter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-lobby-container">
      <div className="lobby-content">
        <h1 className="lobby-title">⚙️ MATCH SETUP</h1>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <span>❌ {error}</span>
            <button 
              onClick={() => setError(null)}
              className="close-btn"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="success-banner">
            <span>✅ {successMessage}</span>
          </div>
        )}

        <div className="lobby-card">
          {/* Player Info */}
          <div className="player-info-section">
            <h2>🥊 Fighter Information</h2>
            <div className="player-info-grid">
              <div className="info-item">
                <span className="label">Fighter Name</span>
                <span className="value">{currentPlayer.username || 'Fighter #' + currentPlayer.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Level</span>
                <span className="value">{currentPlayer.level || 1}</span>
              </div>
              <div className="info-item">
                <span className="label">Wins</span>
                <span className="value">{currentPlayer.wins || 0}</span>
              </div>
              <div className="info-item">
                <span className="label">Available Tokens</span>
                <span className="value">{currentPlayer.tokens || 0}</span>
              </div>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="setting-section">
            <label className="setting-label">Difficulty:</label>
            <div className="difficulty-grid">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                  disabled={isSearching}
                >
                  <span className="level-name">{level}</span>
                  <span className="level-desc">
                    {level === 'EASY' && '⭐'}
                    {level === 'MEDIUM' && '⭐⭐'}
                    {level === 'HARD' && '⭐⭐⭐'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Wager */}
          <div className="setting-section">
            <label className="setting-label">Wager (RING Tokens):</label>
            <div className="wager-container">
              <input
                type="range"
                min="10"
                max={Math.min(1000, currentPlayer.tokens || 100)}
                step="10"
                value={wager}
                onChange={(e) => setWager(parseInt(e.target.value))}
                disabled={isSearching}
                className="wager-slider"
              />
              <div className="wager-display">
                <div className="wager-value">{wager}</div>
                <div className="wager-label">tokens</div>
              </div>
            </div>
          </div>

          {/* Reward Preview */}
          <div className="reward-preview">
            <h3>💰 Potential Rewards</h3>
            <div className="reward-row">
              <span>Win Reward:</span>
              <span className="reward-win">+{Math.floor(wager * 2)}</span>
            </div>
            <div className="reward-row">
              <span>Draw Reward:</span>
              <span className="reward-draw">+{Math.floor(wager)}</span>
            </div>
            <div className="reward-row loss">
              <span>Loss Penalty:</span>
              <span className="reward-loss">-{wager}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button
              onClick={handleStartMatch}
              disabled={isSearching || wager > (currentPlayer.tokens || 0)}
              className={`btn btn-primary btn-large ${isSearching ? 'loading' : ''}`}
            >
              {isSearching ? (
                <>
                  <span className="spinner"></span>
                  SEARCHING FOR OPPONENT...
                </>
              ) : (
                '🎮 FIND MATCH'
              )}
            </button>

            <button
              onClick={handleTestOfflineMatch}
              disabled={isSearching}
              className="btn btn-secondary btn-large"
              title="Play offline for testing"
            >
              🧪 TEST OFFLINE
            </button>

            <button
              onClick={() => navigate('/menu')}
              disabled={isSearching}
              className="btn btn-tertiary"
            >
              ← BACK TO MENU
            </button>
          </div>
        </div>

        {/* Warnings */}
        {wager > (currentPlayer.tokens || 0) && (
          <div className="warning-message">
            ⚠️ Insufficient tokens. You need {wager - (currentPlayer.tokens || 0)} more tokens.
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to generate opponent ID (for testing)
function generateOpponentId(): string {
  // In production, this would come from matchmaking system
  const opponents = ['bot_1', 'bot_2', 'bot_3', 'bot_4', 'bot_5'];
  return opponents[Math.floor(Math.random() * opponents.length)];
}

export default MatchLobby;
