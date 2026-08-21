import { Accelerometer } from 'expo-sensors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CountdownTimer } from '../components/atoms/CountdownTimer';
import { Icon } from '../components/atoms/Icon';
import { LottieIcon } from '../components/atoms/LottieIcon';
import { PaperButton } from '../components/atoms/PaperButton';
import { useForeheadTilt } from '../hooks/useForeheadTilt';
import { useGameSounds } from '../hooks/useGameSounds';
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
import { fonts, paper } from '../theme/paper';

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
        <Icon name="arrow-left" size={18} color={paper.ink} solid />
      </Pressable>
      <View style={styles.navBrand}>
        <Text style={styles.navLogo}>Izit</Text>
        <LottieIcon name="trophy" size={28} />
      </View>
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

function CountdownStage({ onDone, onBeat }: { onDone: () => void; onBeat: (n: number) => void }) {
  const [n, setN] = useState(3);
  const doneRef = React.useRef(false);
  const scale = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    onBeat(n);
  }, [n, onBeat]);

  useEffect(() => {
    scale.setValue(0.55);
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }).start();
  }, [n, scale]);

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
      <Animated.Text style={[styles.countdownNum, { transform: [{ scale }] }]}>{n}</Animated.Text>
      <Text style={styles.hintLine}>Put it on your forehead</Text>
    </View>
  );
}

function SecretWord({ text, size }: { text: string; size: number }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(text);

  useEffect(() => {
    if (prev.current === text) return;
    prev.current = text;
    opacity.setValue(0);
    scale.setValue(0.92);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale, text]);

  return (
    <Animated.Text style={[styles.secretWord, { fontSize: size, opacity, transform: [{ scale }] }]}>
      {text}
    </Animated.Text>
  );
}

export function PlayScreen() {
  const { state, dispatch } = useGameStore();
  usePlayOrientation(state.phase);
  const { playCorrect, playSkip, playCountdownTick } = useGameSounds();
  const [flash, setFlash] = useState<'correct' | 'skip' | null>(null);

  const guesser = getGuesser(state);
  const partner = getPartner(state);
  const prompt = getCurrentPrompt(state);
  const last = isLastGuesserOfNight(state);
  const upcoming = nextGuesser(state);
  const winners = state.phase === 'winner' ? getWinningTeams(state) : [];

  const handleTick = useCallback(() => dispatch({ type: 'TIMER_TICK' }), [dispatch]);
  const handleTimeUp = useCallback(() => dispatch({ type: 'TIME_UP' }), [dispatch]);
  const handleCorrect = useCallback(() => {
    playCorrect();
    setFlash('correct');
    dispatch({ type: 'MARK_CORRECT' });
  }, [dispatch, playCorrect]);
  const handleSkip = useCallback(() => {
    playSkip();
    setFlash('skip');
    dispatch({ type: 'MARK_SKIP' });
  }, [dispatch, playSkip]);
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

  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(null), 480);
    return () => clearTimeout(t);
  }, [flash]);

  const wordSize = !prompt ? 48 : prompt.answer.length > 18 ? 36 : prompt.answer.length > 10 ? 48 : 64;
  const ranked = [...state.teams].sort((a, b) => b.score - a.score);

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
        <PlayNav phase={state.phase} onBack={handleBack} onEnd={handleEndGame} />

        {state.phase === 'ready' ? (
          <View style={styles.centerFill}>
            <LottieIcon name="spark" size={92} />
            <Text style={styles.kicker}>You're up</Text>
            <Text style={styles.heroName}>{guesser?.name ?? 'Player'}</Text>
            <Text style={styles.readyBody}>
              Hold the phone to your forehead, screen facing {partner?.name ?? 'your partner'}.
            </Text>
            <Text style={styles.readyBody}>
              {partner?.name ?? 'Your partner'} gives the clues. Tilt down for correct, up to skip.
            </Text>
            <PaperButton title="I'm ready" onPress={() => dispatch({ type: 'START_COUNTDOWN' })} />
          </View>
        ) : null}

        {state.phase === 'countdown' ? (
          <CountdownStage onDone={handleCountdownDone} onBeat={playCountdownTick} />
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
                <Text style={styles.miniStat}>Correct {getTurnCorrectCount(state)}</Text>
                <Text style={styles.miniStatMuted}>Skip {getTurnSkipCount(state)}</Text>
              </View>
            </View>
            <Text style={styles.secretLabel}>Look this way</Text>
            <SecretWord text={prompt?.answer ?? '—'} size={wordSize} />
            <Text style={styles.hintLine}>Tilt DOWN correct. Tilt UP skip.</Text>
            {flash ? (
              <View pointerEvents="none" style={styles.flash}>
                <LottieIcon name={flash === 'correct' ? 'check' : 'skip'} size={140} loop={false} />
              </View>
            ) : null}
            <View style={styles.fallbackRow}>
              <Pressable onPress={handleSkip} style={styles.fallbackBtn} accessibilityLabel="Skip">
                <Icon name="arrow-up" size={12} color={paper.inkSoft} solid />
                <Text style={styles.fallbackText}>Skip</Text>
              </Pressable>
              <Pressable onPress={handleCorrect} style={styles.fallbackBtn} accessibilityLabel="Correct">
                <Icon name="arrow-down" size={12} color={paper.inkSoft} solid />
                <Text style={styles.fallbackText}>Correct</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {state.phase === 'turnRecap' ? (
          <ScrollView contentContainerStyle={styles.summaryBlock} showsVerticalScrollIndicator={false}>
            <LottieIcon name="trophy" size={56} />
            <Text style={styles.summaryHero}>Time's up</Text>
            <Text style={styles.summarySub}>
              {guesser?.name ?? 'Player'} scored {getTurnCorrectCount(state)}
            </Text>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsPillLabel}>This pair</Text>
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
                      {row.result === 'correct' ? 'Yes' : 'Skip'}
                    </Text>
                  </View>
                ))
              )}
            </View>
            <PaperButton
              title={last ? 'See the winner' : `Pass to ${upcoming?.name ?? 'next'}`}
              onPress={() => dispatch({ type: 'ADVANCE_AFTER_RECAP' })}
            />
            <Pressable onPress={handleEndGame} style={styles.ghostBtn} accessibilityRole="button">
              <Text style={styles.ghostBtnText}>End game</Text>
            </Pressable>
          </ScrollView>
        ) : null}

        {state.phase === 'winner' ? (
          <ScrollView contentContainerStyle={styles.summaryBlock} showsVerticalScrollIndicator={false}>
            <LottieIcon name="trophy" size={72} />
            <Text style={styles.summaryHero}>{winners.length > 1 ? 'Draw' : 'Winners'}</Text>
            {winners.map((team) => (
              <Text key={team.id} style={styles.winnerNames}>
                {teamLabel(state, team)}
              </Text>
            ))}
            <View style={styles.podium}>
              {ranked.map((team, idx) => (
                <View key={team.id} style={styles.podiumItem}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: idx === 0 ? paper.yellow : idx === 1 ? paper.blue : paper.red },
                    ]}
                  >
                    <Text style={styles.avatarText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.podiumName}>{teamLabel(state, team)}</Text>
                  <Text style={styles.podiumScore}>{team.score}</Text>
                </View>
              ))}
            </View>
            <PaperButton title="Play another round" onPress={() => dispatch({ type: 'PLAY_ANOTHER_ROUND' })} />
            <PaperButton title="Change category" onPress={() => dispatch({ type: 'END_SESSION' })} variant="ghost" />
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
    backgroundColor: paper.cream,
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
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navLogo: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: paper.ink,
  },
  navEnd: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: paper.danger,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
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
    fontFamily: fonts.label,
    fontSize: 13,
    color: paper.inkSoft,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  heroName: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: paper.ink,
    textAlign: 'center',
  },
  readyBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: paper.inkSoft,
    textAlign: 'center',
    lineHeight: 24,
  },
  countdownNum: {
    fontFamily: fonts.display,
    fontSize: 128,
    color: paper.ink,
  },
  secretLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: paper.inkSoft,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  secretWord: {
    fontFamily: fonts.displayUp,
    color: paper.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  hintLine: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: paper.inkSoft,
    textAlign: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.42,
  },
  miniStat: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: paper.red,
    textAlign: 'right',
  },
  miniStatMuted: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: paper.inkSoft,
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
    opacity: 0.7,
  },
  fallbackText: {
    color: paper.inkSoft,
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  ghostBtn: {
    paddingVertical: 14,
  },
  ghostBtnText: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: paper.inkSoft,
  },
  summaryBlock: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
    flexGrow: 1,
  },
  summaryHero: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: paper.ink,
    textAlign: 'center',
  },
  summarySub: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: paper.inkSoft,
    textAlign: 'center',
  },
  winnerNames: {
    fontFamily: fonts.displayUp,
    fontSize: 22,
    color: paper.ink,
    textAlign: 'center',
  },
  pointsPill: {
    width: '100%',
    backgroundColor: paper.card,
    borderRadius: paper.radii.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pointsPillLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: paper.inkSoft,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pointsPillValue: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: paper.ink,
  },
  listCard: {
    width: '100%',
    backgroundColor: paper.card,
    borderRadius: paper.radii.card,
    padding: 16,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: paper.creamDeep,
    gap: 12,
  },
  listRowLast: {
    borderBottomWidth: 0,
  },
  listName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: paper.ink,
    flex: 1,
  },
  listPoints: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: paper.green,
  },
  listSkip: {
    color: paper.inkSoft,
  },
  podium: {
    width: '100%',
    gap: 10,
  },
  podiumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: paper.card,
    borderRadius: paper.radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: paper.ink,
  },
  podiumName: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: paper.ink,
  },
  podiumScore: {
    fontFamily: fonts.displayUp,
    fontSize: 20,
    color: paper.ink,
  },
});
