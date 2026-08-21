import React from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfettiField } from '../components/atoms/ConfettiField';
import { LottieIcon } from '../components/atoms/LottieIcon';
import { PaperButton } from '../components/atoms/PaperButton';
import { useBob, useFadeRise } from '../motion/useFadeRise';
import { fonts, paper } from '../theme/paper';

export function LandingScreen({ onStart }: { onStart: () => void }) {
  const brand = useFadeRise(0);
  const collage = useFadeRise(90);
  const copy = useFadeRise(180);
  const cta = useFadeRise(280);
  const bob = useBob(10, 2400);

  return (
    <View style={styles.shell}>
      <ConfettiField />
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safe}>
        <View style={styles.body}>
          <Animated.View
            style={[styles.brandRow, { opacity: brand.opacity, transform: [{ translateY: brand.translateY }] }]}
          >
            <Text style={styles.wordmark}>Izit</Text>
            <LottieIcon name="trophy" size={42} />
          </Animated.View>

          <Animated.View
            style={[
              styles.collageWrap,
              { opacity: collage.opacity, transform: [{ translateY: Animated.add(collage.translateY, bob) }] },
            ]}
          >
            <View style={styles.geoYellow} />
            <View style={styles.geoRed} />
            <View style={styles.geoBlue} />
            <Image
              source={require('../../assets/landing-collage.png')}
              style={styles.collage}
              resizeMode="cover"
              accessible={false}
              importantForAccessibility="no"
            />
            <LottieIcon name="spark" size={88} style={styles.spark} />
          </Animated.View>

          <Animated.View style={{ opacity: copy.opacity, transform: [{ translateY: copy.translateY }] }}>
            <Text style={styles.headline}>Phone on the forehead.{'\n'}Prove you know the flavour.</Text>
            <Text style={styles.sub}>
              Pairs of two. Partner clues. Tilt down when you get it, up to skip. First night to a winning pair.
            </Text>
          </Animated.View>
        </View>
        <Animated.View style={{ opacity: cta.opacity, transform: [{ translateY: cta.translateY }] }}>
          <PaperButton title="Get started" onPress={onStart} />
        </Animated.View>
      </SafeAreaView>
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
    paddingHorizontal: 22,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
    paddingTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: paper.ink,
    lineHeight: 56,
  },
  collageWrap: {
    alignSelf: 'center',
    width: 280,
    height: 280,
    marginVertical: 12,
  },
  collage: {
    width: 220,
    height: 220,
    borderRadius: 28,
    position: 'absolute',
    left: 30,
    top: 30,
  },
  geoYellow: {
    position: 'absolute',
    width: 86,
    height: 28,
    backgroundColor: paper.yellow,
    borderRadius: 6,
    top: 18,
    left: 8,
    transform: [{ rotate: '-11deg' }],
  },
  geoRed: {
    position: 'absolute',
    width: 36,
    height: 36,
    backgroundColor: paper.red,
    borderRadius: 8,
    top: 8,
    right: 18,
    transform: [{ rotate: '16deg' }],
  },
  geoBlue: {
    position: 'absolute',
    width: 64,
    height: 22,
    backgroundColor: paper.blue,
    borderRadius: 6,
    bottom: 16,
    right: 10,
    transform: [{ rotate: '-8deg' }],
  },
  spark: {
    position: 'absolute',
    right: -8,
    bottom: 8,
  },
  headline: {
    fontFamily: fonts.displayUp,
    fontSize: 28,
    color: paper.ink,
    lineHeight: 34,
    marginTop: 10,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: paper.inkSoft,
    lineHeight: 22,
    marginTop: 10,
  },
});
