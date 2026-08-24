import { createAudioPlayer, preload, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';

const PLAYER_OPTS = { keepAudioSessionActive: true, updateInterval: 1000 } as const;
const RETRIGGER_MS = 90;

const sources = {
  correct: require('../../assets/sounds/correct.wav'),
  skip: require('../../assets/sounds/skip.wav'),
  tick3: require('../../assets/sounds/tick-3.wav'),
  tick2: require('../../assets/sounds/tick-2.wav'),
  tick1: require('../../assets/sounds/tick-1.wav'),
  timesUp: require('../../assets/sounds/times-up.wav'),
} as const;

type SoundName = keyof typeof sources;

try {
  for (const src of Object.values(sources)) {
    void preload(src).catch(() => undefined);
  }
} catch {
  // Native module missing (tests, first paint). Play still works without audio.
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pulseTimeUpHaptics(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await wait(120);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Web / simulators without a haptic engine stay silent.
    }
  }
}

function replay(player: AudioPlayer): void {
  void player
    .seekTo(0)
    .then(() => {
      player.play();
    })
    .catch(() => {
      try {
        player.play();
      } catch {
        // Stay silent if this clip cannot play.
      }
    });
}

export function useGameSounds(): {
  playCorrect: () => void;
  playSkip: () => void;
  playCountdownTick: (n: number) => void;
  playTimeUp: () => void;
} {
  const players = useRef<Partial<Record<SoundName, AudioPlayer>>>({});
  const lastAt = useRef<Partial<Record<SoundName, number>>>({});

  useEffect(() => {
    let cancelled = false;
    const created: Partial<Record<SoundName, AudioPlayer>> = {};

    void (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'mixWithOthers',
          shouldPlayInBackground: false,
        });
      } catch {
        // Mode is best-effort. Short clips should still play.
      }
      if (cancelled) return;

      (Object.keys(sources) as SoundName[]).forEach((name) => {
        try {
          created[name] = createAudioPlayer(sources[name], PLAYER_OPTS);
        } catch {
          // Skip this clip. The rest of the game keeps running.
        }
      });
      if (cancelled) {
        Object.values(created).forEach((player) => {
          try {
            player.remove();
          } catch {
            // ignore
          }
        });
        return;
      }
      players.current = created;
    })();

    return () => {
      cancelled = true;
      Object.values(players.current).forEach((player) => {
        try {
          player.remove();
        } catch {
          // ignore
        }
      });
      players.current = {};
    };
  }, []);

  const play = useCallback((name: SoundName) => {
    const now = Date.now();
    if (now - (lastAt.current[name] ?? 0) < RETRIGGER_MS) return;
    lastAt.current[name] = now;
    const player = players.current[name];
    if (!player) return;
    replay(player);
  }, []);

  const playCorrect = useCallback(() => play('correct'), [play]);
  const playSkip = useCallback(() => play('skip'), [play]);
  const playCountdownTick = useCallback(
    (n: number) => {
      if (n >= 3) play('tick3');
      else if (n === 2) play('tick2');
      else play('tick1');
    },
    [play]
  );
  const playTimeUp = useCallback(() => {
    play('timesUp');
    void pulseTimeUpHaptics();
  }, [play]);

  return { playCorrect, playSkip, playCountdownTick, playTimeUp };
}
