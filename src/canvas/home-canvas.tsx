import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import HomeScene from '@scenes/home-scene';

const HomeCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        transparent: true,
        antialias: true,
        pixelArt: false,
        scene: [HomeScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
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
      style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    />
  );
};

export default HomeCanvas;
