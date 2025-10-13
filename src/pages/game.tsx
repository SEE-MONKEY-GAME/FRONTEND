/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from 'react';
import GameCanvas from '@canvas/game-canvas';
import {
  currentScoreCss, coinCss, coinTextCss,
  feverWrapCss, feverEmptyCss, feverFullCss, feverBadgeCss
} from '@styles/pages/game.css';

const FEVER_DURATION_MS = 6000; // 6초

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [coin, setCoin] = useState(0);

  // 🔥 Fever UI
  const [feverProgress, setFeverProgress] = useState(0); // 0~1 (UI 게이지)
  const [feverActive, setFeverActive] = useState(false);

  // 내부 드레인 루프 제어용
  const rafIdRef = useRef<number | null>(null);
  const feverActiveRef = useRef(false);

  useEffect(() => {
    const onScore = (e: CustomEvent<{ score: number }>) => setScore(e.detail.score);
    const onCoin  = (e: CustomEvent<{ coin: number }>)  => setCoin(e.detail.coin);

    // 만약 Phaser가 'game:fever' 이벤트를 쏴준다면 받기 (없어도 동작함)
    const onFever = (e: CustomEvent<{ progress: number; active: boolean; timeLeftMs?: number }>) => {
      const p = Math.max(0, Math.min(1, e.detail.progress));
      setFeverProgress(p);
      setFeverActive(!!e.detail.active);
    };

    window.addEventListener('game:score', onScore as EventListener);
    window.addEventListener('game:coin',  onCoin  as EventListener);
    window.addEventListener('game:fever', onFever as EventListener);

    return () => {
      window.removeEventListener('game:score', onScore as EventListener);
      window.removeEventListener('game:coin',  onCoin  as EventListener);
      window.removeEventListener('game:fever', onFever as EventListener);
    };
  }, []);

  // 🔥 feverActive가 true가 되는 순간부터 6초 동안 게이지가 1→0으로 감소
  useEffect(() => {
    feverActiveRef.current = feverActive;

    // 켜질 때만 드레인 시작
    if (!feverActive) {
      // 끌 때는 루프 정리
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    // 시작 시 게이지를 꽉 채움
    setFeverProgress(1);

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / FEVER_DURATION_MS);
      const p = 1 - t; // 1 → 0으로 감소
      setFeverProgress(p);

      if (p > 0 && feverActiveRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        // 6초 완료 또는 외부에서 끈 경우
        setFeverActive(false);
        setFeverProgress(0);
        rafIdRef.current = null;

        // 필요하면 끝났음을 게임 쪽에 알려줄 수도 있음
        // window.dispatchEvent(new CustomEvent('game:feverEnd'));
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [feverActive]);

  // 오른쪽을 잘라낼 퍼센트(= 1 - progress)
  const rightCut = `${Math.max(0, 100 - feverProgress * 100)}%`;

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
      <GameCanvas />

      <span css={currentScoreCss}>{score} m</span>

      <div css={coinCss}>
        <span css={coinTextCss}>{coin}</span>
      </div>

      {/* 🔥 피버 게이지: full을 오른쪽부터 잘라서 드러냄(스케일 불변) */}
      <div css={feverWrapCss} aria-label={feverActive ? 'Fever Active' : 'Fever Charging'}>
        <div css={feverEmptyCss} />
        <div
          css={feverFullCss}
          style={{ clipPath: `inset(0 ${rightCut} 0 0)` }}
        />
      </div>

      {/* 🔥 피버 텍스트 배지(임시) */}
      {feverActive && (
        <div css={feverBadgeCss}>FEVER!</div>
      )}
    </div>
  );
}
