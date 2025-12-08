import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BattleScene } from '@/scenes/BattleScene';
import { MenuScene } from '@/scenes/MenuScene';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { HUD } from '@/components/HUD';
import { useTelegramInitData } from '@/hooks/useTelegramInitData';

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setGameReady } = useGameStore();
  const { initializePlayer } = usePlayerStore();
  const { user } = useTelegramInitData();

  useEffect(() => {
    // Инициализация игрока из Telegram
    if (user) {
      initializePlayer({
        telegramId: user.id,
        username: user.username || `Player_${user.id}`,
        firstName: user.first_name,
      });
    }
  }, [user, initializePlayer]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [MenuScene, BattleScene],
      render: {
        pixelArt: false,
        antialias: true,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    setGameReady(true);

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [setGameReady]);

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      <div ref={containerRef} className="flex-1" />
      <HUD />
    </div>
  );
};

export default App;
