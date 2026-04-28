import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../utils/theme';

interface Props {
  timeLeft: number;
  isRunning: boolean;
  isBreathingIn: boolean;
}

export default function PulsingTimer({ timeLeft, isRunning, isBreathingIn }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!isRunning) {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.4);
      return;
    }

    const duration = 4000;

    if (isBreathingIn) {
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.2,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isBreathingIn, isRunning]);

  return (
    <View style={styles.wrapper}>

      {/* Outer pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />

      {/* Middle ring */}
      <Animated.View
        style={[
          styles.middleRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: Animated.multiply(opacityAnim, 0.6),
          },
        ]}
      />

      {/* Timer circle */}
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{timeLeft}</Text>
        <Text style={styles.timerLabel}>secs</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:      { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  pulseRing:    { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 3, borderColor: colors.accent, backgroundColor: 'transparent' },
  middleRing:   { position: 'absolute', width: 155, height: 155, borderRadius: 78, borderWidth: 2, borderColor: colors.accent, backgroundColor: 'transparent' },
  timerCircle:  { width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: colors.accent, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  timerText:    { color: colors.textDark, fontSize: 46, fontWeight: '800', lineHeight: 52 },
  timerLabel:   { color: colors.textMid, fontSize: 12 },
});