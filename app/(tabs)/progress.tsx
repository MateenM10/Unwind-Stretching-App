import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StreakData, getStreakData, getWeeklyData } from '../../utils/streaks';
import { colors, shadows, shared } from '../../utils/theme';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProgressScreen() {
  const [data, setData] = useState<StreakData | null>(null);
  const [weekly, setWeekly] = useState<number[]>(Array(7).fill(0));

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const streakData = await getStreakData();
        setData(streakData);
        setWeekly(getWeeklyData(streakData.sessionHistory));
      };
      load();
    }, [])
  );

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7)  return '⚡';
    if (streak >= 3)  return '✨';
    return '💪';
  };

  const maxBar = Math.max(...weekly, 1);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={shared.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={shared.screenTitle}>Your Progress</Text>
          <Text style={[shared.subtitle, styles.subtitleLeft]}>Keep showing up</Text>

          {/* Streak hero */}
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>{getStreakEmoji(data?.currentStreak ?? 0)}</Text>
            <Text style={styles.streakNumber}>{data?.currentStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {[
              { value: data?.totalSessions ?? 0,                    label: 'Sessions'    },
              { value: formatTime(data?.totalTimeSeconds ?? 0),     label: 'Total Time'  },
              { value: data?.longestStreak ?? 0,                    label: 'Best Streak' },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Weekly chart */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.chartRow}>
              {weekly.map((count, i) => (
                <View key={i} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View style={[
                      styles.barFill,
                      {
                        height: `${(count / maxBar) * 100}%`,
                        backgroundColor: count > 0 ? colors.accent : colors.border,
                      }
                    ]} />
                  </View>
                  <Text style={styles.barLabel}>{DAY_LABELS[i]}</Text>
                  {count > 0 && <Text style={styles.barCount}>{count}</Text>}
                </View>
              ))}
            </View>
          </View>

          {/* Milestones */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            {[
              { days: 3,  label: '3 Day Streak',  emoji: '✨' },
              { days: 7,  label: '1 Week Streak',  emoji: '⚡' },
              { days: 14, label: '2 Week Streak',  emoji: '🔥' },
              { days: 30, label: '30 Day Streak',  emoji: '🏆' },
            ].map(m => {
              const reached = (data?.longestStreak ?? 0) >= m.days;
              return (
                <View key={m.days} style={[styles.milestone, reached && styles.milestoneReached]}>
                  <Text style={styles.milestoneEmoji}>{m.emoji}</Text>
                  <Text style={[styles.milestoneLabel, reached && styles.milestoneLabelReached]}>
                    {m.label}
                  </Text>
                  {reached && <Text style={styles.milestoneTick}>✓</Text>}
                </View>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
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
  milestone:             { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5EFE6', opacity: 0.4 },
  milestoneReached:      { opacity: 1 },
  milestoneEmoji:        { fontSize: 20, marginRight: 12 },
  milestoneLabel:        { color: colors.textMid, fontSize: 15, flex: 1 },
  milestoneLabelReached: { color: colors.textDark },
  milestoneTick:         { color: colors.accent, fontSize: 16, fontWeight: '700' },
});