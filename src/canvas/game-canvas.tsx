import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import GameScene from '@scenes/game-scene';

const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        backgroundColor: '#e9da99',
        antialias: true,
        pixelArt: false,
        scene: [GameScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {                              
    default: 'arcade',
    arcade: {     gravity: { x: 0, y: 0 },  
debug: false } 
  }
      });
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto', 
        zIndex: 1,
      }}
    />
  );
};

export default GameCanvas;
