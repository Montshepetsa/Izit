import React from 'react';
import { StyleSheet, View } from 'react-native';
import { paper } from '../../theme/paper';

export function ConfettiField() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.block, styles.y1]} />
      <View style={[styles.block, styles.r1]} />
      <View style={[styles.block, styles.b1]} />
      <View style={[styles.block, styles.y2]} />
      <View style={[styles.block, styles.r2]} />
      <View style={[styles.block, styles.b2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 6,
  },
  y1: {
    width: 54,
    height: 18,
    backgroundColor: paper.yellow,
    top: 86,
    left: 18,
    transform: [{ rotate: '-12deg' }],
  },
  r1: {
    width: 28,
    height: 28,
    backgroundColor: paper.red,
    top: 72,
    right: 28,
    transform: [{ rotate: '14deg' }],
  },
  b1: {
    width: 42,
    height: 16,
    backgroundColor: paper.blue,
    top: 132,
    right: 48,
    transform: [{ rotate: '-8deg' }],
  },
  y2: {
    width: 36,
    height: 14,
    backgroundColor: paper.yellow,
    bottom: 168,
    right: 22,
    transform: [{ rotate: '18deg' }],
  },
  r2: {
    width: 22,
    height: 22,
    backgroundColor: paper.red,
    bottom: 210,
    left: 28,
    transform: [{ rotate: '-20deg' }],
  },
  b2: {
    width: 48,
    height: 16,
    backgroundColor: paper.blue,
    bottom: 120,
    left: 52,
    transform: [{ rotate: '9deg' }],
  },
});
