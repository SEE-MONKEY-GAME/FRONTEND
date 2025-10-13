/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import GameCanvas from '@canvas/game-canvas';
import { currentScoreCss } from '@styles/pages/game.css';

export default function GamePage() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const onScore = (e: CustomEvent<{ score: number }>) => setScore(e.detail.score);
    window.addEventListener('game:score', onScore as EventListener);
    return () => window.removeEventListener('game:score', onScore as EventListener);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        background: '#000',
      }}
    >
      <GameCanvas />
      <span css={currentScoreCss}>{score} m</span>
    </div>
  );
}
