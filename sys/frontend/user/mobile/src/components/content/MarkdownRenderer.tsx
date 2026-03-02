import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return <Markdown style={markdownStyles}>{content}</Markdown>;
}

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  code_inline: {
    backgroundColor: colors.surface,
    color: colors.accent,
    fontFamily: 'Menlo',
    fontSize: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: colors.primary,
    color: colors.textInverse,
    fontFamily: 'Menlo',
    fontSize: 13,
    lineHeight: 20,
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.sm,
  },
  code_block: {
    backgroundColor: colors.primary,
    color: colors.textInverse,
    fontFamily: 'Menlo',
    fontSize: 13,
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.sm,
  },
  blockquote: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
  },
  list_item: {
    marginVertical: 2,
  },
  bullet_list: {
    marginVertical: spacing.sm,
  },
  ordered_list: {
    marginVertical: spacing.sm,
  },
  link: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  strong: {
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    marginVertical: spacing.sm,
  },
  thead: {
    backgroundColor: colors.surface,
  },
  th: {
    padding: spacing.sm,
    fontWeight: '600',
  },
  td: {
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
