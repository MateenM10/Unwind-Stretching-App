import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../utils/theme';

interface Props {
  stretchId: string;
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  isBreathingIn: boolean;
}

const SIZE = 150;
const STROKE = 6;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function PulsingTimer({ stretchId, timeLeft, totalDuration, isRunning, isBreathingIn }: Props) {
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const opacityAnim  = useRef(new Animated.Value(0.4)).current;
  const arcAnim      = useRef(new Animated.Value(1)).current;
  const colorAnim    = useRef(new Animated.Value(0)).current;
  const arcAnimRef   = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const startArc = (duration: number, fromProgress: number) => {
    arcAnimRef.current?.stop();
    arcAnim.setValue(fromProgress);
    arcAnimRef.current = Animated.timing(arcAnim, {
      toValue: 0,
      duration: duration * 1000,
      useNativeDriver: false,
    });
    arcAnimRef.current.start();
  };

  // Reset fully when stretch changes
  useEffect(() => {
    arcAnimRef.current?.stop();
    arcAnim.setValue(1);
    colorAnim.setValue(0);
    if (isRunning) {
      startArc(totalDuration, 1);
    }
  }, [stretchId]);

  // Handle pause/resume
  useEffect(() => {
    if (isRunning) {
      const currentProgress = timeLeft / totalDuration;
      startArc(timeLeft, currentProgress);
    } else {
      arcAnimRef.current?.stop();
    }
  }, [isRunning]);

  // Urgency color
  useEffect(() => {
    const progress = totalDuration > 0 ? timeLeft / totalDuration : 1;
    Animated.timing(colorAnim, {
      toValue: progress < 0.25 ? 1 : 0,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  // Breathing pulse — freezes in place when paused
  useEffect(() => {
    pulseAnimRef.current?.stop();
    if (!isRunning) return;

    const anim = Animated.parallel([
      Animated.timing(pulseAnim, {
        toValue: isBreathingIn ? 1.1 : 1.0,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isBreathingIn ? 0.7 : 0.2,
        duration: 4000,
        useNativeDriver: true,
      }),
    ]);
    pulseAnimRef.current = anim;
    anim.start();
  }, [isBreathingIn, isRunning]);

  const strokeDashoffset = arcAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const arcColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.accent, '#E05A5A'],
  });

  const isAlmostDone = totalDuration > 0 && timeLeft / totalDuration < 0.25;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[
        styles.pulseRing,
        {
          transform: [{ scale: pulseAnim }],
          opacity: opacityAnim,
          borderColor: isAlmostDone ? '#E05A5A' : colors.accent,
        },
      ]} />

      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          stroke={colors.border}
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          stroke={arcColor as any}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={[styles.timerText, isAlmostDone && styles.timerTextUrgent]}>
          {timeLeft}
        </Text>
        <Text style={styles.timerLabel}>secs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:         { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  pulseRing:       { position: 'absolute', width: SIZE + 18, height: SIZE + 18, borderRadius: (SIZE + 18) / 2, borderWidth: 2, borderColor: colors.accent },
  svg:             { position: 'absolute' },
  center:          { alignItems: 'center', justifyContent: 'center' },
  timerText:       { color: colors.textDark, fontSize: 42, fontWeight: '800', lineHeight: 48 },
  timerTextUrgent: { color: '#E05A5A' },
  timerLabel:      { color: colors.textMid, fontSize: 12 },
});