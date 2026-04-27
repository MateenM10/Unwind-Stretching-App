import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { recordSession } from '../utils/streaks';
import { ALL_STRETCHES } from '../utils/stretches';
import { adjustWeight, getFavourites, getWeights, toggleFavourite, weightedShuffle } from '../utils/weights';

export default function SessionScreen() {
  const { positions, bodyPart } = useLocalSearchParams<{ positions: string; bodyPart: string }>();
  const router = useRouter();

  const selectedPositions = positions?.split(',') ?? [];

  const filtered = ALL_STRETCHES.filter(s => {
    const matchesPosition = s.positions.some(p => selectedPositions.includes(p));
    const matchesBodyPart = bodyPart === 'general' || s.muscle === bodyPart;
    return matchesPosition && matchesBodyPart;
  });

  const [stretches, setStretches] = useState(filtered);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(filtered[0]?.duration ?? 30);
  const [isRunning, setIsRunning] = useState(true);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [favourites, setFavourites] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = stretches[index];
  const isLast = index === stretches.length - 1;
  const isFavourited = current ? favourites.includes(current.id) : false;

  useEffect(() => {
    const load = async () => {
      const weights = await getWeights();
      const favs = await getFavourites();
      setFavourites(favs);
      setStretches(weightedShuffle(filtered, weights));
    };
    load();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
      setTotalTimeSpent(t => t + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, index]);

  const handleFavourite = async () => {
    if (!current) return;
    const updated = await toggleFavourite(current.id);
    await adjustWeight(current.id, 'up');
    setFavourites(updated);
  };

  const goNext = async (skipped = false) => {
    if (current && skipped) {
      await adjustWeight(current.id, 'down');
    }
    if (isLast) {
      const streakData = await recordSession(totalTimeSpent, selectedPositions.join(','));
      router.replace({
        pathname: '/complete',
        params: {
          count: stretches.length.toString(),
          totalTime: totalTimeSpent.toString(),
          streak: streakData.currentStreak.toString(),
        },
      });
      return;
    }
    const next = index + 1;
    setIndex(next);
    setTimeLeft(stretches[next].duration);
    setIsRunning(true);
  };

  if (!current) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
        <SafeAreaView style={styles.container}>
          <Text style={styles.emptyText}>No stretches found for this combination.</Text>
          <TouchableOpacity style={styles.nextButton} onPress={() => router.replace('/' as any)}>
            <Text style={styles.nextText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  const progress = (index / stretches.length) * 100;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      <SafeAreaView style={styles.container}>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.counter}>{index + 1} of {stretches.length}</Text>

        {/* Main card */}
        <View style={styles.card}>
          <Text style={styles.muscle}>{current.muscle.toUpperCase()}</Text>
          <Text style={styles.name}>{current.name}</Text>

          {/* Coaching tip */}
          {current.tip && (
            <View style={styles.tipBox}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{current.tip}</Text>
            </View>
          )}

          {/* Timer */}
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{timeLeft}</Text>
            <Text style={styles.timerLabel}>secs</Text>
          </View>

          {/* Pause */}
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => setIsRunning(r => !r)}
          >
            <Text style={styles.pauseText}>{isRunning ? '⏸ Pause' : '▶ Resume'}</Text>
          </TouchableOpacity>

          {/* Favourite */}
          <TouchableOpacity
            style={[styles.favButton, isFavourited && styles.favButtonActive]}
            onPress={handleFavourite}
          >
            <Text style={styles.favText}>
              {isFavourited ? '❤️  Favourited' : '🤍  Favourite this stretch'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip / Next */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipButton} onPress={() => goNext(true)}>
            <Text style={styles.skipText}>⏭  Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={() => goNext(false)}>
            <Text style={styles.nextText}>{isLast ? '🎉  Finish' : 'Next →'}</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#FAF7F2', padding: 24 },
  progressTrack:   { height: 4, backgroundColor: '#EDE5D8', borderRadius: 2, marginBottom: 8 },
  progressFill:    { height: 4, backgroundColor: '#C9A96E', borderRadius: 2 },
  counter:         { color: '#9B8573', fontSize: 13, marginBottom: 20 },
  card:            { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 24, shadowColor: '#C9A96E', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  muscle:          { color: '#C9A96E', fontSize: 13, fontWeight: '600', letterSpacing: 1.5, marginBottom: 6 },
  name:            { color: '#2C2416', fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  tipBox:          { flexDirection: 'row', backgroundColor: '#FAF7F2', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EDE5D8', alignItems: 'flex-start', gap: 8 },
  tipIcon:         { fontSize: 14 },
  tipText:         { flex: 1, fontSize: 13, color: '#9B8573', lineHeight: 20 },
  timerCircle:     { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#C9A96E', alignItems: 'center', justifyContent: 'center', marginBottom: 20, backgroundColor: '#FDF8F2' },
  timerText:       { color: '#2C2416', fontSize: 40, fontWeight: '700' },
  timerLabel:      { color: '#9B8573', fontSize: 12 },
  pauseButton:     { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#EDE5D8', marginBottom: 12 },
  pauseText:       { color: '#9B8573', fontSize: 14 },
  favButton:       { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#EDE5D8' },
  favButtonActive: { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  favText:         { color: '#9B8573', fontSize: 14 },
  actions:         { flexDirection: 'row', gap: 12 },
  skipButton:      { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#EDE5D8' },
  skipText:        { color: '#9B8573', fontSize: 15, fontWeight: '600' },
  nextButton:      { flex: 1, backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center' },
  nextText:        { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  emptyText:       { color: '#9B8573', fontSize: 16, textAlign: 'center', marginBottom: 24, marginTop: 40 },
});