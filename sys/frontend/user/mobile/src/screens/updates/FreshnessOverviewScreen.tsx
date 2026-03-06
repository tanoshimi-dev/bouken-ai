import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/config/api';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorView from '@/components/common/ErrorView';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { FreshnessSummary, RecentUpdate, ToolFreshness } from '@learn-ai/shared-types';
import type { UpdateStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<UpdateStackParamList>;

function freshnessColor(freshness: number): string {
  if (freshness >= 90) return colors.success;
  if (freshness >= 70) return colors.warning;
  return colors.error;
}

function ToolCard({ tool, onPress }: { tool: ToolFreshness; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.toolCardWrapper}>
      <Card style={styles.toolCard}>
        <View style={styles.toolCardHeader}>
          <Text style={styles.toolName}>{tool.displayName}</Text>
          <Text style={[styles.toolPercent, { color: freshnessColor(tool.freshness) }]}>
            {tool.freshness}%
          </Text>
        </View>
        <ProgressBar
          progress={tool.freshness}
          color={freshnessColor(tool.freshness)}
          style={styles.toolProgress}
        />
        <View style={styles.toolMeta}>
          <Text style={styles.toolMetaText}>Latest: v{tool.latestVersion}</Text>
          <Text style={styles.toolMetaText}>Content: v{tool.contentVersion}</Text>
        </View>
        <Text
          style={[
            styles.toolStatus,
            { color: tool.pendingUpdates > 0 ? colors.warning : colors.success },
          ]}
        >
          {tool.pendingUpdates > 0
            ? `${tool.pendingUpdates} updates pending`
            : 'Up to date'}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

function RecentUpdateItem({ item, onPress }: { item: RecentUpdate; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.recentItem}>
      <Text style={styles.recentDate}>
        {new Date(item.releaseDate).toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
        })}
      </Text>
      <View style={styles.recentContent}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>
            {item.displayName} v{item.version}
          </Text>
          {item.breakingChanges && (
            <View style={styles.breakingBadge}>
              <Text style={styles.breakingText}>Breaking</Text>
            </View>
          )}
        </View>
        <Text style={styles.recentSummary} numberOfLines={2}>
          {item.summary}
        </Text>
      </View>
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor:
              item.resolvedCount === item.impactCount ? colors.success : colors.warning,
          },
        ]}
      />
    </TouchableOpacity>
  );
}

export default function FreshnessOverviewScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
    refetch,
  } = useApi<FreshnessSummary>(() => apiClient.getUpdatesSummary());
  const { data: recentUpdates } = useApi<RecentUpdate[]>(() =>
    apiClient.getRecentUpdates(10),
  );

  if (summaryLoading) return <LoadingScreen />;
  if (summaryError) return <ErrorView message={summaryError} onRetry={refetch} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overall Freshness */}
      {summary && (
        <Card style={styles.overallCard}>
          <Text style={styles.cardTitle}>Overall Content Freshness</Text>
          <View style={styles.overallRow}>
            <View style={styles.overallBarContainer}>
              <ProgressBar
                progress={summary.overallFreshness}
                height={12}
                color={freshnessColor(summary.overallFreshness)}
              />
            </View>
            <Text
              style={[
                styles.overallPercent,
                { color: freshnessColor(summary.overallFreshness) },
              ]}
            >
              {summary.overallFreshness}%
            </Text>
          </View>
          <Text style={styles.overallMeta}>
            {summary.tools.length} tools tracked
            {summary.lastChecked &&
              ` · Last checked: ${new Date(summary.lastChecked).toLocaleDateString('ja-JP')}`}
          </Text>
        </Card>
      )}

      {/* Tool Cards - Horizontal scroll */}
      {summary && summary.tools.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Tools</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={summary.tools}
            keyExtractor={(item) => item.toolSlug}
            renderItem={({ item }) => (
              <ToolCard
                tool={item}
                onPress={() => navigation.navigate('ToolDetail', { toolSlug: item.toolSlug })}
              />
            )}
            contentContainerStyle={styles.toolList}
          />
        </>
      )}

      {/* Recent Updates */}
      {recentUpdates && recentUpdates.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          <Card>
            {recentUpdates.map((update, index) => (
              <React.Fragment key={update.id}>
                {index > 0 && <View style={styles.divider} />}
                <RecentUpdateItem
                  item={update}
                  onPress={() =>
                    navigation.navigate('ToolDetail', { toolSlug: update.toolSlug })
                  }
                />
              </React.Fragment>
            ))}
          </Card>
        </>
      )}
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
  overallCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  overallBarContainer: {
    flex: 1,
  },
  overallPercent: {
    ...typography.h2,
    fontWeight: '700',
  },
  overallMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  toolList: {
    paddingRight: spacing.md,
  },
  toolCardWrapper: {
    width: 200,
    marginRight: spacing.sm,
  },
  toolCard: {
    height: '100%',
  },
  toolCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toolName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  toolPercent: {
    ...typography.h3,
    fontWeight: '700',
  },
  toolProgress: {
    marginBottom: spacing.sm,
  },
  toolMeta: {
    marginBottom: spacing.xs,
  },
  toolMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  toolStatus: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  recentDate: {
    ...typography.caption,
    color: colors.textTertiary,
    width: 50,
    marginTop: 2,
  },
  recentContent: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recentTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breakingBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  breakingText: {
    ...typography.caption,
    color: colors.error,
    fontSize: 10,
    fontWeight: '600',
  },
  recentSummary: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
