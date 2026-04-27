import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { recordSession } from '../utils/streaks';
import { ALL_STRETCHES } from '../utils/stretches';
import { adjustWeight, getFavourites, getWeights, toggleFavourite, weightedShuffle } from '../utils/weights';

const BREATHING_CYCLE = 8;

const getBreathingCue = (timeLeft: number, totalDuration: number): string => {
  const elapsed = totalDuration - timeLeft;
  const phase = elapsed % BREATHING_CYCLE;
  if (phase < 4) return 'Breathe in...';
  return 'Breathe out...';
};

export default function SessionScreen() {
  const { positions, bodyPart, minutes, feeling } = useLocalSearchParams<{
    positions: string;
    bodyPart: string;
    minutes: string;
    feeling: string;
  }>();
  const router = useRouter();

  const selectedPositions = positions?.split(',') ?? [];
  const selectedBodyParts = bodyPart?.split(',') ?? [];

  const allFiltered = ALL_STRETCHES.filter(s => {
    const matchesPosition = s.positions.some(p => selectedPositions.includes(p));
    const matchesBodyPart = bodyPart === 'general' || selectedBodyParts.includes(s.muscle);
    const matchesFeeling = !feeling || s.feelings.includes(feeling);
    return matchesPosition && matchesBodyPart && matchesFeeling;
  });

  const filtered = (() => {
    const mins = parseInt(minutes ?? '0');
    if (mins === 0) return allFiltered;
    let total = 0;
    const result = [];
    for (const s of allFiltered) {
      if (total + s.duration <= mins * 60) {
        result.push(s);
        total += s.duration;
      }
      if (total >= mins * 60) break;
    }
    return result.length > 0 ? result : allFiltered.slice(0, 2);
  })();

  const [stretches, setStretches] = useState(filtered);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(filtered[0]?.duration ?? 30);
  const [isRunning, setIsRunning] = useState(true);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBreathRef = useRef<string>('');
  const halfwaySpokenRef = useRef(false);
  const endSpokenRef = useRef(false);

  const current = stretches[index];
  const isLast = index === stretches.length - 1;
  const isFavourited = current ? favourites.includes(current.id) : false;
  const breathingCue = current ? getBreathingCue(timeLeft, current.duration) : '';
  const isBreathingIn = breathingCue === 'Breathe in...';

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    Speech.stop();
    Speech.speak(text, { rate: 0.9, pitch: 1.0 });
  };

  useEffect(() => {
    if (!current) return;
    halfwaySpokenRef.current = false;
    endSpokenRef.current = false;
    lastBreathRef.current = '';
    speak(`${current.name}. ${current.tip ?? ''}`);
  }, [index, voiceEnabled]);

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
    if (!isRunning || !current) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        const newTime = t <= 1 ? 0 : t - 1;

        const halfway = Math.floor(current.duration / 2);
        if (newTime === halfway && !halfwaySpokenRef.current) {
          halfwaySpokenRef.current = true;
          speak('Halfway there.');
        }

        if (newTime === 3 && !endSpokenRef.current) {
          endSpokenRef.current = true;
          speak(isLast ? 'Almost done. Great work.' : 'Get ready for the next stretch.');
        }

        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return newTime;
      });

      setTotalTimeSpent(t => t + 1);

      setTimeLeft(t => {
        if (!current) return t;
        const elapsed = current.duration - t;
        const phase = elapsed % BREATHING_CYCLE;
        if (phase === 0 && lastBreathRef.current !== 'in') {
          lastBreathRef.current = 'in';
          speak('Breathe in.');
        } else if (phase === 4 && lastBreathRef.current !== 'out') {
          lastBreathRef.current = 'out';
          speak('Breathe out.');
        }
        return t;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, index, voiceEnabled]);

  const handleFavourite = async () => {
    if (!current) return;
    const updated = await toggleFavourite(current.id);
    await adjustWeight(current.id, 'up');
    setFavourites(updated);
  };

  const handleNotInterested = async () => {
    if (!current) return;
    await adjustWeight(current.id, 'down');
    goNext();
  };

  const toggleVoice = (val: boolean) => {
    setVoiceEnabled(val);
    if (!val) Speech.stop();
    else speak('Voice guidance on.');
  };

  const goNext = async () => {
    Speech.stop();
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

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.voiceToggle}>
            <Text style={styles.voiceLabel}>{voiceEnabled ? '🔊' : '🔇'}</Text>
            <Switch
              value={voiceEnabled}
              onValueChange={toggleVoice}
              trackColor={{ false: '#EDE5D8', true: '#C9A96E' }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        <Text style={styles.counter}>{index + 1} of {stretches.length}</Text>

        {/* Main card */}
        <View style={styles.card}>
          <Text style={styles.muscle}>{current.muscle.toUpperCase()}</Text>
          <Text style={styles.name}>{current.name}</Text>

          {current.tip && (
            <View style={styles.tipBox}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{current.tip}</Text>
            </View>
          )}

          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{timeLeft}</Text>
            <Text style={styles.timerLabel}>secs</Text>
          </View>

          {isRunning && (
            <View style={styles.breathingRow}>
              <Text style={[styles.breathingCue, isBreathingIn ? styles.breatheIn : styles.breatheOut]}>
                {breathingCue}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => {
              if (isRunning) Speech.stop();
              setIsRunning(r => !r);
            }}
          >
            <Text style={styles.pauseText}>{isRunning ? '⏸ Pause' : '▶ Resume'}</Text>
          </TouchableOpacity>

          {/* Favourite + Not Interested row */}
          <View style={styles.feedbackRow}>
            <TouchableOpacity
              style={[styles.feedbackButton, isFavourited && styles.feedbackButtonActive]}
              onPress={handleFavourite}
            >
              <Text style={styles.feedbackText}>{isFavourited ? '❤️  Saved' : '🤍  Favourite'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={handleNotInterested}
            >
              <Text style={styles.feedbackText}>👎  Not for me</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next only */}
        <TouchableOpacity style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextText}>{isLast ? '🎉  Finish' : 'Next →'}</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#FAF7F2', padding: 24 },
  topRow:             { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  progressTrack:      { flex: 1, height: 4, backgroundColor: '#EDE5D8', borderRadius: 2 },
  progressFill:       { height: 4, backgroundColor: '#C9A96E', borderRadius: 2 },
  voiceToggle:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voiceLabel:         { fontSize: 16 },
  counter:            { color: '#9B8573', fontSize: 13, marginBottom: 20 },
  card:               { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 24, shadowColor: '#C9A96E', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  muscle:             { color: '#C9A96E', fontSize: 13, fontWeight: '600', letterSpacing: 1.5, marginBottom: 6 },
  name:               { color: '#2C2416', fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  tipBox:             { flexDirection: 'row', backgroundColor: '#FAF7F2', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EDE5D8', alignItems: 'flex-start', gap: 8 },
  tipIcon:            { fontSize: 14 },
  tipText:            { flex: 1, fontSize: 13, color: '#9B8573', lineHeight: 20 },
  timerCircle:        { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#C9A96E', alignItems: 'center', justifyContent: 'center', marginBottom: 12, backgroundColor: '#FDF8F2' },
  timerText:          { color: '#2C2416', fontSize: 40, fontWeight: '700' },
  timerLabel:         { color: '#9B8573', fontSize: 12 },
  breathingRow:       { marginBottom: 16, alignItems: 'center' },
  breathingCue:       { fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  breatheIn:          { color: '#C9A96E' },
  breatheOut:         { color: '#9B8573' },
  pauseButton:        { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#EDE5D8', marginBottom: 16 },
  pauseText:          { color: '#9B8573', fontSize: 14 },
  feedbackRow:        { flexDirection: 'row', gap: 10 },
  feedbackButton:     { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#EDE5D8', alignItems: 'center' },
  feedbackButtonActive: { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  feedbackText:       { color: '#9B8573', fontSize: 13 },
  nextButton:         { backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center' },
  nextText:           { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  emptyText:          { color: '#9B8573', fontSize: 16, textAlign: 'center', marginBottom: 24, marginTop: 40 },
});