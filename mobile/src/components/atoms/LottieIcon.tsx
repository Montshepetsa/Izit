import LottieView from 'lottie-react-native';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

const sources = {
  trophy: require('../../../assets/lottie/trophy.json'),
  check: require('../../../assets/lottie/check.json'),
  skip: require('../../../assets/lottie/skip.json'),
  spark: require('../../../assets/lottie/spark.json'),
} as const;

export type LottieName = keyof typeof sources;

export function LottieIcon({
  name,
  size = 40,
  loop = true,
  autoPlay = true,
  style,
}: {
  name: LottieName;
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LottieView
      source={sources[name]}
      autoPlay={autoPlay}
      loop={loop}
      style={[{ width: size, height: size }, style]}
    />
  );
}
