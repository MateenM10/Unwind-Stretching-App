import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Skeleton from '../../components/Skeleton';
import { StreakData, getStreakData, getWeeklyData } from '../../utils/streaks';
import { colors, gradient, shadows, shared } from '../../utils/theme';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MILESTONES = [
  { days: 3,  label: '3 Day Streak',  emoji: '✨' },
  { days: 7,  label: '1 Week Streak', emoji: '⚡' },
  { days: 14, label: '2 Week Streak', emoji: '🔥' },
  { days: 30, label: '30 Day Streak', emoji: '🏆' },
];

const getStreakEmoji = (streak: number) => {
  if (streak >= 30) return '🏆';
  if (streak >= 14) return '🔥';
  if (streak >= 7)  return '⚡';
  if (streak >= 3)  return '✨';
  return '💪';
};

const formatTime = (seconds: number) => {
  const hrs  = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

export default function ProgressScreen() {
  const [data, setData]     = useState<StreakData | null>(null);
  const [weekly, setWeekly] = useState<number[]>(Array(7).fill(0));

  useFocusEffect(
    useCallback(() => {
      setData(null); // reset so skeleton shows on re-focus
      const load = async () => {
        const streakData = await getStreakData();
        setData(streakData);
        setWeekly(getWeeklyData(streakData.sessionHistory));
      };
      load();
    }, [])
  );

  const isLoading = data === null;
  const maxBar    = Math.max(...weekly, 1);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={gradient.screen} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={shared.screenTitle}>Your Progress</Text>
            <Text style={[shared.subtitle, styles.subtitleLeft]}>Keep showing up</Text>

            {/* Streak hero */}
            <View style={styles.streakCard}>
              {isLoading ? (
                <>
                  <Skeleton width={48} height={48} borderRadius={24} style={{ marginBottom: 12 }} />
                  <Skeleton width={80} height={64} borderRadius={8} style={{ marginBottom: 8 }} />
                  <Skeleton width={100} height={16} borderRadius={8} />
                </>
              ) : (
                <>
                  <Text style={styles.streakEmoji}>{getStreakEmoji(data.currentStreak)}</Text>
                  <Text style={styles.streakNumber}>{data.currentStreak}</Text>
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
                [
                  { value: data.totalSessions,                 label: 'Sessions'    },
                  { value: formatTime(data.totalTimeSeconds),  label: 'Total Time'  },
                  { value: data.longestStreak,                 label: 'Best Streak' },
                ].map((stat, i) => (
                  <View key={i} style={styles.statCard}>
                    <Text style={styles.statNumber}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Weekly chart */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <View style={styles.chartRow}>
                {DAY_LABELS.map((day, i) => (
                  <View key={i} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      {isLoading ? (
                        <Skeleton width="100%" height={20 + Math.random() * 40} borderRadius={6} />
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
                      <Text style={styles.milestoneEmoji}>{m.emoji}</Text>
                      <Text style={[styles.milestoneLabel, reached && styles.milestoneLabelReached]}>
                        {m.label}
                      </Text>
                      {reached && (
                        <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                      )}
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
  streakEmoji:           { fontSize: 48, marginBottom: 8 },
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
  milestoneEmoji:        { fontSize: 20, marginRight: 12 },
  milestoneLabel:        { color: colors.textMid, fontSize: 15, flex: 1 },
  milestoneLabelReached: { color: colors.textDark },
});