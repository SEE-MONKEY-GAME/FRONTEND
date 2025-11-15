/** @jsxImportSource @emotion/react */
import { useFeverProgressAnimator } from '../hooks/useFeverProgressAnimator';
import { useEffect, useState } from 'react';
import FeverGauge from '@components/fever-gauge';
import GameOverModal from '@components/gameover-modal';
import RocketPrompt from '@components/rocketprompt';
import { FEVER_DURATION_MS } from '@scenes/game-scene';
import { circleCss, coinCss, coinTextCss, currentScoreCss, feverEmptyCss, feverWrapCss } from '@styles/pages/game.css';

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [coin, setCoin] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoin, setFinalCoin] = useState(0);
  const [showRocketPrompt, setShowRocketPrompt] = useState(true);


  const {
    progress: feverProgress,
    setTarget,
    nudgeByItems,
    startDrain,
  } = useFeverProgressAnimator({
    drainMs: FEVER_DURATION_MS,
  });

  
// 게임 시작(로켓 사용)
const startGame = () => {
  const w = window as any;
  w.__rocketStart = true;       // 로켓 모드
  w.__queuedGameStart = true;   // GameScene이 생기면 바로 시작

  window.dispatchEvent(new Event('game:play')); // ✅ 여기만 변경
  setShowRocketPrompt(false);
};

// 건너뛰기(일반 시작, 카운트다운)
const skipGame = () => {
  const w = window as any;
  w.__rocketStart = false;      // 일반 모드
  w.__queuedGameStart = true;

  window.dispatchEvent(new Event('game:play')); // ✅ 여기도 변경
  setShowRocketPrompt(false);
};

const replay = () => {
  const w = window as any;
  w.__queuedGameStart = false;
  w.__rocketStart = false;

  window.dispatchEvent(new Event('game:replay'));

  setIsGameOver(false);
  setScore(0);
  setCoin(0);
  setShowRocketPrompt(true);
};


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

  useEffect(() => {
    const onItem = (e: CustomEvent<{ count: number }>) => {
      nudgeByItems(e.detail.count, 20);
    };
    window.addEventListener('game:item', onItem as EventListener);
    return () => window.removeEventListener('game:item', onItem as EventListener);
  }, [nudgeByItems]);

  useEffect(() => {
    const onOver = (e: CustomEvent<{ score: number; coin: number }>) => {
      setFinalScore(e.detail.score);
      setFinalCoin(e.detail.coin);
      setIsGameOver(true);
    };
    window.addEventListener('game:over', onOver as EventListener);
    return () => window.removeEventListener('game:over', onOver as EventListener);
  }, []);


  return (
    <>
      <div css={circleCss} />
      <div style={{ width: '100%', height: '100vh', position: 'relative', background: 'transparent' }}>
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

        <GameOverModal
          open={isGameOver}
          score={finalScore}
          coin={finalCoin}
          onClose={() => setIsGameOver(false)}
          onReplay={replay}
        />
      <RocketPrompt
  open={showRocketPrompt}
  onSkip={skipGame}
  onUse={startGame}
/>
      </div>
    </>
  );
}
