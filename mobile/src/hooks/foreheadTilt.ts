/** Skip (tilt up): ~46° from vertical. Unchanged — extra skips hurt less than extra points. */
export const SKIP_TRIGGER = 0.72;
/** Correct (tilt down): ~57° from vertical. Was 0.72; small nods / wobble used to score. */
export const CORRECT_TRIGGER = 0.84;
/** Re-arm only after returning near vertical (~19°). Blocks rapid-fire. */
export const NEUTRAL = 0.32;
/** Consecutive samples below −CORRECT_TRIGGER before scoring. 2 × 80ms ≈ 160ms. */
export const CORRECT_HOLD_SAMPLES = 2;

export type TiltGesture = 'correct' | 'skip' | null;

export type TiltTracker = {
  armed: boolean;
  correctHold: number;
};

export function createTiltTracker(): TiltTracker {
  return { armed: true, correctHold: 0 };
}

export function reduceTiltSample(state: TiltTracker, z: number): { next: TiltTracker; gesture: TiltGesture } {
  if (state.armed && z > SKIP_TRIGGER) {
    return { next: { armed: false, correctHold: 0 }, gesture: 'skip' };
  }

  if (state.armed && z < -CORRECT_TRIGGER) {
    const correctHold = state.correctHold + 1;
    if (correctHold >= CORRECT_HOLD_SAMPLES) {
      return { next: { armed: false, correctHold: 0 }, gesture: 'correct' };
    }
    return { next: { armed: true, correctHold }, gesture: null };
  }

  return {
    next: { armed: state.armed || Math.abs(z) < NEUTRAL, correctHold: 0 },
    gesture: null,
  };
}
