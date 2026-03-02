import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface MultipleChoiceCardProps {
  questionNumber: number;
  questionText: string;
  codeSnippet?: string | null;
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  correctIndex?: number | null; // Show after submission
}

export default function MultipleChoiceCard({
  questionNumber,
  questionText,
  codeSnippet,
  options,
  selectedIndex,
  onSelect,
  disabled = false,
  correctIndex,
}: MultipleChoiceCardProps) {
  const showResults = correctIndex !== undefined && correctIndex !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.questionNumber}>Question {questionNumber}</Text>
      <Text style={styles.questionText}>{questionText}</Text>

      {codeSnippet && (
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{codeSnippet}</Text>
        </View>
      )}

      {options.map((option, index) => {
        const isCorrect = showResults && index === correctIndex;
        const isWrong = showResults && index === selectedIndex && index !== correctIndex;
        const isSelected = !showResults && index === selectedIndex;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isCorrect && styles.optionCorrect,
              isWrong && styles.optionWrong,
              isSelected && styles.optionSelected,
            ]}
            onPress={() => onSelect(index)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <View style={styles.optionRow}>
              <View
                style={[
                  styles.optionIndicator,
                  isSelected && styles.optionIndicatorSelected,
                  isCorrect && styles.optionIndicatorCorrect,
                  isWrong && styles.optionIndicatorWrong,
                ]}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  isCorrect && styles.optionTextCorrect,
                  isWrong && styles.optionTextWrong,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  questionNumber: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  codeBlock: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  codeText: {
    fontFamily: 'Menlo',
    fontSize: 13,
    color: colors.textInverse,
    lineHeight: 20,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  optionWrong: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  optionIndicatorSelected: {
    backgroundColor: colors.accent,
  },
  optionIndicatorCorrect: {
    backgroundColor: colors.success,
  },
  optionIndicatorWrong: {
    backgroundColor: colors.error,
  },
  optionLetter: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.accent,
  },
  optionTextCorrect: {
    color: colors.success,
  },
  optionTextWrong: {
    color: colors.error,
  },
});
