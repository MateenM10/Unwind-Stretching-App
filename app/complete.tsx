import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CompleteScreen() {
  const { count, totalTime, streak } = useLocalSearchParams<{
    count: string;
    totalTime: string;
    streak: string;
  }>();
  const router = useRouter();

  const streakNum = parseInt(streak ?? '1');
  const countNum = parseInt(count ?? '0');
  const timeNum = parseInt(totalTime ?? '0');

  const minutes = Math.floor(timeNum / 60);
  const seconds = timeNum % 60;
  const timeDisplay = minutes > 0
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;

  const getStreakMessage = () => {
    if (streakNum >= 30) return '🔥 30 day streak — incredible!';
    if (streakNum >= 14) return '🔥 14 days strong!';
    if (streakNum >= 7)  return '🔥 One week streak!';
    if (streakNum >= 3)  return '🔥 3 days in a row!';
    return '✨ Keep it up!';
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <SafeAreaView style={styles.container}>

        {/* Top celebration */}
        <View style={styles.heroSection}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Session Complete!</Text>
          <Text style={styles.subtitle}>Great work — your body thanks you.</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{countNum}</Text>
            <Text style={styles.statLabel}>Stretches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{timeDisplay}</Text>
            <Text style={styles.statLabel}>Time Spent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streakNum}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Streak message */}
        <View style={styles.streakBanner}>
          <Text style={styles.streakText}>{getStreakMessage()}</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.primaryText}>Go Again →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.secondaryText}>I'm done for now</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0f0f0f', padding: 24, justifyContent: 'center' },
  heroSection:     { alignItems: 'center', marginBottom: 40 },
  emoji:           { fontSize: 64, marginBottom: 16 },
  title:           { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle:        { fontSize: 16, color: '#888' },
  statsRow:        { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 20, padding: 24, marginBottom: 16, alignItems: 'center' },
  statCard:        { flex: 1, alignItems: 'center' },
  statNumber:      { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  statLabel:       { fontSize: 12, color: '#888' },
  statDivider:     { width: 1, height: 40, backgroundColor: '#2a2a2a' },
  streakBanner:    { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#2a2a2a' },
  streakText:      { color: '#a78bfa', fontSize: 15, fontWeight: '600' },
  primaryButton:   { backgroundColor: '#a78bfa', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12 },
  primaryText:     { color: '#fff', fontSize: 17, fontWeight: '700' },
  secondaryButton: { borderRadius: 16, padding: 18, alignItems: 'center' },
  secondaryText:   { color: '#555', fontSize: 15 },
});