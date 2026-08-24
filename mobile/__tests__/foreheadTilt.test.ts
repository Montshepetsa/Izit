import {
  CORRECT_HOLD_SAMPLES,
  CORRECT_TRIGGER,
  createTiltTracker,
  NEUTRAL,
  reduceTiltSample,
  SKIP_TRIGGER,
  type TiltTracker,
} from '../src/hooks/foreheadTilt';

function feed(state: TiltTracker, samples: number[]) {
  let next = state;
  const gestures: Array<'correct' | 'skip'> = [];
  for (const z of samples) {
    const step = reduceTiltSample(next, z);
    next = step.next;
    if (step.gesture) gestures.push(step.gesture);
  }
  return { next, gestures };
}

describe('forehead tilt thresholds', () => {
  it('makes correct stricter than skip so accidental nods do not score', () => {
    expect(SKIP_TRIGGER).toBe(0.72);
    expect(CORRECT_TRIGGER).toBe(0.84);
    expect(CORRECT_TRIGGER).toBeGreaterThan(SKIP_TRIGGER);
    expect(NEUTRAL).toBe(0.32);
    expect(CORRECT_HOLD_SAMPLES).toBe(2);
  });

  it('does not treat a slight downward look or the old 0.72 threshold as correct', () => {
    const wobble = feed(createTiltTracker(), [-0.4, -0.55, -0.7, -0.72, -0.72, -0.72]);
    expect(wobble.gestures).toEqual([]);
    expect(wobble.next.armed).toBe(true);
  });

  it('ignores a single bounce past the correct threshold', () => {
    const bounce = feed(createTiltTracker(), [-0.95, -0.2]);
    expect(bounce.gestures).toEqual([]);
    expect(bounce.next.armed).toBe(true);
  });

  it('fires correct only after a held nod past the raised threshold', () => {
    const nod = feed(createTiltTracker(), [-0.85, -0.9]);
    expect(nod.gestures).toEqual(['correct']);
    expect(nod.next.armed).toBe(false);
  });

  it('cannot rapid-fire correct until the phone returns to neutral', () => {
    let { next, gestures } = feed(createTiltTracker(), [-0.9, -0.9]);
    expect(gestures).toEqual(['correct']);

    ({ next, gestures } = feed(next, [-0.95, -0.88, -0.5]));
    expect(gestures).toEqual([]);
    expect(next.armed).toBe(false);

    ({ next, gestures } = feed(next, [0.1, -0.9, -0.9]));
    expect(gestures).toEqual(['correct']);
  });

  it('still fires skip immediately on a tilt up and leaves skip magnitude unchanged', () => {
    const skip = feed(createTiltTracker(), [0.73]);
    expect(skip.gestures).toEqual(['skip']);
    expect(skip.next.armed).toBe(false);

    const shy = feed(createTiltTracker(), [0.5, 0.72]);
    expect(shy.gestures).toEqual([]);
  });

  it('re-arms skip after returning to neutral', () => {
    let { next, gestures } = feed(createTiltTracker(), [0.8]);
    expect(gestures).toEqual(['skip']);

    ({ next, gestures } = feed(next, [0.9, 0.05, 0.8]));
    expect(gestures).toEqual(['skip']);
  });

  it('resets an unfinished correct hold if the nod does not stay down', () => {
    const aborted = feed(createTiltTracker(), [-0.9, -0.5, -0.9]);
    expect(aborted.gestures).toEqual([]);
    expect(aborted.next.correctHold).toBe(1);
    expect(aborted.next.armed).toBe(true);
  });
});
