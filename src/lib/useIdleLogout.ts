import { useEffect, useRef, useState } from 'react';
import { signOut } from './auth';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
];

const IDLE_LIMIT_MS = 15 * 60 * 1000;      // 15 minutes
const WARNING_WINDOW_MS = 60 * 1000;        // show warning for last 60s

export interface IdleState {
  /** Seconds remaining before automatic logout. Null when not warning. */
  secondsRemaining: number | null;
  /** Manually refresh the idle timer (used when user clicks "Stay signed in"). */
  keepAlive: () => void;
}

export function useIdleLogout(enabled: boolean): IdleState {
  const [warningAt, setWarningAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  /* ---- Reset the clock on any activity ---- */
  const reset = () => {
    lastActivityRef.current = Date.now();
    if (warningAt !== null) {
      setWarningAt(null);
      setSecondsRemaining(null);
    }
  };

  /* ---- Attach listeners + run the interval ---- */
  useEffect(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, reset, { passive: true });
    }

    // Check once per second
    const tick = () => {
      const idleFor = Date.now() - lastActivityRef.current;
      const remaining = IDLE_LIMIT_MS - idleFor;

      if (remaining <= 0) {
        // Sign out
        if (tickRef.current !== null) window.clearInterval(tickRef.current);
        signOut().finally(() => {
          window.location.href = '/admin/login?reason=idle';
        });
        return;
      }

      if (remaining <= WARNING_WINDOW_MS) {
        setSecondsRemaining(Math.ceil(remaining / 1000));
      } else if (secondsRemaining !== null) {
        setSecondsRemaining(null);
      }
    };

    tickRef.current = window.setInterval(tick, 1000) as unknown as number;

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, reset);
      }
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  /* ---- Public API ---- */
  const keepAlive = () => reset();

  return { secondsRemaining, keepAlive };
}