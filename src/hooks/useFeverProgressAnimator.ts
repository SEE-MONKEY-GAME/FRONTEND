import { useCallback, useEffect, useRef, useState } from 'react';

type Opts = {
  fillMinMs?: number;    
  fillMaxMs?: number;     
  fillFullMs?: number;    
  drainMs?: number;       
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
  const [visual, setVisual] = useState(0);      
  const visualRef = useRef(0);
  const queueRef = useRef<number[]>([]);      
  const runningRef = useRef(false);             
  const rafRef = useRef<number | null>(null);

  const kick = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;

    let start = 0;
    let from = visualRef.current;
    let to = from;

    const step = (now: number) => {
      if (!start) {
        if (queueRef.current.length === 0) {
          runningRef.current = false;
          rafRef.current = null;
          return;
        }
        start = now;
        from = visualRef.current;
        to = queueRef.current.shift()!;
      }

      const dist = Math.abs(to - from); 
      const isDrain = to < from;
      const duration = isDrain
        ? Math.max(200, (from - to) * drainMs) 
        : Math.min(
            fillMaxMs,
            Math.max(fillMinMs, dist * fillFullMs / 1 * 1000 / 1000) 
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

      start = 0;

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [drainMs, fillFullMs, fillMaxMs, fillMinMs]);

  const setTarget = useCallback((target01: number) => {
    const t = Math.max(0, Math.min(1, target01));
    queueRef.current.push(t);
    kick();
  }, [kick]);

  const nudgeBy = useCallback((delta01: number) => {
    if (delta01 === 0) return;
    const current = (queueRef.current.length ? queueRef.current[queueRef.current.length - 1] : visualRef.current);

    let target = current + delta01;

    if (target <= 1) {
      queueRef.current.push(Math.max(0, Math.min(1, target)));
    } else {
      const overflow = target - 1;
      queueRef.current.push(1);
      queueRef.current.push(0);
      onFeverStart?.();
      let rest = overflow;
      while (rest > 0) {
        if (rest >= 1) {
          queueRef.current.push(1);
          queueRef.current.push(0);
          onFeverStart?.();
          rest -= 1;
        } else {
          queueRef.current.push(rest); 
          rest = 0;
        }
      }
      queueRef.current.push(visualRef.current); 
      setTimeout(() => onFeverEnd?.(), 0);
    }
    kick();
  }, [kick, onFeverStart, onFeverEnd]);

  const nudgeByItems = useCallback((count: number, maxItems: number) => {
    if (count === 0 || maxItems <= 0) return;
    nudgeBy(count / maxItems);
  }, [nudgeBy]);

  const setImmediate = useCallback((v01: number) => {
    const v = Math.max(0, Math.min(1, v01));
    queueRef.current.length = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    runningRef.current = false;
    visualRef.current = v;
    setVisual(v);
  }, []);

  const startDrain = useCallback((durationMs?: number) => {
    const cur = (queueRef.current.length ? queueRef.current[queueRef.current.length - 1] : visualRef.current);
    if (cur <= 0) return;
    queueRef.current.push(0);
    onFeverStart?.();
    kick();
  }, [kick, onFeverStart]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      runningRef.current = false;
    };
  }, []);

  return {
    progress: visual,       
    setTarget,               
    nudgeBy,                
    nudgeByItems,       
    setImmediate,            
    startDrain,             
  };
}
