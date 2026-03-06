import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/config/api';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorView from '@/components/common/ErrorView';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { ToolDetail, ToolVersionDetail, ImpactStatus, ImpactPriority } from '@learn-ai/shared-types';
import type { UpdateStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<UpdateStackParamList, 'ToolDetail'>;

function freshnessColor(freshness: number): string {
  if (freshness >= 90) return colors.success;
  if (freshness >= 70) return colors.warning;
  return colors.error;
}

function StatusBadge({ status }: { status: ImpactStatus }) {
  const badgeColors: Record<string, { bg: string; text: string }> = {
    updated: { bg: colors.successLight, text: colors.success },
    in_progress: { bg: colors.accentLight, text: colors.accent },
    pending: { bg: colors.warningLight, text: colors.warning },
    not_affected: { bg: colors.surfaceSecondary, text: colors.textTertiary },
  };
  const labels: Record<string, string> = {
    updated: 'Updated',
    in_progress: 'In Progress',
    pending: 'Pending',
    not_affected: 'N/A',
  };
  const c = badgeColors[status] ?? badgeColors.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{labels[status] ?? status}</Text>
    </View>
  );
}

function PriorityLabel({ priority }: { priority: ImpactPriority }) {
  const map: Record<string, { label: string; color: string }> = {
    critical: { label: '[!!!]', color: colors.error },
    high: { label: '[!!]', color: colors.warning },
    normal: { label: '[!]', color: colors.textTertiary },
    low: { label: '[.]', color: colors.textTertiary },
  };
  const p = map[priority] ?? map.normal;
  return <Text style={[styles.priorityText, { color: p.color }]}>{p.label}</Text>;
}

function VersionItem({ version }: { version: ToolVersionDetail }) {
  const hasUnresolved = version.impacts.some(
    (i) => i.status === 'pending' || i.status === 'in_progress',
  );

  const changeTypeColors: Record<string, string> = {
    new: colors.success,
    changed: colors.accent,
    fixed: '#8b5cf6',
    deprecated: colors.warning,
    removed: colors.error,
  };

  return (
    <View style={styles.versionItem}>
      {/* Timeline dot */}
      <View style={styles.timelineDotContainer}>
        <View
          style={[
            styles.timelineDot,
            {
              backgroundColor: hasUnresolved ? colors.warningLight : colors.successLight,
              borderColor: hasUnresolved ? colors.warning : colors.success,
            },
          ]}
        />
        <View style={styles.timelineLine} />
      </View>

      {/* Content */}
      <View style={styles.versionContent}>
        <View style={styles.versionHeader}>
          <Text style={styles.versionNumber}>v{version.version}</Text>
          <Text style={styles.versionDate}>
            {new Date(version.releaseDate).toLocaleDateString('ja-JP')}
          </Text>
          {version.breakingChanges && (
            <View style={styles.breakingBadge}>
              <Text style={styles.breakingText}>Breaking</Text>
            </View>
          )}
        </View>
        <Text style={styles.versionSummary}>{version.summary}</Text>

        {/* Changes */}
        {version.changes.length > 0 && (
          <View style={styles.changesContainer}>
            {version.changes.map((change, i) => (
              <View key={i} style={styles.changeRow}>
                <Text
                  style={[
                    styles.changeType,
                    { color: changeTypeColors[change.type] ?? colors.textSecondary },
                  ]}
                >
                  [{change.type.toUpperCase()}]
                </Text>
                <Text style={styles.changeDesc}>{change.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Affected Lessons */}
        {version.impacts.length > 0 && (
          <Card style={styles.impactCard}>
            <Text style={styles.impactTitle}>Affected Lessons</Text>
            {version.impacts.map((impact) => (
              <View key={impact.id} style={styles.impactRow}>
                <View style={styles.impactInfo}>
                  <Text style={styles.impactModule}>{impact.moduleTitle}</Text>
                  {impact.lessonTitle && (
                    <Text style={styles.impactLesson}>{impact.lessonTitle}</Text>
                  )}
                </View>
                <View style={styles.impactActions}>
                  <PriorityLabel priority={impact.priority} />
                  <StatusBadge status={impact.status} />
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>
    </View>
  );
}

export default function ToolDetailScreen({ route }: Props) {
  const { toolSlug } = route.params;
  const { data, loading, error, refetch } = useApi<ToolDetail>(() =>
    apiClient.getToolDetail(toolSlug),
  );

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorView message={error ?? 'Tool not found'} onRetry={refetch} />;

  const { tool, versions } = data;
  const pendingCount = versions.reduce(
    (sum, v) =>
      sum + v.impacts.filter((i) => i.status === 'pending' || i.status === 'in_progress').length,
    0,
  );
  const totalImpacts = versions.reduce((sum, v) => sum + v.impacts.length, 0);
  const freshness =
    totalImpacts > 0 ? Math.round(((totalImpacts - pendingCount) / totalImpacts) * 100) : 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Card */}
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Official</Text>
            <Text style={styles.statusValue}>{versions[0]?.version ?? 'N/A'}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Content</Text>
            <Text style={styles.statusValue}>{tool.currentContentVersion}</Text>
          </View>
        </View>
        <ProgressBar
          progress={freshness}
          height={10}
          color={freshnessColor(freshness)}
          style={styles.statusProgress}
        />
        <Text style={styles.statusMeta}>
          {pendingCount > 0 ? `${pendingCount} pending updates` : 'Up to date'}
        </Text>
        <View style={styles.linkRow}>
          {tool.changelogUrl && (
            <TouchableOpacity onPress={() => Linking.openURL(tool.changelogUrl)}>
              <Text style={styles.linkText}>Changelog</Text>
            </TouchableOpacity>
          )}
          {tool.documentationUrl && (
            <TouchableOpacity onPress={() => Linking.openURL(tool.documentationUrl)}>
              <Text style={styles.linkText}>Docs</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Version Timeline */}
      <Text style={styles.sectionTitle}>Version Timeline</Text>
      {versions.map((v) => (
        <VersionItem key={v.id} version={v} />
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
  statusCard: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusProgress: {
    marginBottom: spacing.sm,
  },
  statusMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  linkRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.accent,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  versionItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineDotContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  versionContent: {
    flex: 1,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  versionNumber: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  versionDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  breakingBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  breakingText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.error,
  },
  versionSummary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  changesContainer: {
    marginBottom: spacing.sm,
  },
  changeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: 2,
  },
  changeType: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  changeDesc: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  impactCard: {
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
  },
  impactTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  impactInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  impactModule: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  impactLesson: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  impactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
