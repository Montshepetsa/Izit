import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import type { Phase } from '../state/gameTypes';

export function usePlayOrientation(phase: Phase): void {
  useEffect(() => {
    const landscape = phase === 'countdown' || phase === 'playing';
    const lock = landscape
      ? ScreenOrientation.OrientationLock.LANDSCAPE
      : ScreenOrientation.OrientationLock.PORTRAIT_UP;

    void ScreenOrientation.lockAsync(lock).catch(() => undefined);

    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
        () => undefined
      );
    };
  }, [phase]);
}
