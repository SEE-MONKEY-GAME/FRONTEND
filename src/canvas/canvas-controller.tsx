import { globalGame } from './canvas';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CanvasController = () => {
  const location = useLocation();

  useEffect(() => {
    if (!globalGame) {
      return;
    }

    const sceneManager = globalGame.scene;
    const container = document.getElementById('phaser-container');

    if (location.pathname === '/') {
      sceneManager.start('LoadScene');
    } else if (location.pathname === '/home') {
      sceneManager.start('HomeScene');
    } else if (location.pathname === '/game') {
      sceneManager.start('GameScene');
    }

    if (container) {
      const isGamePage = location.pathname === '/game';
      container.style.zIndex = isGamePage ? '1' : '0';
      container.style.pointerEvents = isGamePage ? 'auto' : 'none';
    }
  }, [location.pathname]);

  return null;
};

export default CanvasController;
