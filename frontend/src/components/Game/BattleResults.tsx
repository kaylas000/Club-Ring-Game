import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './BattleResults.css';

interface BattleResultsData {
  matchId: string;
  winner: string;
  loser: string;
  method: 'KO' | 'TKO' | 'DECISION' | 'DRAW';
  round: number;
  duration: number;
  player1Score: number;
  player2Score: number;
  player1Id: string;
  player2Id: string;
  rewards: {
    winnerId: string;
    winnerReward: number;
    loserReward: number;
  };
}

interface PlayerResult {
  id: string;
  username: string;
  health: number;
  damage: number;
  accuracy: number;
  isWinner: boolean;
}

interface BattleResultsProps {
  data?: BattleResultsData;
  playerId: string;
}

const BattleResults: React.FC<BattleResultsProps> = ({ data, playerId }) => {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const [results, setResults] = useState<BattleResultsData | null>(data || null);
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data && matchId) {
      fetchResults();
    }
  }, [matchId, data]);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/matches/${matchId}`);
      if (!response.ok) throw new Error('Failed to fetch results');
      const matchData = await response.json();
      setResults(matchData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="battle-results-container loading">
        <div className="spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="battle-results-container error">
        <h2>Error Loading Results</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Return to Menu
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="battle-results-container">
        <p>No match data available</p>
      </div>
    );
  }

  const isWinner = results.winner === playerId;
  const earnedReward = isWinner 
    ? results.rewards.winnerReward 
    : results.rewards.loserReward;

  return (
    <div className="battle-results-container">
      <div className="results-header">
        <h1 className={isWinner ? 'victory' : 'defeat'}>
          {isWinner ? '🎉 VICTORY!' : '💔 DEFEAT'}
        </h1>
        <p className="match-method">
          {results.method} - Round {results.round}
        </p>
      </div>

      <div className="results-content">
        {/* Victory/Defeat Banner */}
        <div className={`result-banner ${isWinner ? 'win' : 'loss'}`}>
          <div className="banner-icon">
            {isWinner ? '👑' : '⚔️'}
          </div>
          <div className="banner-text">
            <h2>{isWinner ? 'YOU WON!' : 'YOU LOST'}</h2>
            <p className="result-detail">
              {results.method} in Round {results.round}
            </p>
          </div>
        </div>

        {/* Match Statistics */}
        <div className="statistics-section">
          <h3>📊 Match Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card player-stat">
              <div className="stat-label">Your Damage</div>
              <div className="stat-value">{results.player1Score}</div>
            </div>
            <div className="stat-card opponent-stat">
              <div className="stat-label">Opponent Damage</div>
              <div className="stat-value">{results.player2Score}</div>
            </div>
            <div className="stat-card duration-stat">
              <div className="stat-label">Fight Duration</div>
              <div className="stat-value">{formatDuration(results.duration)}</div>
            </div>
            <div className="stat-card method-stat">
              <div className="stat-label">Finish Method</div>
              <div className="stat-value">{results.method}</div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="rewards-section">
          <h3>🏆 Rewards</h3>
          <div className="rewards-card">
            <div className="reward-item primary">
              <span className="reward-label">RING Tokens Earned</span>
              <span className="reward-amount">+{earnedReward}</span>
            </div>
            {isWinner && (
              <div className="reward-item bonus">
                <span className="reward-label">Victory Bonus (20%)</span>
                <span className="reward-amount">+{Math.floor(earnedReward * 0.2)}</span>
              </div>
            )}
            <div className="reward-item experience">
              <span className="reward-label">Experience</span>
              <span className="reward-amount">+{Math.floor(earnedReward * 0.5)}</span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="performance-section">
          <h3>⭐ Performance</h3>
          <div className="performance-metrics">
            <div className="metric">
              <label>Accuracy</label>
              <div className="meter">
                <div 
                  className="meter-fill accuracy" 
                  style={{ width: `${calculateAccuracy(results.player1Score)}%` }}
                ></div>
              </div>
              <span className="metric-value">{calculateAccuracy(results.player1Score)}%</span>
            </div>
            <div className="metric">
              <label>Damage Output</label>
              <div className="meter">
                <div 
                  className="meter-fill damage" 
                  style={{ width: `${calculateDamageRatio(results.player1Score)}%` }}
                ></div>
              </div>
              <span className="metric-value">{calculateDamageRatio(results.player1Score)}%</span>
            </div>
            {isWinner && (
              <div className="metric">
                <label>Dominance</label>
                <div className="meter">
                  <div 
                    className="meter-fill dominance" 
                    style={{ width: `${calculateDominance(results.player1Score, results.player2Score)}%` }}
                  ></div>
                </div>
                <span className="metric-value">{calculateDominance(results.player1Score, results.player2Score)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary"
        >
          🏠 Return to Menu
        </button>
        <button 
          onClick={() => navigate('/match/create')} 
          className="btn btn-secondary"
        >
          🔄 Play Again
        </button>
        <button 
          onClick={() => navigate(`/players/${playerId}/stats`)} 
          className="btn btn-tertiary"
        >
          📈 View Stats
        </button>
      </div>

      {/* Share Result */}
      <div className="share-section">
        <button 
          onClick={() => shareResult(results, isWinner)} 
          className="btn-share"
        >
          📤 Share Result
        </button>
      </div>
    </div>
  );
};

// Helper Functions
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function calculateAccuracy(damage: number): number {
  // Simplified: accuracy based on damage efficiency
  return Math.min(100, Math.floor((damage / 100) * 100));
}

function calculateDamageRatio(playerDamage: number): number {
  // Simplified: normalize to 0-100
  return Math.min(100, Math.floor((playerDamage / 200) * 100));
}

function calculateDominance(playerDamage: number, opponentDamage: number): number {
  if (playerDamage === 0) return 0;
  const ratio = playerDamage / (playerDamage + opponentDamage);
  return Math.floor(ratio * 100);
}

function shareResult(results: BattleResultsData, isWinner: boolean): void {
  const text = `I ${isWinner ? 'won' : 'lost'} a ${results.method} fight in Round ${results.round}! Check out Club Ring Game! 🥊`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Club Ring Game - Match Result',
      text: text,
      url: window.location.href,
    }).catch(err => console.log('Error sharing:', err));
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(`${text}\n${window.location.href}`)
      .then(() => alert('Result copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  }
}

export default BattleResults;
