import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer } from 'expo-sensors';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CountdownTimer } from '../components/atoms/CountdownTimer';
import { Icon } from '../components/atoms/Icon';
import { useForeheadTilt } from '../hooks/useForeheadTilt';
import { usePlayOrientation } from '../hooks/usePlayOrientation';
import {
  getCurrentPrompt,
  getGuesser,
  getPartner,
  getTurnCorrectCount,
  getTurnSkipCount,
  getWinningTeams,
  isLastGuesserOfNight,
  nextGuesser,
  teamLabel,
} from '../state/gameSelectors';
import { useGameStore } from '../state/gameStore';
import type { GameState, Phase } from '../state/gameTypes';
import { light, neon, radii } from '../theme/izitTheme';

function NeonButton({
  title,
  onPress,
  variant,
}: {
  title: string;
  onPress: () => void;
  variant: 'gradient' | 'outline';
}) {
  if (variant === 'gradient') {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.ctOuter, pressed && { opacity: 0.92 }]}>
        <LinearGradient
          colors={[light.gold, light.goldDeep]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.ctGradient}
        >
          <Text style={styles.ctText}>{title}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.88 }]}
    >
      <Text style={styles.outlineBtnText}>{title}</Text>
    </Pressable>
  );
}

function nightHasProgress(state: GameState): boolean {
  return state.teams.some((team) => team.score > 0) || state.phase !== 'ready';
}

function confirmEndGame(onEnd: () => void) {
  Alert.alert('End this game?', "Back to setup. Tonight's scores are gone.", [
    { text: 'Keep playing', style: 'cancel' },
    { text: 'End game', style: 'destructive', onPress: onEnd },
  ]);
}

function PlayNav({
  phase,
  onBack,
  onEnd,
}: {
  phase: Phase;
  onBack: () => void;
  onEnd: () => void;
}) {
  return (
    <View style={styles.playNav}>
      <Pressable
        onPress={onBack}
        style={styles.navBtn}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Icon name="arrow-left" size={18} color={neon.text} solid />
      </Pressable>
      <Text style={styles.navLogo}>IZIT!</Text>
      {phase === 'winner' ? (
        <View style={styles.navBtn} />
      ) : (
        <Pressable
          onPress={onEnd}
          style={styles.navBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="End game"
        >
          <Text style={styles.navEnd}>End</Text>
        </Pressable>
      )}
    </View>
  );
}

function CountdownStage({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  const doneRef = React.useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (n <= 1) {
        if (!doneRef.current) {
          doneRef.current = true;
          onDone();
        }
        return;
      }
      setN((v) => v - 1);
    }, 800);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <View style={styles.centerFill}>
      <Text style={styles.countdownNum}>{n}</Text>
      <Text style={styles.hintLine}>Put it on your forehead</Text>
    </View>
  );
}

export function PlayScreen() {
  const { state, dispatch } = useGameStore();
  usePlayOrientation(state.phase);

  const guesser = getGuesser(state);
  const partner = getPartner(state);
  const prompt = getCurrentPrompt(state);
  const last = isLastGuesserOfNight(state);
  const upcoming = nextGuesser(state);

  const handleTick = useCallback(() => dispatch({ type: 'TIMER_TICK' }), [dispatch]);
  const handleTimeUp = useCallback(() => dispatch({ type: 'TIME_UP' }), [dispatch]);
  const handleCorrect = useCallback(() => dispatch({ type: 'MARK_CORRECT' }), [dispatch]);
  const handleSkip = useCallback(() => dispatch({ type: 'MARK_SKIP' }), [dispatch]);
  const handleCountdownDone = useCallback(() => dispatch({ type: 'COUNTDOWN_DONE' }), [dispatch]);
  const endSession = useCallback(() => dispatch({ type: 'END_SESSION' }), [dispatch]);

  const handleEndGame = useCallback(() => {
    if (state.phase === 'winner' || !nightHasProgress(state)) {
      endSession();
      return;
    }
    confirmEndGame(endSession);
  }, [endSession, state]);

  const handleBack = useCallback(() => {
    if (state.phase === 'countdown') {
      dispatch({ type: 'CANCEL_COUNTDOWN' });
      return;
    }
    if (state.phase === 'winner' || !nightHasProgress(state)) {
      endSession();
      return;
    }
    confirmEndGame(endSession);
  }, [dispatch, endSession, state]);

  useForeheadTilt(state.phase === 'playing', handleCorrect, handleSkip);

  useEffect(() => {
    if (state.phase !== 'ready') return;
    void Accelerometer.requestPermissionsAsync();
  }, [state.phase]);

  const wordSize = !prompt ? 48 : prompt.answer.length > 18 ? 36 : prompt.answer.length > 10 ? 48 : 64;

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
        <PlayNav phase={state.phase} onBack={handleBack} onEnd={handleEndGame} />

        {state.phase === 'ready' ? (
          <View style={styles.centerFill}>
            <Text style={styles.kicker}>YOU'RE UP</Text>
            <Text style={styles.heroName}>{guesser?.name ?? 'Player'}</Text>
            <Text style={styles.readyBody}>
              Hold the phone to your forehead, screen facing {partner?.name ?? 'your partner'}.
            </Text>
            <Text style={styles.readyBody}>
              {partner?.name ?? 'Your partner'} gives the clues. You tilt down for correct, up to skip.
            </Text>
            <NeonButton title="I'M READY" onPress={() => dispatch({ type: 'START_COUNTDOWN' })} variant="gradient" />
          </View>
        ) : null}

        {state.phase === 'countdown' ? (
          <CountdownStage onDone={handleCountdownDone} />
        ) : null}

        {state.phase === 'playing' ? (
          <View style={styles.playFill}>
            <View style={styles.playTop}>
              <CountdownTimer
                remainingSeconds={state.remainingSeconds}
                isActive
                onTick={handleTick}
                onTimeUp={handleTimeUp}
                totalSeconds={state.roundDurationSec}
              />
              <View>
                <Text style={styles.miniStat}>CORRECT {getTurnCorrectCount(state)}</Text>
                <Text style={styles.miniStatMuted}>SKIP {getTurnSkipCount(state)}</Text>
              </View>
            </View>
            <Text style={styles.secretLabel}>LOOK THIS WAY</Text>
            <Text style={[styles.secretWord, { fontSize: wordSize }]}>{prompt?.answer ?? '—'}</Text>
            <Text style={styles.hintLine}>Tilt DOWN correct. Tilt UP skip.</Text>
            <View style={styles.fallbackRow}>
              <Pressable onPress={handleSkip} style={styles.fallbackBtn} accessibilityLabel="Skip">
                <Icon name="arrow-up" size={12} color={neon.textMuted} solid />
                <Text style={styles.fallbackText}>SKIP</Text>
              </Pressable>
              <Pressable onPress={handleCorrect} style={styles.fallbackBtn} accessibilityLabel="Correct">
                <Icon name="arrow-down" size={12} color={neon.textMuted} solid />
                <Text style={styles.fallbackText}>CORRECT</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {state.phase === 'turnRecap' ? (
          <ScrollView contentContainerStyle={styles.summaryBlock} showsVerticalScrollIndicator={false}>
            <Text style={styles.summaryHero}>TIME'S UP</Text>
            <Text style={styles.summarySub}>{guesser?.name ?? 'Player'} scored {getTurnCorrectCount(state)}</Text>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsPillLabel}>THIS PAIR</Text>
              <Text style={styles.pointsPillValue}>{getCurrentTeamScore(state)}</Text>
            </View>
            <View style={styles.listCard}>
              {state.turnResults.length === 0 ? (
                <Text style={styles.listName}>No cards this turn</Text>
              ) : (
                state.turnResults.map((row, idx) => (
                  <View
                    key={`${row.prompt.id}-${idx}`}
                    style={[styles.listRow, idx === state.turnResults.length - 1 && styles.listRowLast]}
                  >
                    <Text style={styles.listName}>{row.prompt.answer}</Text>
                    <Text style={[styles.listPoints, row.result === 'skip' && styles.listSkip]}>
                      {row.result === 'correct' ? 'YES' : 'SKIP'}
                    </Text>
                  </View>
                ))
              )}
            </View>
            <NeonButton
              title={
                last
                  ? 'SEE THE WINNER'
                  : `PASS TO ${upcoming?.name.toUpperCase() ?? 'NEXT'}`
              }
              onPress={() => dispatch({ type: 'ADVANCE_AFTER_RECAP' })}
              variant="gradient"
            />
            <Pressable onPress={handleEndGame} style={styles.ghostBtn} accessibilityRole="button">
              <Text style={styles.ghostBtnText}>End game</Text>
            </Pressable>
          </ScrollView>
        ) : null}

        {state.phase === 'winner' ? (
          <ScrollView contentContainerStyle={styles.summaryBlock} showsVerticalScrollIndicator={false}>
            <Text style={styles.summaryHero}>
              {getWinningTeams(state).length > 1 ? 'DRAW' : 'WINNERS'}
            </Text>
            {getWinningTeams(state).map((team) => (
              <Text key={team.id} style={styles.winnerNames}>
                {teamLabel(state, team)}
              </Text>
            ))}
            <View style={styles.listCard}>
              {state.teams.map((team, idx) => (
                <View
                  key={team.id}
                  style={[styles.listRow, idx === state.teams.length - 1 && styles.listRowLast]}
                >
                  <Text style={styles.listName}>{teamLabel(state, team)}</Text>
                  <Text style={styles.listPoints}>{team.score}</Text>
                </View>
              ))}
            </View>
            <NeonButton
              title="PLAY ANOTHER ROUND"
              onPress={() => dispatch({ type: 'PLAY_ANOTHER_ROUND' })}
              variant="gradient"
            />
            <NeonButton title="CHANGE CATEGORY" onPress={() => dispatch({ type: 'END_SESSION' })} variant="outline" />
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

function getCurrentTeamScore(state: Parameters<typeof getTurnCorrectCount>[0]): number {
  return state.teams[state.currentTeamIndex]?.score ?? 0;
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: neon.bg,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  playNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 44,
  },
  navBtn: {
    minWidth: 56,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogo: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    color: neon.magenta,
  },
  navEnd: {
    fontSize: 14,
    fontWeight: '800',
    color: neon.danger,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 12,
  },
  playFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
    color: neon.cyan,
    letterSpacing: 3,
  },
  heroName: {
    fontSize: 44,
    fontWeight: '900',
    color: neon.text,
    textAlign: 'center',
  },
  readyBody: {
    fontSize: 16,
    fontWeight: '600',
    color: neon.textSoft,
    textAlign: 'center',
    lineHeight: 24,
  },
  countdownNum: {
    fontSize: 120,
    fontWeight: '900',
    color: light.gold,
  },
  secretLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: neon.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  secretWord: {
    fontWeight: '900',
    color: neon.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  hintLine: {
    fontSize: 14,
    fontWeight: '600',
    color: neon.textSoft,
    textAlign: 'center',
  },
  miniStat: {
    fontSize: 16,
    fontWeight: '800',
    color: neon.magenta,
    textAlign: 'right',
  },
  miniStatMuted: {
    fontSize: 14,
    fontWeight: '700',
    color: neon.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  fallbackRow: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    opacity: 0.55,
  },
  fallbackText: {
    color: neon.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ctOuter: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    minHeight: 62,
    alignSelf: 'stretch',
  },
  ctGradient: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#320B4E',
    letterSpacing: 1.1,
  },
  outlineBtn: {
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: light.oliveTitle,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    backgroundColor: neon.bgCardLift,
    minHeight: 62,
    alignSelf: 'stretch',
  },
  outlineBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: light.oliveTitle,
    letterSpacing: 1.1,
  },
  ghostBtn: {
    paddingVertical: 14,
  },
  ghostBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: neon.textMuted,
  },
  summaryBlock: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
    flexGrow: 1,
  },
  summaryHero: {
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    color: light.gold,
    textAlign: 'center',
  },
  summarySub: {
    fontSize: 16,
    fontWeight: '700',
    color: neon.cyan,
    textAlign: 'center',
  },
  winnerNames: {
    fontSize: 22,
    fontWeight: '800',
    color: neon.text,
    textAlign: 'center',
  },
  pointsPill: {
    width: '100%',
    backgroundColor: neon.bgCardLift,
    borderRadius: radii.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pointsPillLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: neon.textMuted,
    letterSpacing: 2,
    marginBottom: 6,
  },
  pointsPillValue: {
    fontSize: 40,
    fontWeight: '900',
    color: neon.text,
  },
  listCard: {
    width: '100%',
    backgroundColor: neon.bgCardLift,
    borderRadius: radii.card,
    padding: 16,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  listRowLast: {
    borderBottomWidth: 0,
  },
  listName: {
    fontSize: 15,
    fontWeight: '700',
    color: neon.text,
    flex: 1,
  },
  listPoints: {
    fontSize: 16,
    fontWeight: '900',
    color: neon.cyan,
  },
  listSkip: {
    color: neon.textMuted,
  },
});
