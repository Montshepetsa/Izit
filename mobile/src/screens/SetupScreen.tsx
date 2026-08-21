import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/atoms/Icon';
import { getPlayableCategories, getPromptDeck } from '../data/prompts';
import { useGameStore } from '../state/gameStore';
import { MAX_PLAYERS, MIN_PLAYERS } from '../state/gameTypes';
import { bankTheme } from '../theme/bankTheme';
import { typography } from '../theme/typography';

function Stepper({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - step))}
        style={({ pressed }) => [styles.stepperBtn, pressed ? styles.stepperBtnPressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Icon name="minus" size={18} color="#FFFFFF" solid />
      </Pressable>
      <View style={styles.stepperValueWrap}>
        <Text style={styles.stepperValue}>{value}</Text>
      </View>
      <Pressable
        onPress={() => onChange(Math.min(max, value + step))}
        style={({ pressed }) => [styles.stepperBtn, pressed ? styles.stepperBtnPressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Icon name="plus" size={18} color="#FFFFFF" solid />
      </Pressable>
    </View>
  );
}

export function SetupScreen() {
  const { state, dispatch } = useGameStore();
  const categories = useMemo(() => getPlayableCategories(), []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categories[0] ?? null);

  const namesReady = state.players.every((p) => p.name.trim().length > 0);
  const canStart = Boolean(selectedCategory) && namesReady && state.players.length >= MIN_PLAYERS;

  const teams = useMemo(() => {
    const rows: { a: string; b: string }[] = [];
    for (let i = 0; i + 1 < state.players.length; i += 2) {
      rows.push({
        a: state.players[i]?.name.trim() || `Player ${i + 1}`,
        b: state.players[i + 1]?.name.trim() || `Player ${i + 2}`,
      });
    }
    return rows;
  }, [state.players]);

  return (
    <View style={styles.shell}>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeTop}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.topLogo, typography.headline]}>IZIT!</Text>
          <Text style={styles.heroTag}>Heads Up. Phone on the forehead. Partner clues. Tilt to score.</Text>

          <View style={styles.playWrap}>
            <Pressable
              disabled={!canStart}
              onPress={() => {
                if (!selectedCategory) return;
                dispatch({
                  type: 'START_NIGHT',
                  category: selectedCategory,
                  promptDeck: getPromptDeck(selectedCategory, state.rating),
                });
              }}
              style={({ pressed }) => [
                styles.playOuter,
                !canStart && styles.playDisabled,
                pressed && canStart && { transform: [{ scale: 0.98 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Start game"
            >
              <LinearGradient
                colors={bankTheme.ctaGradient as [string, string]}
                style={styles.playGrad}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
              >
                <Icon name="play" size={28} color={bankTheme.onPrimary} solid style={styles.playIcon} />
                <Text style={styles.playWord}>PLAY</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Room</Text>
            <View style={styles.ratingRow}>
              {(['family', 'afterDark'] as const).map((rating) => {
                const active = state.rating === rating;
                return (
                  <Pressable
                    key={rating}
                    onPress={() => dispatch({ type: 'SET_RATING', rating })}
                    style={[styles.ratingPill, active && styles.ratingPillActive]}
                  >
                    <Text style={[styles.ratingText, active && styles.ratingTextActive]}>
                      {rating === 'family' ? 'Family' : 'After Dark'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.helpText}>
              Family is clean. After Dark adds the drinking cards on top.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryWrap}>
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={({ pressed }) => [
                      styles.categoryPill,
                      isActive ? styles.categoryPillActive : null,
                      pressed ? styles.categoryPillPressed : null,
                    ]}
                  >
                    <Text style={[styles.categoryPillText, isActive ? styles.categoryPillTextActive : null]}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.helpText}>More decks show up once they have enough cards.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Players (pairs of two)</Text>
            <Stepper
              value={state.players.length}
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              step={2}
              onChange={(count) => dispatch({ type: 'SET_PLAYER_COUNT', count })}
            />
            <View style={styles.playerInputs}>
              {state.players.map((player, index) => (
                <View key={player.id} style={styles.playerRow}>
                  <Text style={styles.playerLabel}>{index + 1}</Text>
                  <TextInput
                    value={player.name}
                    onChangeText={(name) =>
                      dispatch({ type: 'UPDATE_PLAYER_NAME', playerIndex: index, name })
                    }
                    style={styles.input}
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor={bankTheme.onSurfaceVariant}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Pairs</Text>
            {teams.map((team, idx) => (
              <Text key={`team-${idx}`} style={styles.pairLine}>
                Team {idx + 1}: {team.a} + {team.b}
              </Text>
            ))}
            <Text style={styles.helpText}>
              Only your partner clues. Rename people to change who sits together. 1 with 2, 3 with 4.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: bankTheme.background,
  },
  safeTop: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  topLogo: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: bankTheme.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  heroTag: {
    fontSize: 14,
    fontWeight: '400',
    color: bankTheme.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  playWrap: {
    alignItems: 'center',
    marginVertical: 18,
  },
  playOuter: {
    shadowColor: bankTheme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 14,
  },
  playDisabled: {
    opacity: 0.5,
  },
  playGrad: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  playIcon: {
    marginBottom: 4,
    marginLeft: 4,
  },
  playWord: {
    color: bankTheme.onPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  section: {
    backgroundColor: bankTheme.surfaceContainerLowest,
    borderRadius: bankTheme.radii.lg,
    padding: bankTheme.spacing.card,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: bankTheme.onSurface,
    marginBottom: 10,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 14,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  stepperBtnPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#1d4ed8',
  },
  stepperValueWrap: {
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 28,
    fontWeight: '700',
    color: bankTheme.onSurface,
  },
  helpText: {
    fontSize: 12,
    fontWeight: '400',
    color: bankTheme.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 10,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: bankTheme.surfaceContainerLow,
  },
  categoryPillActive: {
    backgroundColor: bankTheme.primary,
  },
  categoryPillPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: bankTheme.onSurface,
  },
  categoryPillTextActive: {
    color: bankTheme.onPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingPill: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: bankTheme.surfaceContainerLow,
  },
  ratingPillActive: {
    backgroundColor: bankTheme.primary,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: bankTheme.onSurface,
  },
  ratingTextActive: {
    color: bankTheme.onPrimary,
  },
  playerInputs: {
    gap: 10,
    marginTop: 6,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerLabel: {
    width: 24,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    color: bankTheme.onSurface,
  },
  input: {
    flex: 1,
    backgroundColor: bankTheme.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: bankTheme.radii.md,
    borderWidth: 1,
    borderColor: bankTheme.outlineVariant,
    fontSize: 14,
    fontWeight: '400',
    color: bankTheme.onSurface,
  },
  pairLine: {
    fontSize: 15,
    fontWeight: '700',
    color: bankTheme.onSurface,
    marginBottom: 6,
  },
});
