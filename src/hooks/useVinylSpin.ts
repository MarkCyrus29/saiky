import { useEffect, useRef } from "react";

export function useVinylSpin(
  elementRef: React.RefObject<HTMLElement | null>,
  isSpinning: boolean
) {
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ~33 RPM is ~198 deg/s. 165 deg/s gives ~2.18s per full rotation.
    const maxVelocity = prefersReducedMotion ? 50 : 165;
    const accelRate = prefersReducedMotion ? 60 : 180; // deg/s^2
    const decelRate = prefersReducedMotion ? 50 : 130; // deg/s^2

    function step(timestamp: number) {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      let v = velocityRef.current;

      if (isSpinning) {
        // Accelerate up to maxVelocity smoothly
        v = Math.min(maxVelocity, v + accelRate * dt);
      } else {
        // Ease and coast to a gentle stop
        v = Math.max(0, v - decelRate * dt);
      }

      velocityRef.current = v;
      angleRef.current = (angleRef.current + v * dt) % 360;

      if (elementRef.current) {
        elementRef.current.style.transform = `rotate(${angleRef.current.toFixed(2)}deg)`;
      }

      // If we are still moving or we are supposed to be spinning, keep looping
      if (isSpinning || v > 0.05) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        // Fully stopped: idle the loop
        velocityRef.current = 0;
        lastTimeRef.current = null;
        rafIdRef.current = null;
      }
    }

    // Start or resume loop if spinning or still moving
    if (isSpinning || velocityRef.current > 0) {
      lastTimeRef.current = null;
      rafIdRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [isSpinning, elementRef]);
}

