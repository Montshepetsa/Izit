import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/atoms/Icon';
import { LottieIcon } from '../components/atoms/LottieIcon';
import { PaperButton } from '../components/atoms/PaperButton';
import {
  DECK_CATEGORIES,
  getPlayableCategories,
  getPromptDeck,
  isDeckReady,
  type DeckCategory,
} from '../data/prompts';
import { useGameStore } from '../state/gameStore';
import { MAX_PLAYERS, MIN_PLAYERS } from '../state/gameTypes';
import { fonts, paper } from '../theme/paper';

const DECK_TINT: Record<DeckCategory, string> = {
  Food: paper.red,
  Drinks: paper.yellow,
  Places: paper.blue,
  People: paper.yellow,
  Slang: paper.green,
  Sport: paper.blue,
  Cars: paper.red,
  Artists: paper.green,
  Songs: paper.blue,
};

const DECK_IMAGES: Record<DeckCategory, number> = {
  Food: require('../../assets/decks/food.png'),
  Drinks: require('../../assets/decks/drinks.png'),
  Places: require('../../assets/decks/places.png'),
  People: require('../../assets/decks/people.png'),
  Slang: require('../../assets/decks/slang.png'),
  Sport: require('../../assets/decks/sport.png'),
  Cars: require('../../assets/decks/cars.png'),
  Artists: require('../../assets/decks/artists.png'),
  Songs: require('../../assets/decks/songs.png'),
};

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
        style={({ pressed }) => [styles.stepperBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Fewer players"
      >
        <Icon name="minus" size={16} color={paper.white} solid />
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + step))}
        style={({ pressed }) => [styles.stepperBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="More players"
      >
        <Icon name="plus" size={16} color={paper.white} solid />
      </Pressable>
    </View>
  );
}

export function SetupScreen({ onBack }: { onBack?: () => void }) {
  const { state, dispatch } = useGameStore();
  const insets = useSafeAreaInsets();
  const playable = useMemo(() => getPlayableCategories(), []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(playable[0] ?? null);

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
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.topRow}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.iconHit} accessibilityRole="button" accessibilityLabel="Back">
              <Icon name="arrow-left" size={18} color={paper.ink} solid />
            </Pressable>
          ) : (
            <View style={styles.iconHit} />
          )}
          <View style={styles.brandRow}>
            <Text style={styles.wordmark}>Izit</Text>
            <LottieIcon name="trophy" size={32} />
          </View>
          <View style={styles.iconHit} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Challenge the room. One phone, pairs of two, forehead out. Only your partner clues.
          </Text>

          <Text style={styles.sectionLabel}>Popular deck</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deckRow}>
            {DECK_CATEGORIES.map((category) => {
              const ready = isDeckReady(category);
              const active = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  disabled={!ready}
                  onPress={() => setSelectedCategory(category)}
                  accessibilityRole="button"
                  accessibilityLabel={ready ? `${category}, ready` : `${category}, coming soon`}
                  accessibilityState={{ disabled: !ready, selected: active && ready }}
                  style={[
                    styles.deckCard,
                    { backgroundColor: DECK_TINT[category] },
                    active && ready && styles.deckActive,
                  ]}
                >
                  <Image
                    source={DECK_IMAGES[category]}
                    style={[styles.deckImage, !ready && styles.deckImageMuted]}
                    resizeMode="cover"
                    accessible={false}
                    importantForAccessibility="no"
                  />
                  <LinearGradient
                    colors={['rgba(17,17,17,0.12)', 'rgba(17,17,17,0.28)', 'rgba(17,17,17,0.78)']}
                    locations={[0, 0.45, 1]}
                    style={styles.deckScrim}
                  />
                  {!ready ? <View pointerEvents="none" style={styles.deckLockedWash} /> : null}
                  <View pointerEvents="none" style={styles.deckCopy}>
                    <Text style={styles.deckTag}>{ready ? 'Ready' : 'Soon'}</Text>
                    <Text style={styles.deckTitle}>{category}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Room</Text>
            <View style={styles.ratingRow}>
              {(['family', 'afterDark'] as const).map((rating) => {
                const active = state.rating === rating;
                return (
                  <Pressable
                    key={rating}
                    onPress={() => dispatch({ type: 'SET_RATING', rating })}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.ratingPill, active && styles.ratingPillActive]}
                  >
                    <Text style={[styles.ratingText, active && styles.ratingTextActive]}>
                      {rating === 'family' ? 'Family' : 'After Dark'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Players</Text>
            <Stepper
              value={state.players.length}
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              step={2}
              onChange={(count) => dispatch({ type: 'SET_PLAYER_COUNT', count })}
            />
            {state.players.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <Text style={styles.playerLabel}>{index + 1}</Text>
                <TextInput
                  value={player.name}
                  onChangeText={(name) => dispatch({ type: 'UPDATE_PLAYER_NAME', playerIndex: index, name })}
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="off"
                  accessibilityLabel={`Player ${index + 1} name`}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor={paper.inkSoft}
                />
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Pairs</Text>
            {teams.map((team, idx) => (
              <View key={`team-${idx}`} style={styles.pairRow}>
                <View style={[styles.pairDot, { backgroundColor: idx % 2 === 0 ? paper.yellow : paper.blue }]} />
                <Text style={styles.pairLine} numberOfLines={1}>
                  {team.a} + {team.b}
                </Text>
              </View>
            ))}
            <Text style={styles.help}>1 with 2, 3 with 4. Rename people to sit together.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <View style={[styles.bottomDock, { bottom: Math.max(insets.bottom, 16) }]}>
        <PaperButton
          title="Play"
          disabled={!canStart}
          onPress={() => {
            if (!selectedCategory) return;
            dispatch({
              type: 'START_NIGHT',
              category: selectedCategory,
              promptDeck: getPromptDeck(selectedCategory, state.rating),
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: paper.cream,
  },
  safe: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  iconHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: paper.ink,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  intro: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: paper.inkSoft,
    lineHeight: 22,
    marginBottom: 18,
  },
  sectionLabel: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: paper.ink,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  deckRow: {
    gap: 12,
    paddingBottom: 6,
    marginBottom: 16,
  },
  deckCard: {
    width: 168,
    height: 168,
    borderRadius: paper.radii.card,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  deckImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  deckImageMuted: {
    opacity: 0.72,
  },
  deckScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  deckLockedWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(243,239,230,0.38)',
  },
  deckActive: {
    borderColor: paper.ink,
  },
  deckCopy: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  deckTag: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: paper.white,
    backgroundColor: 'rgba(17,17,17,0.55)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  deckTitle: {
    fontFamily: fonts.displayUp,
    fontSize: 26,
    color: paper.white,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  card: {
    backgroundColor: paper.card,
    borderRadius: paper.radii.card,
    padding: 16,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingPill: {
    flex: 1,
    minHeight: 44,
    borderRadius: paper.radii.pill,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: paper.creamDeep,
  },
  ratingPillActive: {
    backgroundColor: paper.ink,
  },
  ratingText: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: paper.ink,
  },
  ratingTextActive: {
    color: paper.white,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: paper.ink,
  },
  stepperValue: {
    fontFamily: fonts.displayUp,
    fontSize: 28,
    color: paper.ink,
    minWidth: 40,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  playerLabel: {
    width: 22,
    fontFamily: fonts.label,
    fontSize: 13,
    color: paper.inkSoft,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: paper.cream,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: paper.radii.sm,
    fontFamily: fonts.body,
    fontSize: 15,
    color: paper.ink,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  pairDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pairLine: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: paper.ink,
  },
  help: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: paper.inkSoft,
    marginTop: 4,
  },
  bottomDock: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: paper.ink,
    borderRadius: paper.radii.pill,
    shadowColor: paper.ink,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
