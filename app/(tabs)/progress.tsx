import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StreakData, getStreakData, getWeeklyData } from '../../utils/streaks';

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
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Keep showing up</Text>

          {/* Streak hero */}
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>
              {getStreakEmoji(data?.currentStreak ?? 0)}
            </Text>
            <Text style={styles.streakNumber}>{data?.currentStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{data?.totalSessions ?? 0}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {formatTime(data?.totalTimeSeconds ?? 0)}
              </Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{data?.longestStreak ?? 0}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>

          {/* Weekly bar chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>This Week</Text>
            <View style={styles.chartRow}>
              {weekly.map((count, i) => (
                <View key={i} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${(count / maxBar) * 100}%`,
                          backgroundColor: count > 0 ? '#a78bfa' : '#2a2a2a',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{DAY_LABELS[i]}</Text>
                  {count > 0 && (
                    <Text style={styles.barCount}>{count}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Milestones */}
          <View style={styles.milestonesCard}>
            <Text style={styles.chartTitle}>Milestones</Text>
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
  container:            { flex: 1, backgroundColor: '#0f0f0f', padding: 24 },
  title:                { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle:             { fontSize: 15, color: '#888', marginBottom: 24 },
  streakCard:           { backgroundColor: '#1a1a1a', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#a78bfa' },
  streakEmoji:          { fontSize: 48, marginBottom: 8 },
  streakNumber:         { fontSize: 64, fontWeight: '700', color: '#fff', lineHeight: 70 },
  streakLabel:          { fontSize: 16, color: '#888', marginTop: 4 },
  statsGrid:            { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard:             { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, alignItems: 'center' },
  statNumber:           { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  statLabel:            { fontSize: 12, color: '#888' },
  chartCard:            { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20, marginBottom: 16 },
  chartTitle:           { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  chartRow:             { flexDirection: 'row', justifyContent: 'space-between', height: 100, alignItems: 'flex-end' },
  barColumn:            { alignItems: 'center', flex: 1 },
  barTrack:             { width: 24, height: 80, backgroundColor: '#2a2a2a', borderRadius: 6, justifyContent: 'flex-end', marginBottom: 6, overflow: 'hidden' },
  barFill:              { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel:             { color: '#555', fontSize: 10 },
  barCount:             { color: '#a78bfa', fontSize: 10, fontWeight: '700' },
  milestonesCard:       { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20 },
  milestone:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', opacity: 0.4 },
  milestoneReached:     { opacity: 1 },
  milestoneEmoji:       { fontSize: 20, marginRight: 12 },
  milestoneLabel:       { color: '#888', fontSize: 15, flex: 1 },
  milestoneLabelReached:{ color: '#fff' },
  milestoneTick:        { color: '#a78bfa', fontSize: 16, fontWeight: '700' },
});