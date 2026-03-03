import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/config/api';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorView from '@/components/common/ErrorView';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { OverallProgress, StreakInfo } from '@learn-ai/shared-types';

export default function HomeScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: progress, loading: progressLoading, error: progressError, refetch: refetchProgress } = useApi<OverallProgress>(() => apiClient.getProgress());
  const { data: streaks, loading: streaksLoading } = useApi<StreakInfo>(() => apiClient.getStreaks());

  if (progressLoading || streaksLoading) return <LoadingScreen />;
  if (progressError) return <ErrorView message={progressError} onRetry={refetchProgress} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Welcome back, {user?.name ?? 'Learner'}!</Text>

      {/* Streak Card */}
      <Card style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{streaks?.currentStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{streaks?.longestStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>Longest Streak</Text>
          </View>
        </View>
      </Card>

      {/* Overall Progress */}
      <Card style={styles.progressCard}>
        <Text style={styles.cardTitle}>Overall Progress</Text>
        <ProgressBar progress={progress?.overallPercent ?? 0} />
        <Text style={styles.progressText}>
          {progress?.completedLessons ?? 0} of {progress?.totalLessons ?? 0} lessons completed ({progress?.overallPercent ?? 0}%)
        </Text>
      </Card>

      {/* Module Progress List */}
      {progress?.modules.map((mod) => (
        <Card key={mod.moduleId} style={styles.moduleCard}>
          <Text style={styles.moduleNumber}>Module {mod.moduleNumber}</Text>
          <Text style={styles.moduleTitle}>{mod.moduleTitle}</Text>
          <ProgressBar progress={mod.progressPercent} style={styles.moduleProgress} />
          <View style={styles.moduleStats}>
            <Text style={styles.moduleStat}>
              {mod.completedLessons}/{mod.totalLessons} lessons
            </Text>
            {mod.latestQuizScore && (
              <Text style={styles.moduleStat}>
                Quiz: {mod.latestQuizScore.score}/{mod.latestQuizScore.maxScore}
              </Text>
            )}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  streakCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  streakValue: {
    ...typography.h1,
    color: colors.textInverse,
  },
  streakLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  progressCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  moduleCard: {
    marginBottom: spacing.sm,
  },
  moduleNumber: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  moduleTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  moduleProgress: {
    marginBottom: spacing.xs,
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleStat: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
