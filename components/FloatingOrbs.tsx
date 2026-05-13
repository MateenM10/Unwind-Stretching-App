import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { height } = Dimensions.get('window');

type OrbConfig = {
  size: number;
  top: `${number}%`;
  left?: `${number}%`;
  right?: `${number}%`;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
};

const ORBS: OrbConfig[] = [
  { size: 180, top: '8%',  left:  '0%',  color: '#E8924A', opacity: 0.07, duration: 4200, delay: 0    },
  { size: 120, top: '18%', right: '0%',  color: '#C9A96E', opacity: 0.08, duration: 5100, delay: 800  },
  { size: 90,  top: '35%', left:  '20%', color: '#E8924A', opacity: 0.05, duration: 3800, delay: 1600 },
  { size: 140, top: '5%',  left:  '40%', color: '#C9A96E', opacity: 0.06, duration: 4700, delay: 400  },
];

function Orb({ size, top, left, right, color, opacity, duration, delay }: OrbConfig) {
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(opacity * 0.7)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -14,      duration, delay,  useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0,        duration, delay: 0, useNativeDriver: true }),
      ])
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: opacity,       duration: duration * 0.8, delay,  useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: opacity * 0.6, duration: duration * 0.8, delay: 0, useNativeDriver: true }),
      ])
    );
    float.start();
    pulse.start();
    return () => { float.stop(); pulse.stop(); };
  }, []);

  return (
    <Animated.View
      style={{
        position:        'absolute',
        width:           size,
        height:          size,
        borderRadius:    size / 2,
        backgroundColor: color,
        top,
        left,
        right,
        opacity:         fadeAnim,
        transform:       [{ translateY }],
      }}
    />
  );
}

export default function FloatingOrbs() {
  return (
    <View style={styles.container} pointerEvents="none">
      {ORBS.map((orb, i) => <Orb key={i} {...orb} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55 },
});