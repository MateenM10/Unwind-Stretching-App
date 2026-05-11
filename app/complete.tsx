import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import GradientButton from '../components/GradientButton';
import { colors, shared } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function CompleteScreen() {
  const { count, totalTime, streak } = useLocalSearchParams<{ count: string; totalTime: string; streak: string }>();
  const router = useRouter();
  const confettiRef = useRef<any>(null);

  const streakNum = parseInt(streak ?? '1');
  const countNum  = parseInt(count ?? '0');
  const timeNum   = parseInt(totalTime ?? '0');
  const minutes   = Math.floor(timeNum / 60);
  const seconds   = timeNum % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Animated values for staggered fade-in
  const heroAnim   = useRef(new Animated.Value(0)).current;
  const statsAnim  = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const btnsAnim   = useRef(new Animated.Value(0)).current;

  const fadeSlideIn = (anim: Animated.Value, delay: number) =>
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    });

  const toStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 0],
      }),
    }],
  });

  useEffect(() => {
    // Fire haptic + confetti + staggered animations
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => confettiRef.current?.start(), 300);

    Animated.stagger(120, [
      fadeSlideIn(heroAnim, 0),
      fadeSlideIn(statsAnim, 0),
      fadeSlideIn(bannerAnim, 0),
      fadeSlideIn(btnsAnim, 0),
    ]).start();
  }, []);

  const getStreakMessage = () => {
    if (streakNum >= 30) return '🏆 30 day streak — incredible!';
    if (streakNum >= 14) return '🔥 14 days strong!';
    if (streakNum >= 7)  return '⚡ One week streak!';
    if (streakNum >= 3)  return '✨ 3 days in a row!';
    return '💪 Keep it up!';
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.container}>

        <ConfettiCannon
          ref={confettiRef}
          count={80}
          origin={{ x: width / 2, y: -10 }}
          autoStart={false}
          fadeOut
          colors={['#C9A96E', '#FAF7F2', '#EDE5D8', '#D4B483', '#FFFFFF', '#B8864E']}
          fallSpeed={3000}
          explosionSpeed={350}
        />

        {/* Hero */}
        <Animated.View style={[styles.heroSection, toStyle(heroAnim)]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Session Complete!</Text>
          <Text style={shared.subtitle}>Great work — your body thanks you.</Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsRow, toStyle(statsAnim)]}>
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
        </Animated.View>

        {/* Streak banner */}
        <Animated.View style={[styles.streakBanner, toStyle(bannerAnim)]}>
          <Text style={styles.streakText}>{getStreakMessage()}</Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={toStyle(btnsAnim)}>
          <GradientButton
            label="Go Again →"
            haptic="success"
            style={{ marginBottom: 12 }}
            onPress={() => router.replace('/' as any)}
          />
          <TouchableOpacity
            style={shared.secondaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace('/' as any);
            }}
          >
            <Text style={styles.secondaryText}>I'm done for now</Text>
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  heroSection:  { alignItems: 'center', marginBottom: 40 },
  emoji:        { fontSize: 64, marginBottom: 16 },
  title:        { fontSize: 32, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  statsRow:     { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 20, padding: 24, marginBottom: 16, alignItems: 'center', shadowColor: '#C9A96E', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  statCard:     { flex: 1, alignItems: 'center' },
  statNumber:   { fontSize: 22, fontWeight: '700', color: colors.textDark, marginBottom: 4 },
  statLabel:    { fontSize: 12, color: colors.textMid },
  statDivider:  { width: 1, height: 40, backgroundColor: colors.border },
  streakBanner: { backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: colors.border },
  streakText:   { color: colors.accent, fontSize: 15, fontWeight: '600' },
  secondaryText:{ color: colors.textLight, fontSize: 15 },
});