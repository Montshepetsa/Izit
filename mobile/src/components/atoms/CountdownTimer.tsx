import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { fonts, paper } from '../../theme/paper';

type CountdownTimerProps = {
  remainingSeconds: number;
  isActive: boolean;
  onTick: () => void;
  onTimeUp: () => void;
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

  const size = 108;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - progress);

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={paper.creamDeep}
          strokeWidth={stroke}
          fill={paper.yellow}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={paper.ink}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View
        style={styles.ringCenter}
        pointerEvents="none"
        accessibilityRole="timer"
        accessibilityLabel={`${safeRemain} seconds left`}
      >
        <Text style={styles.ringValue}>{safeRemain}</Text>
        <Text style={styles.ringUnit}>sec</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ringWrap: {
    width: 108,
    height: 108,
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
    fontFamily: fonts.displayUp,
    fontSize: 32,
    color: paper.ink,
  },
  ringUnit: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: paper.ink,
    letterSpacing: 1.4,
    marginTop: -2,
    textTransform: 'uppercase',
  },
});
