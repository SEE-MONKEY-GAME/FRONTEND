import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import { useSound } from '@context/sound-context';
import GameScene from '@scenes/game-scene';
import HomeScene from '@scenes/home-scene';
import LoadScene from '@scenes/load-scene';

let globalGame: Phaser.Game | null = null;

const Canvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { bgm, effect } = useSound();

  useEffect(() => {
    if (containerRef.current && !globalGame) {
      globalGame = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        transparent: true,
        antialias: true,
        pixelArt: false,
        scene: [LoadScene, HomeScene, GameScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
      });
    }

    (globalGame as any).INIT_SOUND_STATE = { bgm, effect };
    globalGame?.events.emit('UPDATE_SOUND_STATE', { bgm, effect });
  }, [bgm, effect]);

  return (
    <div
      id="phaser-container"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        position: 'absolute',
        inset: 0,
      }}
    />
  );
};

export default Canvas;
