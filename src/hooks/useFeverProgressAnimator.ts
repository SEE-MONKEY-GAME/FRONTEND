// useFeverProgressAnimator.ts
import { useCallback, useEffect, useRef, useState } from 'react';

type Opts = {
  // 0~1 스케일로 동작 (게임 로직이 0~20이면 /20 해서 넘겨줘도 되고, 아래 nudgeByItems API 사용)
  fillMinMs?: number;     // 아주 작은 증가에도 최소 채우기 시간
  fillMaxMs?: number;     // 너무 큰 증가에도 최대 채우기 시간
  fillFullMs?: number;    // 0→1을 채우는데 걸리는 기준 시간 (증가량에 비례해서 산정)
  drainMs?: number;       // 피버 소진 시간 (1→0)
  onFeverStart?: () => void;
  onFeverEnd?: () => void;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function useFeverProgressAnimator({
  fillMinMs = 120,
  fillMaxMs = 420,
  fillFullMs = 280,
  drainMs = 6000,
  onFeverStart,
  onFeverEnd,
}: Opts = {}) {
  const [visual, setVisual] = useState(0);      // 화면에 보이는 값(0~1)
  const visualRef = useRef(0);
  const queueRef = useRef<number[]>([]);        // 처리해야 할 target(0~1) 시퀀스
  const runningRef = useRef(false);             // rAF 루프 실행 여부
  const rafRef = useRef<number | null>(null);

  // 내부: rAF 한 번만 돌리고, 큐를 소비
  const kick = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;

    let start = 0;
    let from = visualRef.current;
    let to = from;

    const step = (now: number) => {
      if (!start) {
        // 새 타겟이 없으면 다음 타겟 가져오기
        if (queueRef.current.length === 0) {
          runningRef.current = false;
          rafRef.current = null;
          return;
        }
        start = now;
        from = visualRef.current;
        to = queueRef.current.shift()!;
      }

      // 채우기/감소 지속시간 계산
      const dist = Math.abs(to - from); // 0~1
      const isDrain = to < from;
      const duration = isDrain
        ? Math.max(200, (from - to) * drainMs) // 1→0은 drainMs, 부분감소면 비례
        : Math.min(
            fillMaxMs,
            Math.max(fillMinMs, dist * fillFullMs / 1 * 1000 / 1000) // dist * fillFullMs
          );

      const t = Math.min(1, (now - start) / duration);
      const eased = isDrain ? t : easeOutCubic(t);
      const v = from + (to - from) * eased;

      visualRef.current = v;
      setVisual(v);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // 한 타겟 종료
      start = 0;

      // 피버 연출 파이프라인: 막 찼으면 → 피버 소진 → 오버플로우 재적용
      // (이 로직은 enqueue 시점에서 target을 1 초과로 넣으면 자동으로 쪼개도록 했기 때문에
      //  여기서는 단순히 큐가 비었는지/다음 타겟이 있는지만 보면 됨)
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [drainMs, fillFullMs, fillMaxMs, fillMinMs]);

  // API: “절대 목표치(0~1)”로 부드럽게 이동
  const setTarget = useCallback((target01: number) => {
    const t = Math.max(0, Math.min(1, target01));
    queueRef.current.push(t);
    kick();
  }, [kick]);

  // API: “증가량(0~1 스케일)”만큼 부드럽게 올리기 (오버플로우 자동 처리)
  const nudgeBy = useCallback((delta01: number) => {
    if (delta01 === 0) return;
    const current = (queueRef.current.length ? queueRef.current[queueRef.current.length - 1] : visualRef.current);

    let target = current + delta01;

    if (target <= 1) {
      // 단순 채우기
      queueRef.current.push(Math.max(0, Math.min(1, target)));
    } else {
      // 오버플로우: (current→1) → (1→0 drain) → (0→overflow)
      const overflow = target - 1;
      // 1) current → 1
      queueRef.current.push(1);
      // 2) onFeverStart 콜백 + drain
      queueRef.current.push(0);
      onFeverStart?.();
      // 3) overflow 만큼 다시 채우기 (여러 번 넘치면 while로 반복)
      let rest = overflow;
      while (rest > 0) {
        if (rest >= 1) {
          // 0→1 → 1→0 (연속 피버)
          queueRef.current.push(1);
          queueRef.current.push(0);
          onFeverStart?.();
          rest -= 1;
        } else {
          queueRef.current.push(rest); // 0→rest
          rest = 0;
        }
      }
      // 피버 종료는 drain 시각 효과가 끝났을 때 알리고 싶다면,
      // 필요 시 here가 아닌 외부에서 'visual가 0 되면' 감지해 호출해도 됨.
      // 간단하게는 drain 시퀀스 직후 예약 호출:
      queueRef.current.push(visualRef.current); // no-op 체크포인트 후…
      setTimeout(() => onFeverEnd?.(), 0);
    }
    kick();
  }, [kick, onFeverStart, onFeverEnd]);

  // 아이템 개수 스케일로 올리기 (예: max=20 기준)
  const nudgeByItems = useCallback((count: number, maxItems: number) => {
    if (count === 0 || maxItems <= 0) return;
    nudgeBy(count / maxItems);
  }, [nudgeBy]);

  // API: 즉시 값 설정(연출 없이)
  const setImmediate = useCallback((v01: number) => {
    const v = Math.max(0, Math.min(1, v01));
    queueRef.current.length = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    runningRef.current = false;
    visualRef.current = v;
    setVisual(v);
  }, []);

  // API: 강제 드레인(피버 소진 애니메이션)
  const startDrain = useCallback((durationMs?: number) => {
    const cur = (queueRef.current.length ? queueRef.current[queueRef.current.length - 1] : visualRef.current);
    if (cur <= 0) return;
    // 현재 → 0
    // drain 속도는 drainMs를 쓰고, 부분감소면 비례
    queueRef.current.push(0);
    onFeverStart?.(); // 필요시 주석
    // 종료 알림은 drain 끝난 뒤 외부에서 visual==0 체크로 해도 OK
    kick();
  }, [kick, onFeverStart]);

  // cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      runningRef.current = false;
    };
  }, []);

  return {
    progress: visual,        // 화면에 사용할 값
    setTarget,               // 절대 목표치(0~1)
    nudgeBy,                 // 증가량(0~1)
    nudgeByItems,            // 증가 아이템(개수, maxItems)
    setImmediate,            // 즉시 값 설정
    startDrain,              // 강제 소진
  };
}
