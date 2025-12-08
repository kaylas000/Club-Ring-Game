import { useState, useEffect } from 'react';
import { GameScreen } from './types';

// Placeholder components - будут созданы позже
const MenuScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-secondary to-secondary-dark text-white">
    <h1 className="text-6xl font-display mb-8">🥊 CLUB RING</h1>
    <div className="text-xl mb-4">Telegram Boxing Game</div>
    <button className="px-8 py-4 bg-primary hover:bg-primary-dark rounded-lg text-2xl font-bold transition-colors">
      START GAME
    </button>
    <div className="mt-8 text-sm opacity-70">v0.1.0 - MVP in Development</div>
  </div>
);

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('MENU');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize game
    const init = async () => {
      try {
        // TODO: Initialize Telegram SDK
        // TODO: Load player profile
        // TODO: Connect to backend
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="text-white text-2xl">Loading Club Ring...</div>
      </div>
    );
  }

  // Router будет добавлен позже
  return (
    <div className="app">
      {currentScreen === 'MENU' && <MenuScreen />}
      {/* Другие экраны будут добавлены позже */}
    </div>
  );
}

export default App;
