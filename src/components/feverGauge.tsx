/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useMemo, useRef, useId } from 'react';
import { getImage } from '@utils/get-images';

type Props = { width?: number; height?: number; progress: number };

const svgWrap = css({ position: 'absolute', inset: 0, pointerEvents: 'none' });

export default function FeverGauge({ width = 320, height = 30, progress }: Props) {
  const id = useId();
  const clipPathId = useMemo(() => `feverClip-${id}`, [id]);

  // 진행률을 ref로 보관(피버 중 변경에도 rAF 재시작 방지)
  const p = Math.max(0, Math.min(1, progress));
  const progRef = useRef(p);
  useEffect(() => { progRef.current = p; }, [p]);

  const fullUrl = getImage('game', 'full_guage_bar');

  // 파라미터(원하는 느낌으로 조절)
  const BASE_AMP = 1.2;        // 기본 진폭(px)
  const BREATH_AMP = 0;      // 호흡(진폭 가감)
  const WAVES = 1.8;         // 세로 높이에 들어가는 파수
  const SPEED = 1.6;         // 수평 진행 속도
  const STEPS = 44;          // 샘플 수(부드러움)
  const MAX_OFFSET = 14;     // 좌우 최대 오프셋(안정 범위)
  const LEFT_OVERLAP = 1;    // 왼쪽 가장자리 겹침(틈 제거)

  const pathRef = useRef<SVGPathElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const runningRef = useRef(true);

  // 단일 경로: (0,0) -> wave(x(y),y) 내려가며 -> (0,height) -> 닫기
  const buildPath = (phase: number) => {
    const prog = progRef.current;
    const center = prog * width;
    const amp = BASE_AMP + BREATH_AMP * Math.sin(phase);

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    let d = `M ${-LEFT_OVERLAP} 0`; // 왼쪽 살짝 겹쳐 시작(틈 방지)
    for (let i = 0; i <= STEPS; i++) {
      const ty = i / STEPS;
      const y = ty * height;
      const xOffset = amp * Math.sin(2 * Math.PI * (WAVES * ty) + phase);
      const x = clamp(center + clamp(xOffset, -MAX_OFFSET, MAX_OFFSET), -LEFT_OVERLAP, width);
      d += ` L ${x} ${y}`;
    }
    d += ` L ${-LEFT_OVERLAP} ${height} Z`;
    return d;
  };

  // 최초 1회 모양
  useEffect(() => {
    if (!pathRef.current) return;
    pathRef.current.setAttribute('d', buildPath(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // rAF 루프(항상 출렁, 탭 비활성 시 자동 pause)
  useEffect(() => {
    if (!pathRef.current) return;

    const step = (now: number) => {
      if (!runningRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      if (startRef.current === null) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      const phase = t * SPEED * Math.PI;

      pathRef.current!.setAttribute('d', buildPath(phase));
      rafRef.current = requestAnimationFrame(step);
    };

    const onVis = () => {
      runningRef.current = !document.hidden;
      if (!document.hidden) startRef.current = null;
    };
    document.addEventListener('visibilitychange', onVis, { passive: true });

    rafRef.current && cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  // 의도적으로 p 의존성 제외(진행률 변동에도 루프 지속)
  }, [width, height, BASE_AMP, BREATH_AMP, WAVES, SPEED, STEPS, MAX_OFFSET, LEFT_OVERLAP]);

  return (
    <svg css={svgWrap} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
          <path ref={pathRef} d="" />
        </clipPath>
      </defs>
      <image
        href={fullUrl}
        x="0"
        y="0"
        width={width}
        height={height}
        preserveAspectRatio="none"
        clipPath={`url(#${clipPathId})`}
      />
    </svg>
  );
}
