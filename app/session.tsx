import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PauseModal from '../components/PauseModal';
import PulsingTimer from '../components/PulsingTimer';
import StretchInfoSheet from '../components/StretchInfoSheet';
import { recordSession } from '../utils/streaks';
import { ALL_STRETCHES, Stretch } from '../utils/stretches';
import { colors, shadows } from '../utils/theme';
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
  const [tipExpanded, setTipExpanded]       = useState(false);

  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBreathRef    = useRef<string>('');
  const halfwaySpokenRef = useRef(false);
  const endSpokenRef     = useRef(false);
  const tipAnim          = useRef(new Animated.Value(0)).current;
  const cardAnim         = useRef(new Animated.Value(0)).current;

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
    cardAnim.setValue(0);
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [index]);

  useEffect(() => {
    if (!current) return;
    halfwaySpokenRef.current = false;
    endSpokenRef.current     = false;
    lastBreathRef.current    = '';
    setTipExpanded(false);
    tipAnim.setValue(0);
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
        if (t <= 1) { clearInterval(intervalRef.current!); return 0; }
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

  const toggleTip = () => {
    const toValue = tipExpanded ? 0 : 1;
    setTipExpanded(!tipExpanded);
    Animated.timing(tipAnim, {
      toValue,
      duration: 220,
      easing: toValue === 1 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const tipHeight = tipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 72],
  });

  const tipOpacity = tipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

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
        <SafeAreaView style={styles.container}>
          <Text style={styles.emptyText}>No stretches found for this combination.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/' as any)}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  const progress = (index / stretches.length) * 100;
  const cardStyle = {
    opacity: cardAnim,
    transform: [{
      translateY: cardAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 0],
      }),
    }],
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.container}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.voiceToggle}>
            <Text style={styles.voiceEmoji}>{voiceEnabled ? '🔊' : '🔇'}</Text>
            <Switch
              value={voiceEnabled}
              onValueChange={toggleVoice}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.white}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* Counter */}
        <Text style={styles.counter}>
          {index + 1} <Text style={styles.counterOf}>of {stretches.length}</Text>
        </Text>

        {/* Main card */}
        <Animated.View style={[styles.card, cardStyle]}>

          {/* Muscle + name row */}
          <View style={styles.nameSection}>
            <View style={styles.nameLeft}>
              <Text style={styles.muscle}>{current.muscle.toUpperCase()}</Text>
              <Text style={styles.name}>{current.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => {
                Speech.stop();
                setIsRunning(false);
                setShowInfo(true);
              }}
            >
              <Text style={styles.infoIcon}>ⓘ</Text>
            </TouchableOpacity>
          </View>

          {/* Collapsible tip */}
          {(current as any).tip && (
            <TouchableOpacity style={styles.tipHeader} onPress={toggleTip} activeOpacity={0.7}>
              <Text style={styles.tipHeaderText}>💡 Coaching tip</Text>
              <Text style={[styles.tipChevron, { transform: [{ rotate: tipExpanded ? '180deg' : '0deg' }] }]}>
                ⌄
              </Text>
            </TouchableOpacity>
          )}
          <Animated.View style={[styles.tipBody, { height: tipHeight, opacity: tipOpacity }]}>
            <Text style={styles.tipText}>{(current as any).tip}</Text>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Timer */}
          <View style={styles.timerSection}>
            <PulsingTimer
              stretchId={current.id}
              timeLeft={timeLeft}
              totalDuration={current.duration}
              isRunning={isRunning}
              isBreathingIn={isBreathingIn}
            />

            <Text style={[
              styles.breathingCue,
              { color: isBreathingIn ? colors.accent : colors.textMid, opacity: isRunning && timeLeft > 0 ? 1 : 0 }
            ]}>
              {breathingCue}
            </Text>

            {timeLeft === 0 && (
              <Text style={styles.doneText}>✓ Done! Next up in a moment...</Text>
            )}
          </View>

          {/* Pause */}
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => {
              Speech.stop();
              setIsRunning(false);
              setIsPaused(true);
            }}
          >
            <Text style={styles.pauseText}>⏸  Pause</Text>
          </TouchableOpacity>

        </Animated.View>

        {/* Feedback row */}
        <View style={styles.feedbackRow}>
          <TouchableOpacity
            style={[styles.feedbackButton, isFavourited && styles.feedbackButtonActive]}
            onPress={handleFavourite}
          >
            <Text style={styles.feedbackEmoji}>{isFavourited ? '❤️' : '🤍'}</Text>
            <Text style={[styles.feedbackText, isFavourited && styles.feedbackTextActive]}>
              {isFavourited ? 'Saved' : 'Favourite'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.feedbackButton} onPress={handleNotInterested}>
            <Text style={styles.feedbackEmoji}>👎</Text>
            <Text style={styles.feedbackText}>Not for me</Text>
          </TouchableOpacity>
        </View>

        {/* Next button */}
        <TouchableOpacity style={styles.nextButton} onPress={() => goNext(false)}>
          <Text style={styles.nextText}>{isLast ? '🎉  Finish Session' : 'Next  →'}</Text>
        </TouchableOpacity>

        <StretchInfoSheet
          visible={showInfo}
          onClose={() => { setShowInfo(false); setIsRunning(true); }}
          stretchId={current.id}
          stretchName={current.name}
          muscle={current.muscle}
        />

        <PauseModal
          visible={isPaused}
          stretchName={current.name}
          onResume={() => { setIsPaused(false); setIsRunning(true); }}
          onSkip={() => { setIsPaused(false); goNext(true); }}
          onQuit={() => { setIsPaused(false); Speech.stop(); router.replace('/' as any); }}
        />

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 8 },

  topBar:               { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  progressTrack:        { flex: 1, height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill:         { height: 5, backgroundColor: colors.accent, borderRadius: 3 },
  voiceToggle:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voiceEmoji:           { fontSize: 16 },

  counter:              { fontSize: 20, fontWeight: '800', color: colors.textDark, marginBottom: 14 },
  counterOf:            { fontSize: 16, fontWeight: '400', color: colors.textMid },

  card:                 { backgroundColor: colors.white, borderRadius: 28, padding: 22, marginBottom: 14, ...shadows.accent },

  nameSection:          { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  nameLeft:             { flex: 1, paddingRight: 12 },
  muscle:               { fontSize: 11, fontWeight: '700', color: colors.accent, letterSpacing: 1.8, marginBottom: 4 },
  name:                 { fontSize: 24, fontWeight: '800', color: colors.textDark, lineHeight: 28 },
  infoButton:           { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  infoIcon:             { fontSize: 14, color: colors.accent, fontWeight: '700' },

  tipHeader:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.background, borderRadius: 12, marginBottom: 0 },
  tipHeaderText:        { fontSize: 13, fontWeight: '600', color: colors.textMid },
  tipChevron:           { fontSize: 16, color: colors.textLight },
  tipBody:              { overflow: 'hidden', paddingHorizontal: 12 },
  tipText:              { fontSize: 13, color: colors.textMid, lineHeight: 20, paddingTop: 8 },

  divider:              { height: 1, backgroundColor: colors.border, marginVertical: 16 },

  timerSection:         { alignItems: 'center', paddingVertical: 8 },
  breathingCue:         { fontSize: 15, fontWeight: '600', letterSpacing: 0.5, marginTop: 8, height: 22 },
  doneText:             { color: colors.success, fontSize: 14, fontWeight: '600', marginTop: 8 },

  pauseButton:          { marginTop: 16, paddingVertical: 11, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  pauseText:            { color: colors.textMid, fontSize: 14, fontWeight: '600' },

  feedbackRow:          { flexDirection: 'row', gap: 10, marginBottom: 14 },
  feedbackButton:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  feedbackButtonActive: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  feedbackEmoji:        { fontSize: 16 },
  feedbackText:         { color: colors.textMid, fontSize: 13, fontWeight: '600' },
  feedbackTextActive:   { color: colors.accent },

  nextButton:           { backgroundColor: colors.accent, borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  nextText:             { color: colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  emptyText:            { fontSize: 16, color: colors.textMid, textAlign: 'center', marginBottom: 24, marginTop: 60 },
  backButton:           { backgroundColor: colors.accent, borderRadius: 16, padding: 18, alignItems: 'center', marginHorizontal: 24 },
  backButtonText:       { color: colors.white, fontSize: 16, fontWeight: '700' },
});