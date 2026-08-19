import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function AnimatedFlame({ size = 32, color = '#FFFFFF' }: { size?: number; color?: string }) {
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
      <Ionicons name="flame" size={size} color={color} />
    </Animated.View>
  );
}