/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from 'react';
import GameCanvas from '@canvas/game-canvas';
import { currentScoreCss, coinCss, coinTextCss, feverWrapCss, feverEmptyCss, feverBadgeCss } from '@styles/pages/game.css';
import { FEVER_DURATION_MS } from '@scenes/game-scene';
import FeverGauge from '@components/FeverGauge';
import { useFeverProgressAnimator } from '../hooks/useFeverProgressAnimator';

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [coin, setCoin] = useState(0);

  // 게이지 애니메이터 (연출 파라미터 조절은 훅 옵션으로)
  const {
    progress: feverProgress,
    setTarget,
    nudgeBy,
    nudgeByItems,
    startDrain,
  } = useFeverProgressAnimator({
    drainMs: FEVER_DURATION_MS,
    onFeverStart: () => {/* 필요 시 효과음/플래시 등 */},
    onFeverEnd:   () => {/* 피버 종료 효과 */},
  });

  // 이벤트 연결
  useEffect(() => {
    const onScore = (e: CustomEvent<{ score: number }>) => setScore(e.detail.score);
    const onCoin  = (e: CustomEvent<{ coin: number }>)  => setCoin(e.detail.coin);

    // 1) 엔진이 progress(0~1)와 active를 주는 케이스
    const onFever = (e: CustomEvent<{ progress: number; active: boolean; timeLeftMs?: number }>) => {
      const p = Math.max(0, Math.min(1, e.detail.progress));
      // 평소: 목표치로 “부드럽게” 이동 (뚝뚝 방지)
      setTarget(p);

      // 엔진이 피버 발동을 스스로 관리한다면 → 소진만 훅에 맡김
      if (e.detail.active) {
        // 남은 시간 맞춰 소진시키고 싶으면 drainMs를 덮어써도 됨
        startDrain(e.detail.timeLeftMs ?? undefined);
      }
    };

    window.addEventListener('game:score', onScore as EventListener);
    window.addEventListener('game:coin',  onCoin  as EventListener);
    window.addEventListener('game:fever', onFever as EventListener);

    return () => {
      window.removeEventListener('game:score', onScore as EventListener);
      window.removeEventListener('game:coin',  onCoin  as EventListener);
      window.removeEventListener('game:fever', onFever as EventListener);
    };
  }, [setTarget, startDrain]);

  // 2) 만약 “아이템 1개 먹음” 이벤트가 따로 있다면, 이렇게 쓰면 더 자연스러워요:
  // window.dispatchEvent(new CustomEvent('game:item', { detail: { count: 1 }}))
  useEffect(() => {
    const onItem = (e: CustomEvent<{ count: number }>) => {
      nudgeByItems(e.detail.count, 20); // max=20 기준
    };
    window.addEventListener('game:item', onItem as EventListener);
    return () => window.removeEventListener('game:item', onItem as EventListener);
  }, [nudgeByItems]);

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

      {/* 배지 표시는 피버 시작/종료 콜백으로 관리하거나, 별도 상태로 표시 */}
      {/* {isFever && <div css={feverBadgeCss}>FEVER!</div>} */}
    </div>
  );
}
