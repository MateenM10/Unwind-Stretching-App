import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { colors, shadows, shared } from '../utils/theme';

export default function CompleteScreen() {
  const { count, totalTime, streak } = useLocalSearchParams<{ count: string; totalTime: string; streak: string }>();
  const router = useRouter();
  const confettiRef = useRef<any>(null);

  const streakNum = parseInt(streak ?? '1');
  const countNum = parseInt(count ?? '0');
  const timeNum = parseInt(totalTime ?? '0');
  const minutes = Math.floor(timeNum / 60);
  const seconds = timeNum % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const getStreakMessage = () => {
    if (streakNum >= 30) return '🏆 30 day streak — incredible!';
    if (streakNum >= 14) return '🔥 14 days strong!';
    if (streakNum >= 7)  return '⚡ One week streak!';
    if (streakNum >= 3)  return '✨ 3 days in a row!';
    return '💪 Keep it up!';
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      confettiRef.current?.start();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.container}>

        {/* Confetti */}
        <ConfettiCannon
          ref={confettiRef}
          count={80}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut
          colors={['#C9A96E', '#FAF7F2', '#EDE5D8', '#9B8573', '#FFFFFF', '#D4B896']}
          fallSpeed={3000}
          explosionSpeed={350}
        />

        <View style={styles.heroSection}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Session Complete!</Text>
          <Text style={shared.subtitle}>Great work — your body thanks you.</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { value: countNum,    label: 'Stretches'  },
            { value: timeDisplay, label: 'Time Spent' },
            { value: streakNum,   label: 'Day Streak' },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.streakBanner}>
          <Text style={styles.streakText}>{getStreakMessage()}</Text>
        </View>

        <TouchableOpacity
          style={[shared.primaryButton, { marginBottom: 12 }]}
          onPress={() => {
            confettiRef.current?.start();
            router.replace('/' as any);
          }}
        >
          <Text style={shared.primaryButtonText}>Go Again →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={shared.secondaryButton} onPress={() => router.replace('/' as any)}>
          <Text style={styles.secondaryText}>I'm done for now</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  heroSection:  { alignItems: 'center', marginBottom: 40 },
  emoji:        { fontSize: 64, marginBottom: 16 },
  title:        { fontSize: 32, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  statsRow:     { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 20, padding: 24, marginBottom: 16, alignItems: 'center', ...shadows.accent },
  statCard:     { flex: 1, alignItems: 'center' },
  statNumber:   { fontSize: 22, fontWeight: '700', color: colors.textDark, marginBottom: 4 },
  statLabel:    { fontSize: 12, color: colors.textMid },
  statDivider:  { width: 1, height: 40, backgroundColor: colors.border },
  streakBanner: { backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: colors.border },
  streakText:   { color: colors.accent, fontSize: 15, fontWeight: '600' },
  secondaryText:{ color: colors.textLight, fontSize: 15 },
});