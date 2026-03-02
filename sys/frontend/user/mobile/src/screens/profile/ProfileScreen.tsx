import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/config/api';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorView from '@/components/common/ErrorView';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { OverallProgress, UserAchievement } from '@learn-claude-code/shared-types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { data: progress, loading: progressLoading } = useApi<OverallProgress>(() => apiClient.getProgress());
  const { data: achievements, loading: achLoading } = useApi<UserAchievement[]>(() => apiClient.getAchievements());

  if (progressLoading || achLoading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <View style={styles.profileHeader}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{user?.name?.charAt(0) ?? '?'}</Text>
          </View>
        )}
        <Text style={styles.userName}>{user?.name}</Text>
        {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
        <Text style={styles.memberSince}>
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Progress</Text>
        <ProgressBar progress={progress?.overallPercent ?? 0} style={styles.progressBar} />
        <Text style={styles.statText}>
          {progress?.completedLessons ?? 0}/{progress?.totalLessons ?? 0} lessons completed
        </Text>
        <Text style={styles.statText}>
          {progress?.modules.filter((m) => m.progressPercent === 100).length ?? 0} modules mastered
        </Text>
      </Card>

      {/* Achievements */}
      <Card style={styles.achievementsCard}>
        <Text style={styles.cardTitle}>Achievements ({achievements?.length ?? 0})</Text>
        {achievements && achievements.length > 0 ? (
          <View style={styles.badgeGrid}>
            {achievements.map((a) => (
              <View key={a.badge.slug} style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>{a.badge.icon}</Text>
                <Text style={styles.badgeName} numberOfLines={1}>
                  {a.badge.name}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Complete lessons and quizzes to earn badges!</Text>
        )}
      </Card>

      {/* Actions */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsButtonText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarInitial: {
    ...typography.h1,
    color: colors.textInverse,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberSince: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  statsCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    marginBottom: spacing.sm,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  achievementsCard: {
    marginBottom: spacing.lg,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeItem: {
    alignItems: 'center',
    width: 72,
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 2,
  },
  badgeName: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  settingsButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  settingsButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  logoutButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.error,
  },
});
