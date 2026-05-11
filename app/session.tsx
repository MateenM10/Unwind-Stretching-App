import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import PauseModal from '../components/PauseModal';
import PulsingTimer from '../components/PulsingTimer';
import StretchInfoSheet from '../components/StretchInfoSheet';
import { recordSession } from '../utils/streaks';
import { ALL_STRETCHES, Stretch } from '../utils/stretches';
import { colors, shared } from '../utils/theme';
import { adjustWeight, getFavourites, getWeights, toggleFavourite, weightedShuffle } from '../utils/weights';

const BREATHING_CYCLE = 8;

const getBreathingCue = (timeLeft: number, totalDuration: number): string => {
  const elapsed = totalDuration - timeLeft;
  const phase = elapsed % BREATHING_CYCLE;
  return phase < 4 ? 'Breathe in...' : 'Breathe out...';
};

export default function SessionScreen() {
  const { positions, bodyPart, feeling } = useLocalSearchParams<{
    positions: string;
    bodyPart: string;
    feeling: string;
  }>();
  const router = useRouter();

  const selectedPositions = positions?.split(',') ?? [];
  const selectedBodyParts = bodyPart?.split(',') ?? [];

  const allFiltered = ALL_STRETCHES.filter(s => {
    const matchesPosition = s.positions.some(p => selectedPositions.includes(p));
    const matchesBodyPart = bodyPart === 'general' || selectedBodyParts.includes(s.muscle);
    const matchesFeeling  = !feeling || (s as any).feelings?.includes(feeling);
    return matchesPosition && matchesBodyPart && matchesFeeling;
  });

  const [stretches, setStretches]           = useState<Stretch[]>(allFiltered);
  const [index, setIndex]                   = useState(0);
  const [timeLeft, setTimeLeft]             = useState(allFiltered[0]?.duration ?? 30);
  const [isRunning, setIsRunning]           = useState(true);
  const [isPaused, setIsPaused]             = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [favourites, setFavourites]         = useState<string[]>([]);
  const [voiceEnabled, setVoiceEnabled]     = useState(true);
  const [showInfo, setShowInfo]             = useState(false);

  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBreathRef    = useRef<string>('');
  const halfwaySpokenRef = useRef(false);
  const endSpokenRef     = useRef(false);

  const current       = stretches[index];
  const isLast        = index === stretches.length - 1;
  const isFavourited  = current ? favourites.includes(current.id) : false;
  const breathingCue  = current ? getBreathingCue(timeLeft, current.duration) : '';
  const isBreathingIn = breathingCue === 'Breathe in...';

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    Speech.stop();
    Speech.speak(text, { rate: 0.9, pitch: 1.0 });
  };

  useEffect(() => {
    if (!current) return;
    halfwaySpokenRef.current = false;
    endSpokenRef.current     = false;
    lastBreathRef.current    = '';
    speak(`${current.name}. ${(current as any).tip ?? ''}`);
  }, [index, voiceEnabled]);

  useEffect(() => {
    const load = async () => {
      const weights = await getWeights();
      const favs    = await getFavourites();
      setFavourites(favs);
      setStretches(weightedShuffle(allFiltered, weights));
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
        const phase = (current.duration - t) % BREATHING_CYCLE;
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

  useEffect(() => {
    if (timeLeft === 0) {
      const timeout = setTimeout(() => goNext(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [timeLeft]);

  const handleFavourite = async () => {
    if (!current) return;
    const updated = await toggleFavourite(current.id);
    await adjustWeight(current.id, 'up');
    setFavourites(updated);
  };

  const handleNotInterested = async () => {
    if (!current) return;
    await adjustWeight(current.id, 'down');
    goNext(true);
  };

  const toggleVoice = (val: boolean) => {
    setVoiceEnabled(val);
    if (!val) Speech.stop(); else speak('Voice guidance on.');
  };

  const goNext = async (skipped = false) => {
    clearInterval(intervalRef.current!);
    Speech.stop();
    if (current && skipped) await adjustWeight(current.id, 'down');
    if (isLast) {
      const streakData = await recordSession(totalTimeSpent, selectedPositions.join(','));
      router.replace({
        pathname: '/complete',
        params: {
          count:     stretches.length.toString(),
          totalTime: totalTimeSpent.toString(),
          streak:    streakData.currentStreak.toString(),
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
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <SafeAreaView style={shared.screen}>
          <Text style={shared.emptyText}>No stretches found for this combination.</Text>
          <TouchableOpacity style={shared.primaryButton} onPress={() => router.replace('/' as any)}>
            <Text style={shared.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  const progress = (index / stretches.length) * 100;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={shared.screen}>

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={shared.progressTrack}>
            <View style={[shared.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.voiceToggle}>
            <Text>{voiceEnabled ? '🔊' : '🔇'}</Text>
            <Switch
              value={voiceEnabled}
              onValueChange={toggleVoice}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.white}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        <Text style={styles.counter}>{index + 1} of {stretches.length}</Text>

        {/* Main card */}
        <View style={styles.card}>
          <Text style={styles.muscle}>{current.muscle.toUpperCase()}</Text>

          {/* Name + info */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>{current.name}</Text>
            <TouchableOpacity style={styles.infoButton} onPress={() => setShowInfo(true)}>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </TouchableOpacity>
          </View>

          {/* Tip */}
          {(current as any).tip && (
            <View style={shared.tipBox}>
              <Text>💡</Text>
              <Text style={shared.tipText}>{(current as any).tip}</Text>
            </View>
          )}

          {/* Timer */}
          <PulsingTimer
            stretchId={current.id}
            timeLeft={timeLeft}
            totalDuration={current.duration}
            isRunning={isRunning}
            isBreathingIn={isBreathingIn}
          />

          {/* Breathing cue — fixed height so layout never shifts */}
          <Text style={[
            styles.breathingCue,
            { color: isBreathingIn ? colors.accent : colors.textMid, opacity: isRunning ? 1 : 0 }
          ]}>
            {breathingCue}
          </Text>

          {timeLeft === 0 && (
            <Text style={styles.doneText}>✓ Done! Next up in a moment...</Text>
          )}

          {/* Pause */}
          <TouchableOpacity
            style={[shared.ghostButton, { marginBottom: 16 }]}
            onPress={() => {
              Speech.stop();
              setIsRunning(false);
              setIsPaused(true);
            }}
          >
            <Text style={shared.ghostButtonText}>⏸  Pause</Text>
          </TouchableOpacity>

          {/* Feedback */}
          <View style={styles.feedbackRow}>
            <TouchableOpacity
              style={[styles.feedbackButton, isFavourited && styles.feedbackButtonActive]}
              onPress={handleFavourite}
            >
              <Text style={styles.feedbackText}>{isFavourited ? '❤️  Saved' : '🤍  Favourite'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackButton} onPress={handleNotInterested}>
              <Text style={styles.feedbackText}>👎  Not for me</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next */}
        <TouchableOpacity style={shared.primaryButton} onPress={() => goNext(false)}>
          <Text style={shared.primaryButtonText}>{isLast ? '🎉  Finish' : 'Next →'}</Text>
        </TouchableOpacity>

        {/* Info sheet */}
        <StretchInfoSheet
          visible={showInfo}
          onClose={() => setShowInfo(false)}
          stretchId={current.id}
          stretchName={current.name}
          muscle={current.muscle}
        />

        {/* Pause modal */}
        <PauseModal
  visible={isPaused}
  stretchName={current.name}
  onResume={() => {
    setIsPaused(false);
    setIsRunning(true);
  }}
  onSkip={() => {
    setIsPaused(false);
    goNext(true);
  }}
  onQuit={() => {
    setIsPaused(false);
    Speech.stop();
    router.replace('/' as any);
  }}
/>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  topRow:              { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  voiceToggle:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  counter:             { color: colors.textMid, fontSize: 13, marginBottom: 16 },
  card:                { backgroundColor: colors.white, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20, shadowColor: '#C9A96E', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  muscle:              { color: colors.accent, fontSize: 13, fontWeight: '600', letterSpacing: 1.5, marginBottom: 6 },
  nameRow:             { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  name:                { color: colors.textDark, fontSize: 22, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  infoButton:          { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  infoIcon:            { fontSize: 15, color: colors.accent, fontWeight: '700' },
  breathingCue:        { fontSize: 15, fontWeight: '600', letterSpacing: 0.5, marginBottom: 12, height: 22 },
  doneText:            { color: colors.success, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  feedbackRow:         { flexDirection: 'row', gap: 10 },
  feedbackButton:      { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  feedbackButtonActive:{ borderColor: colors.accent, backgroundColor: colors.accentLight },
  feedbackText:        { color: colors.textMid, fontSize: 13 },
});