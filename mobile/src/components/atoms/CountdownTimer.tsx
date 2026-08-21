import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { neon } from '../../theme/izitTheme';

type CountdownTimerProps = {
  remainingSeconds: number;
  isActive: boolean;
  onTick: () => void;
  onTimeUp: () => void;
  /** When set, renders Electric Sunset circular ring; progress = remaining / total */
  totalSeconds?: number;
};

export function CountdownTimer({
  remainingSeconds,
  isActive,
  onTick,
  onTimeUp,
  totalSeconds,
}: CountdownTimerProps) {
  useEffect(() => {
    if (!isActive) return;

    if (remainingSeconds <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      if (remainingSeconds <= 1) {
        clearInterval(intervalId);
        onTimeUp();
        return;
      }
      onTick();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, remainingSeconds, onTick, onTimeUp]);

  const safeRemain = Math.max(0, remainingSeconds);
  const total = totalSeconds && totalSeconds > 0 ? totalSeconds : 1;
  const progress = useMemo(() => Math.min(1, safeRemain / total), [safeRemain, total]);

  const size = 132;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - progress);

  if (totalSeconds != null) {
    return (
      <View style={styles.ringWrap}>
        <Svg width={size} height={size} style={styles.svg}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={neon.ringTrack}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={neon.ringGlow}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={styles.ringValue}>{safeRemain}</Text>
          <Text style={styles.ringUnit}>SEC</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.value}>
        {safeRemain}
        <Text style={styles.unit}>s</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 54,
    fontWeight: '900',
    color: neon.text,
    letterSpacing: 0.5,
  },
  unit: {
    fontSize: 16,
    fontWeight: '900',
    color: neon.textMuted,
    marginLeft: 2,
  },
  ringWrap: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 36,
    fontWeight: '900',
    color: neon.cyan,
    textShadowColor: neon.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  ringUnit: {
    fontSize: 11,
    fontWeight: '900',
    color: neon.cyanMuted,
    letterSpacing: 2,
    marginTop: -2,
  },
});
