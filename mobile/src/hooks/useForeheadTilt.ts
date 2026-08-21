import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

const TRIGGER = 0.72;
const NEUTRAL = 0.32;

export function useForeheadTilt(
  enabled: boolean,
  onCorrect: () => void,
  onSkip: () => void
): void {
  const armedRef = useRef(true);
  const onCorrectRef = useRef(onCorrect);
  const onSkipRef = useRef(onSkip);
  onCorrectRef.current = onCorrect;
  onSkipRef.current = onSkip;

  useEffect(() => {
    if (!enabled) return undefined;

    let sub: { remove: () => void } | undefined;
    let cancelled = false;
    armedRef.current = true;

    void (async () => {
      const available = await Accelerometer.isAvailableAsync();
      if (!available || cancelled) return;
      const permission = await Accelerometer.requestPermissionsAsync();
      if (!permission.granted || cancelled) return;

      Accelerometer.setUpdateInterval(80);
      sub = Accelerometer.addListener(({ z }) => {
        if (z > TRIGGER && armedRef.current) {
          armedRef.current = false;
          onSkipRef.current();
          return;
        }
        if (z < -TRIGGER && armedRef.current) {
          armedRef.current = false;
          onCorrectRef.current();
          return;
        }
        if (Math.abs(z) < NEUTRAL) armedRef.current = true;
      });
      if (cancelled) sub.remove();
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled]);
}
