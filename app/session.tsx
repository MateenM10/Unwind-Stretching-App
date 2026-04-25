import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ALL_STRETCHES = [
  { id: '1',  name: 'Neck Rolls',          muscle: 'neck',       duration: 30, positions: ['couch', 'standing'] },
  { id: '2',  name: 'Shoulder Shrugs',     muscle: 'shoulders',  duration: 30, positions: ['couch', 'standing'] },
  { id: '3',  name: 'Seated Spinal Twist', muscle: 'back',       duration: 45, positions: ['couch'] },
  { id: '4',  name: 'Standing Quad Hold',  muscle: 'quads',      duration: 30, positions: ['standing'] },
  { id: '5',  name: 'Standing Calf Raise', muscle: 'calves',     duration: 30, positions: ['standing'] },
  { id: '6',  name: 'Supine Knee Hug',     muscle: 'back',       duration: 45, positions: ['lying'] },
  { id: '7',  name: 'Lying Hip Stretch',   muscle: 'hips',       duration: 45, positions: ['lying'] },
  { id: '8',  name: 'Chest Opener',        muscle: 'chest',      duration: 30, positions: ['couch', 'standing'] },
  { id: '9',  name: 'Ankle Circles',       muscle: 'ankles',     duration: 20, positions: ['couch', 'lying'] },
  { id: '10', name: 'Full Body Stretch',   muscle: 'general',    duration: 45, positions: ['lying'] },
  { id: '11', name: 'Hamstring Reach',     muscle: 'hamstrings', duration: 40, positions: ['standing', 'lying'] },
  { id: '12', name: 'Hip Flexor Lunge',    muscle: 'hips',       duration: 40, positions: ['standing'] },
];

export default function SessionScreen() {
  const { positions, bodyPart } = useLocalSearchParams<{ positions: string; bodyPart: string }>();
  const router = useRouter();

  const selectedPositions = positions?.split(',') ?? [];

  const stretches = ALL_STRETCHES.filter(s => {
    const matchesPosition = s.positions.some(p => selectedPositions.includes(p));
    const matchesBodyPart = bodyPart === 'general' || s.muscle === bodyPart;
    return matchesPosition && matchesBodyPart;
  });

  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(stretches[0]?.duration ?? 30);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = stretches[index];
  const isLast = index === stretches.length - 1;

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
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, index]);

  const goNext = () => {
    if (isLast) {
      router.replace('/');
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
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipButton} onPress={goNext}>
            <Text style={styles.skipText}>⏭  Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextText}>{isLast ? '🎉  Finish' : 'Next →'}</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0f0f0f', padding: 24 },
  progressTrack: { height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, marginBottom: 8 },
  progressFill:  { height: 4, backgroundColor: '#a78bfa', borderRadius: 2 },
  counter:       { color: '#888', fontSize: 13, marginBottom: 32 },
  card:          { backgroundColor: '#1a1a1a', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 32 },
  muscle:        { color: '#a78bfa', fontSize: 13, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
  name:          { color: '#fff', fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  timerCircle:   { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#a78bfa', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  timerText:     { color: '#fff', fontSize: 42, fontWeight: '700' },
  timerLabel:    { color: '#888', fontSize: 12 },
  pauseButton:   { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  pauseText:     { color: '#ccc', fontSize: 14 },
  actions:       { flexDirection: 'row', gap: 12 },
  skipButton:    { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, alignItems: 'center' },
  skipText:      { color: '#888', fontSize: 15, fontWeight: '600' },
  nextButton:    { flex: 1, backgroundColor: '#a78bfa', borderRadius: 16, padding: 18, alignItems: 'center' },
  nextText:      { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyText:     { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 24, marginTop: 40 },
});