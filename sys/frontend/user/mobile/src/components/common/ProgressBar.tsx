import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export default function ProgressBar({
  progress,
  height = 8,
  color = colors.accent,
  backgroundColor = colors.surfaceSecondary,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color,
            width: `${clampedProgress}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
