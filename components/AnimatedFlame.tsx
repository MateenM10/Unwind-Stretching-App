import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export default function AnimatedFlame({ size = 32 }: { size?: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text style={[styles.flame, { fontSize: size }]}>🔥</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flame: { textAlign: 'center' },
});