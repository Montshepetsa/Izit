import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { createTiltTracker, reduceTiltSample } from './foreheadTilt';

export function useForeheadTilt(
  enabled: boolean,
  onCorrect: () => void,
  onSkip: () => void
): void {
  const trackerRef = useRef(createTiltTracker());
  const onCorrectRef = useRef(onCorrect);
  const onSkipRef = useRef(onSkip);
  onCorrectRef.current = onCorrect;
  onSkipRef.current = onSkip;

  useEffect(() => {
    if (!enabled) return undefined;

    let sub: { remove: () => void } | undefined;
    let cancelled = false;
    trackerRef.current = createTiltTracker();

    void (async () => {
      const available = await Accelerometer.isAvailableAsync();
      if (!available || cancelled) return;
      const permission = await Accelerometer.requestPermissionsAsync();
      if (!permission.granted || cancelled) return;

      Accelerometer.setUpdateInterval(80);
      sub = Accelerometer.addListener(({ z }) => {
        const { next, gesture } = reduceTiltSample(trackerRef.current, z);
        trackerRef.current = next;
        if (gesture === 'skip') onSkipRef.current();
        else if (gesture === 'correct') onCorrectRef.current();
      });
      if (cancelled) sub.remove();
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled]);
}
