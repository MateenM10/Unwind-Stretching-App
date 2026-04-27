import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  // Load weights + favourites and shuffle on mount
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
      router.replace({
        pathname: '/complete',
        params: {
          count: stretches.length.toString(),
          totalTime: totalTimeSpent.toString(),
          streak: '1',
        }
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
        <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
        <SafeAreaView style={styles.container}>
          <Text style={styles.emptyText}>No stretches found for this combination.</Text>
          <TouchableOpacity style={styles.nextButton} onPress={() => router.replace('/')}>
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
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <SafeAreaView style={styles.container}>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.counter}>{index + 1} of {stretches.length}</Text>

        <View style={styles.card}>
          <Text style={styles.muscle}>{current.muscle.toUpperCase()}</Text>
          <Text style={styles.name}>{current.name}</Text>

          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{timeLeft}</Text>
            <Text style={styles.timerLabel}>secs</Text>
          </View>

          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => setIsRunning(r => !r)}
          >
            <Text style={styles.pauseText}>{isRunning ? '⏸ Pause' : '▶ Resume'}</Text>
          </TouchableOpacity>

          {/* Favourite button inside card */}
          <TouchableOpacity
            style={[styles.favButton, isFavourited && styles.favButtonActive]}
            onPress={handleFavourite}
          >
            <Text style={styles.favText}>{isFavourited ? '❤️  Favourited' : '🤍  Favourite this stretch'}</Text>
          </TouchableOpacity>
        </View>

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
  container:      { flex: 1, backgroundColor: '#0f0f0f', padding: 24 },
  progressTrack:  { height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, marginBottom: 8 },
  progressFill:   { height: 4, backgroundColor: '#a78bfa', borderRadius: 2 },
  counter:        { color: '#888', fontSize: 13, marginBottom: 32 },
  card:           { backgroundColor: '#1a1a1a', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 32 },
  muscle:         { color: '#a78bfa', fontSize: 13, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
  name:           { color: '#fff', fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  timerCircle:    { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#a78bfa', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  timerText:      { color: '#fff', fontSize: 42, fontWeight: '700' },
  timerLabel:     { color: '#888', fontSize: 12 },
  pauseButton:    { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#444', marginBottom: 16 },
  pauseText:      { color: '#ccc', fontSize: 14 },
  favButton:      { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  favButtonActive:{ borderColor: '#a78bfa', backgroundColor: '#2a1a3a' },
  favText:        { color: '#ccc', fontSize: 14 },
  actions:        { flexDirection: 'row', gap: 12 },
  skipButton:     { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, alignItems: 'center' },
  skipText:       { color: '#888', fontSize: 15, fontWeight: '600' },
  nextButton:     { flex: 1, backgroundColor: '#a78bfa', borderRadius: 16, padding: 18, alignItems: 'center' },
  nextText:       { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyText:      { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 24, marginTop: 40 },
});