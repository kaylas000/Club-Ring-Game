import { useEffect, useState, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from './game/GameConfig';
import { useGameStore } from './store/gameStore';
import { GameScreen } from './types';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { currentScreen, setCurrentScreen, setError } = useGameStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Set theme
      document.documentElement.classList.add(
        tg.colorScheme === 'dark' ? 'dark' : 'light'
      );

      // Get user data
      const userData = tg.initDataUnsafe?.user;
      console.log('Telegram User:', userData);
    }

    // Initialize game only once
    if (!gameStarted && currentScreen === 'MENU') {
      try {
        gameRef.current = new Phaser.Game(gameConfig);
        setGameStarted(true);
        console.log('✅ Phaser game initialized');
      } catch (error) {
        console.error('Failed to initialize Phaser:', error);
        setError('Failed to initialize game');
      }
    }

    return () => {
      // Cleanup: don't destroy game on unmount (it persists)
    };
  }, [gameStarted, currentScreen, setError]);

  return (
    <div className="min-h-screen bg-secondary text-white">
      {/* Phaser game container */}
      <div id="game-container" className="w-full h-screen overflow-hidden">
        {/* Phaser will render here */}
      </div>

      {/* Game overlay (react components on top) */}
      {currentScreen === 'MENU' && <MenuOverlay />}
      {currentScreen === 'COMBAT' && <CombatOverlay />}
    </div>
  );
}

function MenuOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 z-50 pointer-events-auto">
        <button className="px-4 py-2 bg-primary rounded-lg hover:bg-primary-dark transition-colors">
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}

function CombatOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Additional UI on top of Phaser combat scene */}
    </div>
  );
}

export default App;
