import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { fonts, paper } from '../../theme/paper';

export function PaperButton({
  title,
  onPress,
  disabled,
  variant = 'ink',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'ink' | 'ghost' | 'red';
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'ink' && styles.ink,
        variant === 'ghost' && styles.ghost,
        variant === 'red' && styles.red,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text
        style={[
          styles.label,
          variant === 'ghost' ? styles.labelGhost : styles.labelOnInk,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 58,
    borderRadius: paper.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    alignSelf: 'stretch',
  },
  ink: {
    backgroundColor: paper.ink,
  },
  red: {
    backgroundColor: paper.red,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: paper.ink,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 16,
    letterSpacing: 0.4,
  },
  labelOnInk: {
    color: paper.white,
  },
  labelGhost: {
    color: paper.ink,
  },
});
