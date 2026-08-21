import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useFadeRise(delayMs = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay: delayMs,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: delayMs,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delayMs, opacity, translateY]);

  return { opacity, translateY };
}

export function useBob(distance = 8, duration = 2200) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, duration]);

  const translateY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distance],
  });

  return translateY;
}
