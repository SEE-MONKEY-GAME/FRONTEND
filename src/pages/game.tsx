/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import GameCanvas from '@canvas/game-canvas';
import { currentScoreCss, coinCss, coinTextCss } from '@styles/pages/game.css';

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [coin, setCoin] = useState(0);

  useEffect(() => {
    const onScore = (e: CustomEvent<{ score: number }>) => setScore(e.detail.score);
    const onCoin = (e: CustomEvent<{ coin: number }>) => setCoin(e.detail.coin);
    window.addEventListener('game:score', onScore as EventListener);
    window.addEventListener('game:coin', onCoin as EventListener);
    return () => {
      window.removeEventListener('game:score', onScore as EventListener);
      window.removeEventListener('game:coin', onCoin as EventListener);
    };
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

      {/* ⛰️ 높이(m) 표시 */}
      <span css={currentScoreCss}>{score} m</span>

      {/* 💰 코인 UI */}
      <div css={coinCss}>
        <span css={coinTextCss}>{coin}</span>
      </div>
    </div>
  );
}
