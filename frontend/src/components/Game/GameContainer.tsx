import { useEffect, useRef } from 'react';
import { gameManager } from '@game/GameManager';

export const GameContainer: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const isGameStarted = useRef(false);
  
  useEffect(() => {
    if (!gameRef.current || isGameStarted.current) return;
    
    // Initialize game
    const game = gameManager.init('game-container');
    isGameStarted.current = true;
    
    return () => {
      // Cleanup on unmount
      gameManager.destroy();
      isGameStarted.current = false;
    };
  }, []);
  
  return (
    <div
      id="game-container"
      ref={gameRef}
      className="w-full h-full flex items-center justify-center bg-secondary"
      style={{ minHeight: '100vh' }}
    />
  );
};
