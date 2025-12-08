import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/Menu/MainMenu';
import { GameHUD } from './components/Game/GameHUD';
import { Leaderboard } from './components/Game/Leaderboard';
import { MatchLobby } from './components/Match/MatchLobby';
import { GameContainer } from './components/Game/GameContainer';

function App() {
  const { currentScreen } = useGameStore();

  useEffect(() => {
    // Initialize game
    console.log('🎮 Initializing Club Ring Game');
    
    // TODO: Initialize player profile from Telegram
    // TODO: Connect to WebSocket
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'MENU':
        return <MainMenu />;
      case 'COMBAT':
        return (
          <>
            <GameContainer />
            <GameHUD />
          </>
        );
      case 'LEADERBOARD':
        return <Leaderboard />;
      case 'MATCH_LOBBY':
        return <MatchLobby />;
      case 'TRAINING':
        return (
          <div className="min-h-screen bg-secondary flex items-center justify-center text-white text-4xl">
            🏋️ Training Mode - Coming Soon
          </div>
        );
      case 'SHOP':
        return (
          <div className="min-h-screen bg-secondary flex items-center justify-center text-white text-4xl">
            🛍️ Shop - Coming Soon
          </div>
        );
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="app bg-secondary min-h-screen">
      {renderScreen()}
    </div>
  );
}

export default App;
