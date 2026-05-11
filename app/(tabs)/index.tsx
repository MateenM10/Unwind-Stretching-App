import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import GradientButton from '../../components/GradientButton';
import HapticButton from '../../components/HapticButton';
import { colors, shadows } from '../../utils/theme';

const positions = [
  { id: 'couch',    label: '🛋️',  name: 'On the Couch',  desc: 'Seated stretches'  },
  { id: 'standing', label: '🧍',  name: 'Standing',      desc: 'Upright stretches' },
  { id: 'lying',    label: '🛏️',  name: 'Lying Down',    desc: 'Floor stretches'   },
];

function PositionCard({ pos, isSelected, onPress }: {
  pos: typeof positions[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <HapticButton
        haptic="light"
        style={[styles.card, { borderColor: isSelected ? colors.accent : 'transparent', backgroundColor: isSelected ? colors.accentLight : colors.white }]}
        onPress={handlePress}
      >
        <Text style={styles.cardEmoji}>{pos.label}</Text>
        <Text style={[styles.cardLabel, { color: isSelected ? colors.accent : colors.textDark }]}>{pos.name}</Text>
        <Text style={styles.cardDesc}>{pos.desc}</Text>
        {/* Always rendered — just invisible when unselected */}
        <View style={[styles.checkCircle, { opacity: isSelected ? 1 : 0 }]}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      </HapticButton>
    </Animated.View>
  );
}

export default function PositionPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkOnboarded = async () => {
      const onboarded = await AsyncStorage.getItem('onboarded');
      if (!onboarded) router.replace('/onboarding' as any);
    };
    checkOnboarded();
  }, []);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelected(positions.map(p => p.id));
  const isSelected = (id: string) => selected.includes(id);
  const allSelected = selected.length === positions.length;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.container}>

        <View style={styles.heroSection}>
          <Text style={styles.question}>Where Are You{'\n'}Right Now?</Text>
          <Text style={styles.subtitle}>Pick one or more positions to get started</Text>
        </View>

        <View style={styles.cards}>
          {positions.map(pos => (
            <PositionCard
              key={pos.id}
              pos={pos}
              isSelected={isSelected(pos.id)}
              onPress={() => toggle(pos.id)}
            />
          ))}
        </View>

        <HapticButton
          haptic="light"
          style={[styles.allButton, { borderColor: allSelected ? colors.accent : colors.border, backgroundColor: allSelected ? colors.accentLight : 'transparent' }]}
          onPress={selectAll}
        >
          <Text style={[styles.allButtonText, { color: colors.accent }]}>✦  All 3 Positions</Text>
        </HapticButton>

        {selected.length > 0 && (
          <GradientButton
            label="Start Stretching →"
            haptic="medium"
            onPress={() => router.push({ pathname: '/bodypart', params: { positions: selected.join(',') } })}
          />
        )}

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, justifyContent: 'center' },
  heroSection:   { alignItems: 'center', marginBottom: 48 },
  question:      { fontSize: 36, fontWeight: '800', color: colors.textDark, textAlign: 'center', lineHeight: 44, marginBottom: 12 },
  subtitle:      { fontSize: 15, color: colors.textMid, textAlign: 'center' },
  cards:         { flexDirection: 'row', gap: 10, marginBottom: 14 },
  cardWrapper:   { flex: 1 },
  card:          { borderRadius: 20, paddingVertical: 28, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, position: 'relative', ...shadows.card },
  cardEmoji:     { fontSize: 30, marginBottom: 10 },
  cardLabel:     { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  cardDesc:      { fontSize: 11, color: colors.textMid, textAlign: 'center' },
  checkCircle:   { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  checkMark:     { color: colors.white, fontSize: 11, fontWeight: '700' },
  allButton:     { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, alignItems: 'center' },
  allButtonText: { fontSize: 15, fontWeight: '600' },
});