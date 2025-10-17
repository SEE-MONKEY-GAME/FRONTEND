/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import GameCanvas from '@canvas/game-canvas';
import {
  currentScoreCss,
  coinCss,
  coinTextCss,
  feverWrapCss,
  feverEmptyCss,
} from '@styles/pages/game.css';
import { FEVER_DURATION_MS } from '@scenes/game-scene';
import FeverGauge from '@components/feverGauge';
import GameOverModal from '@components/GameOverModal';
import { useFeverProgressAnimator } from '../hooks/useFeverProgressAnimator';

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [coin, setCoin] = useState(0);

  // Game Over 모달 상태
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoin, setFinalCoin] = useState(0);

  const {
    progress: feverProgress,
    setTarget,
    nudgeByItems,
    startDrain,
  } = useFeverProgressAnimator({
    drainMs: FEVER_DURATION_MS,
  });

  // 점수/코인/피버 이벤트
  useEffect(() => {
    const onScore = (e: CustomEvent<{ score: number }>) => setScore(e.detail.score);
    const onCoin = (e: CustomEvent<{ coin: number }>) => setCoin(e.detail.coin);
    const onFever = (e: CustomEvent<{ progress: number; active: boolean; timeLeftMs?: number }>) => {
      const p = Math.max(0, Math.min(1, e.detail.progress));
      setTarget(p);
      if (e.detail.active) startDrain(e.detail.timeLeftMs ?? undefined);
    };

    window.addEventListener('game:score', onScore as EventListener);
    window.addEventListener('game:coin', onCoin as EventListener);
    window.addEventListener('game:fever', onFever as EventListener);
    return () => {
      window.removeEventListener('game:score', onScore as EventListener);
      window.removeEventListener('game:coin', onCoin as EventListener);
      window.removeEventListener('game:fever', onFever as EventListener);
    };
  }, [setTarget, startDrain]);

  // (선택) 아이템 낙찰 이벤트
  useEffect(() => {
    const onItem = (e: CustomEvent<{ count: number }>) => {
      nudgeByItems(e.detail.count, 20);
    };
    window.addEventListener('game:item', onItem as EventListener);
    return () => window.removeEventListener('game:item', onItem as EventListener);
  }, [nudgeByItems]);

  // 게임오버 이벤트 수신 → 모달 열기
  useEffect(() => {
    const onOver = (e: CustomEvent<{ score: number; coin: number }>) => {
      setFinalScore(e.detail.score);
      setFinalCoin(e.detail.coin);
      setIsGameOver(true);
    };
    window.addEventListener('game:over', onOver as EventListener);
    return () => window.removeEventListener('game:over', onOver as EventListener);
  }, []);

  // REPLAY → Phaser Scene 재시작 신호
  const replay = () => {
    window.dispatchEvent(new Event('game:replay'));
    setIsGameOver(false);
    setScore(0);
    setCoin(0);
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
      <GameCanvas />

      <span css={currentScoreCss}>{score} m</span>

      <div css={coinCss}>
        <span css={coinTextCss}>{coin}</span>
      </div>

      <div css={feverWrapCss} aria-label="Fever Gauge">
        <div css={feverEmptyCss} />
        <div style={{ position: 'absolute', inset: 0 }}>
          <FeverGauge width={320} height={30} progress={feverProgress} />
        </div>
      </div>

      {/* 게임오버 모달 */}
      <GameOverModal
        open={isGameOver}
        score={finalScore}
        coin={finalCoin}
        onClose={() => setIsGameOver(false)}
        onReplay={replay}
      />
    </div>
  );
}
