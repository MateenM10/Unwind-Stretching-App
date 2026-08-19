import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import AnimatedFlame from '../../components/AnimatedFlame';
import AnimatedNumber from '../../components/AnimatedNumber';
import FloatingOrbs from '../../components/FloatingOrbs';
import GradientButton from '../../components/GradientButton';
import HapticButton from '../../components/HapticButton';
import { getStreakData } from '../../utils/streaks';
import { colors, shadows } from '../../utils/theme';

const positions: { id: string; icon: keyof typeof Ionicons.glyphMap; name: string; desc: string }[] = [
  { id: 'couch',    icon: 'body-outline',  name: 'On the Couch', desc: 'Seated'  },
  { id: 'standing', icon: 'walk-outline',  name: 'Standing',      desc: 'Upright' },
  { id: 'lying',    icon: 'bed-outline',   name: 'Lying Down',    desc: 'Floor'   },
];

const MOTIVATIONS = [
  "Your body is asking for a moment.",
  "Five minutes now beats an hour of pain later.",
  "Consistency over intensity. Always.",
  "Tight muscles tell stories. Listen to them.",
  "The best stretch is the one you actually do.",
  "Tomorrow's you will thank today's you.",
  "Small moves. Big change.",
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getLastStretchedLabel = (lastSessionDate: string | null): string => {
  if (!lastSessionDate) return 'No sessions yet';
  const today = new Date().toISOString().split('T')[0];
  if (lastSessionDate === today) return 'Stretched today ✓';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastSessionDate === yesterday.toISOString().split('T')[0]) return 'Last stretched yesterday';
  const diff = Math.floor(
    (new Date(today).getTime() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  return `Last stretched ${diff} days ago`;
};

function PositionCard({ pos, isSelected, onPress }: {
  pos: typeof positions[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80,  useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[{ flex: 1 }, { transform: [{ scale: scaleAnim }] }]}>
      <HapticButton
        haptic="light"
        style={[styles.card, {
          borderColor:     isSelected ? colors.accent : 'transparent',
          backgroundColor: isSelected ? colors.accentLight : colors.white,
        }]}
        onPress={handlePress}
      >
        <Ionicons
          name={pos.icon}
          size={26}
          color={isSelected ? colors.accent : colors.textMid}
          style={styles.cardIcon}
        />
        <Text style={[styles.cardLabel, { color: isSelected ? colors.accent : colors.textDark }]}>
          {pos.name}
        </Text>
        <Text style={styles.cardDesc}>{pos.desc}</Text>
        <View style={[styles.checkCircle, { opacity: isSelected ? 1 : 0 }]}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      </HapticButton>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [selected, setSelected]       = useState<string[]>([]);
  const [streak, setStreak]           = useState(0);
  const [total, setTotal]             = useState(0);
  const [bestStreak, setBest]         = useState(0);
  const [motivation, setMotivation]   = useState(MOTIVATIONS[0]);
  const [userName, setUserName]       = useState('');
  const [lastSession, setLastSession] = useState<string | null>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const onboarded = await AsyncStorage.getItem('onboarded');
        if (!onboarded) {
          router.replace('/onboarding' as any);
          return;
        }
        const [data, name] = await Promise.all([
          getStreakData(),
          AsyncStorage.getItem('userName'),
        ]);
        setStreak(data.currentStreak);
        setTotal(data.totalSessions);
        setBest(data.longestStreak);
        setLastSession(data.lastSessionDate);
        setUserName(name ?? '');
        setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
      };
      init();
    }, [])
  );

  const toggle      = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const selectAll   = () => setSelected(positions.map(p => p.id));
  const isSelected  = (id: string) => selected.includes(id);
  const allSelected = selected.length === positions.length;

  const greetingName      = userName.trim() ? `, ${userName.trim().split(' ')[0]}` : '';
  const lastStretchedLabel = getLastStretchedLabel(lastSession);
  const stretchedToday    = lastSession === new Date().toISOString().split('T')[0];

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FAF7F2', '#F5EDE0']} style={styles.gradient}>
        <FloatingOrbs />
        <SafeAreaView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

            {/* Hero header */}
            <View style={styles.header}>
              <Text style={styles.greeting}>{getGreeting()}{greetingName}</Text>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.lastStretchedBadge, stretchedToday && styles.lastStretchedBadgeSuccess]}>
                  <Text style={[styles.lastStretchedText, stretchedToday && styles.lastStretchedTextSuccess]}>
                    {lastStretchedLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.tagline}>{motivation}</Text>
            </View>

            {/* Streak hero */}
            <LinearGradient
              colors={['#FFB970', '#E8924A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.streakHero}
            >
              <View style={styles.streakLeft}>
                <Text style={styles.streakLabel}>CURRENT STREAK</Text>
                <View style={styles.streakRow}>
                  <AnimatedNumber value={streak} duration={1000} style={styles.streakNumber} />
                  <Text style={styles.streakDays}>days</Text>
                </View>
                <Text style={styles.streakSubtext}>
                  {streak === 0  ? 'Start your streak today'    :
                   streak < 3    ? "You're just getting started" :
                   streak < 7    ? "Keep the fire burning"       :
                   streak < 14   ? "You're on fire"              :
                   streak < 30   ? "Unstoppable"                 :
                                   "Legendary status"}
                </Text>
              </View>
              <View style={styles.streakRight}>
                <AnimatedFlame size={64} />
              </View>
            </LinearGradient>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <AnimatedNumber value={total}      duration={1200} style={styles.statNumber} />
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <AnimatedNumber value={bestStreak} duration={1200} style={styles.statNumber} />
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
            </View>

            {/* Section title */}
            <Text style={styles.sectionTitle}>Where are you right now?</Text>
            <Text style={styles.sectionSubtitle}>Pick one or more positions</Text>

            {/* Position cards */}
            <View style={styles.cards}>
              {positions.map(pos => (
                <PositionCard
                  key={pos.id}
                  pos={pos}
                  isSelected={isSelected(pos.id)}
                  onPress={() => toggle(pos.id)}
                />
              ))}
            </View>

            <HapticButton
              haptic="light"
              style={[styles.allButton, {
                borderColor:     allSelected ? colors.accent : colors.border,
                backgroundColor: allSelected ? colors.accentLight : 'transparent',
              }]}
              onPress={selectAll}
            >
              <Text style={styles.allButtonText}>✦  All 3 Positions</Text>
            </HapticButton>

            {selected.length > 0 && (
              <GradientButton
                label="Let's Stretch  →"
                haptic="medium"
                style={{ marginTop: 8 }}
                onPress={() => router.push({ pathname: '/bodypart', params: { positions: selected.join(',') } })}
              />
            )}

          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient:                  { flex: 1 },
  container:                 { flex: 1, paddingHorizontal: 20 },

  header:                    { marginTop: 12, marginBottom: 20 },
  greeting:                  { fontSize: 32, fontWeight: '800', color: colors.textDark, letterSpacing: -0.5 },
  heroBadgeRow:              { flexDirection: 'row', marginTop: 8, marginBottom: 6 },
  lastStretchedBadge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  lastStretchedBadgeSuccess: { backgroundColor: '#EDFAF2', borderColor: '#6FCF97' },
  lastStretchedText:         { fontSize: 12, fontWeight: '600', color: colors.textMid },
  lastStretchedTextSuccess:  { color: '#27AE60' },
  tagline:                   { fontSize: 14, color: colors.textMid, fontStyle: 'italic' },

  streakHero:    { borderRadius: 24, padding: 22, flexDirection: 'row', alignItems: 'center', marginBottom: 14, shadowColor: '#E8924A', shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  streakLeft:    { flex: 1 },
  streakLabel:   { color: '#FFFFFFCC', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  streakRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  streakNumber:  { fontSize: 56, fontWeight: '900', color: '#FFFFFF', lineHeight: 60 },
  streakDays:    { fontSize: 18, fontWeight: '700', color: '#FFFFFFE6' },
  streakSubtext: { fontSize: 13, color: '#FFFFFFE0', marginTop: 4, fontWeight: '500' },
  streakRight:   { paddingLeft: 16 },

  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 32 },
  statCard:      { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center', ...shadows.card },
  statNumber:    { fontSize: 28, fontWeight: '800', color: colors.textDark, marginBottom: 2 },
  statLabel:     { fontSize: 11, color: colors.textMid, fontWeight: '600', letterSpacing: 0.5 },

  sectionTitle:    { fontSize: 22, fontWeight: '800', color: colors.textDark, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: colors.textMid, marginBottom: 16 },

  cards:      { flexDirection: 'row', gap: 10, marginBottom: 12 },
  card:       { borderRadius: 18, paddingVertical: 22, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, position: 'relative', ...shadows.card },
  cardIcon:   { marginBottom: 8 },
  cardLabel:  { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  cardDesc:   { fontSize: 11, color: colors.textMid, textAlign: 'center' },
  checkCircle:{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  checkMark:  { color: colors.white, fontSize: 11, fontWeight: '700' },

  allButton:     { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 2, alignItems: 'center' },
  allButtonText: { fontSize: 14, fontWeight: '600', color: colors.accent },
});