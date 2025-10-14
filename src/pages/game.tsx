/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from 'react';
import GameCanvas from '@canvas/game-canvas';
import {
  currentScoreCss, coinCss, coinTextCss,
  feverWrapCss, feverEmptyCss, feverFullCss, feverBadgeCss
} from '@styles/pages/game.css';
import {FEVER_DURATION_MS} from '@scenes/game-scene'

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [coin, setCoin] = useState(0);
  const [feverProgress, setFeverProgress] = useState(0); 
  const [feverActive, setFeverActive] = useState(false);

  const rafIdRef = useRef<number | null>(null);
  const feverActiveRef = useRef(false);

  useEffect(() => {
    const onScore = (e: CustomEvent<{ score: number }>) => setScore(e.detail.score);
    const onCoin  = (e: CustomEvent<{ coin: number }>)  => setCoin(e.detail.coin);

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

  useEffect(() => {
    feverActiveRef.current = feverActive;

    if (!feverActive) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    setFeverProgress(1);

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / FEVER_DURATION_MS);
      const p = 1 - t; 
      setFeverProgress(p);

      if (p > 0 && feverActiveRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        setFeverActive(false);
        setFeverProgress(0);
        rafIdRef.current = null;
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

  const rightCut = `${Math.max(0, 100 - feverProgress * 100)}%`;

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
      <GameCanvas />

      <span css={currentScoreCss}>{score} m</span>

      <div css={coinCss}>
        <span css={coinTextCss}>{coin}</span>
      </div>

      <div css={feverWrapCss} aria-label={feverActive ? 'Fever Active' : 'Fever Charging'}>
        <div css={feverEmptyCss} />
        <div
          css={feverFullCss}
          style={{ clipPath: `inset(0 ${rightCut} 0 0)` }}
        />
      </div>

      {/* (임시) */}
      {feverActive && (
        <div css={feverBadgeCss}>FEVER!</div>
      )}
    </div>
  );
}
