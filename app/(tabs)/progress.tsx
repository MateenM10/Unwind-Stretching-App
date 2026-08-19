import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import AnimatedNumber from '../../components/AnimatedNumber';
import Skeleton from '../../components/Skeleton';
import { StreakData, getStreakData, getWeekdayLabels, getWeeklyData } from '../../utils/streaks';
import { colors, gradient, shadows, shared } from '../../utils/theme';

const MILESTONES: { days: number; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { days: 3,  label: '3 Day Streak',  icon: 'sparkles'  },
  { days: 7,  label: '1 Week Streak', icon: 'flash'     },
  { days: 14, label: '2 Week Streak', icon: 'flame'     },
  { days: 30, label: '30 Day Streak', icon: 'trophy'    },
];

const getStreakIcon = (streak: number): keyof typeof Ionicons.glyphMap => {
  if (streak >= 30) return 'trophy';
  if (streak >= 14) return 'flame';
  if (streak >= 7)  return 'flash';
  if (streak >= 3)  return 'sparkles';
  return 'barbell-outline';
};

const formatTime = (seconds: number) => {
  const hrs  = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

export default function ProgressScreen() {
  const [data, setData]         = useState<StreakData | null>(null);
  const [weekly, setWeekly]     = useState<number[]>(Array(7).fill(0));
  const [refreshing, setRefreshing] = useState(false);
  const dayLabels = getWeekdayLabels();

  const load = useCallback(async () => {
    const streakData = await getStreakData();
    setData(streakData);
    setWeekly(getWeeklyData(streakData.sessionHistory));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setData(null);
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const isLoading = data === null;
  const maxBar    = Math.max(...weekly, 1);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={gradient.screen} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
                title="Refreshing..."
                titleColor={colors.textMid}
              />
            }
          >
            <Text style={shared.screenTitle}>Your Progress</Text>
            <Text style={[shared.subtitle, styles.subtitleLeft]}>Keep showing up</Text>

            {/* Streak hero */}
            <View style={styles.streakCard}>
              {isLoading ? (
                <>
                  <Skeleton width={48} height={48} borderRadius={24} style={{ marginBottom: 12 }} />
                  <Skeleton width={80} height={64} borderRadius={8}  style={{ marginBottom: 8  }} />
                  <Skeleton width={100} height={16} borderRadius={8} />
                </>
              ) : (
                <>
                  <Ionicons name={getStreakIcon(data.currentStreak)} size={40} color={colors.accent} style={{ marginBottom: 8 }} />
                  <AnimatedNumber value={data.currentStreak} duration={800} style={styles.streakNumber} />
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </>
              )}
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              {isLoading ? (
                [0, 1, 2].map(i => (
                  <View key={i} style={styles.statCard}>
                    <Skeleton width={48} height={28} borderRadius={6} style={{ marginBottom: 8 }} />
                    <Skeleton width={64} height={12} borderRadius={6} />
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.statCard}>
                    <AnimatedNumber value={data.totalSessions}  duration={1000} style={styles.statNumber} />
                    <Text style={styles.statLabel}>Sessions</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{formatTime(data.totalTimeSeconds)}</Text>
                    <Text style={styles.statLabel}>Total Time</Text>
                  </View>
                  <View style={styles.statCard}>
                    <AnimatedNumber value={data.longestStreak} duration={1000} style={styles.statNumber} />
                    <Text style={styles.statLabel}>Best Streak</Text>
                  </View>
                </>
              )}
            </View>

            {/* Weekly chart */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <View style={styles.chartRow}>
                {dayLabels.map((day, i) => (
                  <View key={i} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      {isLoading ? (
                        <Skeleton width="100%" height={20} borderRadius={6} />
                      ) : (
                        <View style={[
                          styles.barFill,
                          {
                            height: `${(weekly[i] / maxBar) * 100}%`,
                            backgroundColor: weekly[i] > 0 ? colors.accent : colors.border,
                          }
                        ]} />
                      )}
                    </View>
                    <Text style={styles.barLabel}>{day}</Text>
                    {!isLoading && weekly[i] > 0 && (
                      <Text style={styles.barCount}>{weekly[i]}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Milestones */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Milestones</Text>
              {isLoading ? (
                [0, 1, 2, 3].map(i => (
                  <View key={i} style={styles.milestoneRow}>
                    <Skeleton width={28} height={28} borderRadius={14} style={{ marginRight: 12 }} />
                    <Skeleton width={120} height={14} borderRadius={6} />
                  </View>
                ))
              ) : (
                MILESTONES.map(m => {
                  const reached = data.longestStreak >= m.days;
                  return (
                    <View key={m.days} style={[styles.milestone, reached && styles.milestoneReached]}>
                      <Ionicons
                        name={m.icon}
                        size={20}
                        color={reached ? colors.accent : colors.textLight}
                        style={styles.milestoneIcon}
                      />
                      <Text style={[styles.milestoneLabel, reached && styles.milestoneLabelReached]}>
                        {m.label}
                      </Text>
                      {reached && <Ionicons name="checkmark-circle" size={18} color={colors.accent} />}
                    </View>
                  );
                })
              )}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container:             { flex: 1, padding: 24 },
  subtitleLeft:          { textAlign: 'left', marginBottom: 24 },
  streakCard:            { backgroundColor: colors.white, borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: colors.accent, ...shadows.accent },
  streakNumber:          { fontSize: 64, fontWeight: '700', color: colors.textDark, lineHeight: 70 },
  streakLabel:           { fontSize: 16, color: colors.textMid, marginTop: 4 },
  statsGrid:             { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard:              { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 18, alignItems: 'center', ...shadows.card },
  statNumber:            { fontSize: 22, fontWeight: '700', color: colors.textDark, marginBottom: 4 },
  statLabel:             { fontSize: 12, color: colors.textMid },
  sectionCard:           { backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 16, ...shadows.card },
  sectionTitle:          { color: colors.textDark, fontSize: 16, fontWeight: '600', marginBottom: 16 },
  chartRow:              { flexDirection: 'row', justifyContent: 'space-between', height: 100, alignItems: 'flex-end' },
  barColumn:             { alignItems: 'center', flex: 1 },
  barTrack:              { width: 24, height: 80, backgroundColor: colors.border, borderRadius: 6, justifyContent: 'flex-end', marginBottom: 6, overflow: 'hidden' },
  barFill:               { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel:              { color: colors.textLight, fontSize: 10 },
  barCount:              { color: colors.accent, fontSize: 10, fontWeight: '700' },
  milestoneRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5EFE6' },
  milestone:             { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5EFE6', opacity: 0.4 },
  milestoneReached:      { opacity: 1 },
  milestoneIcon:         { marginRight: 12 },
  milestoneLabel:        { color: colors.textMid, fontSize: 15, flex: 1 },
  milestoneLabelReached: { color: colors.textDark },
});