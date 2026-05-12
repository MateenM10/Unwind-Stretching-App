import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import GradientButton from '../components/GradientButton';
import HapticButton from '../components/HapticButton';
import { colors, gradient, shadows, shared } from '../utils/theme';

const BODY_PARTS = [
  { id: 'neck',       emoji: '🙆',  name: 'Neck'       },
  { id: 'shoulders',  emoji: '💪',  name: 'Shoulders'  },
  { id: 'chest',      emoji: '❤️',  name: 'Chest'      },
  { id: 'back',       emoji: '🔄',  name: 'Back'       },
  { id: 'hips',       emoji: '🌀',  name: 'Hips'       },
  { id: 'glutes',     emoji: '🍑',  name: 'Glutes'     },
  { id: 'quads',      emoji: '🦵',  name: 'Quads'      },
  { id: 'hamstrings', emoji: '🦵',  name: 'Hamstrings' },
  { id: 'calves',     emoji: '🦶',  name: 'Calves'     },
  { id: 'ankles',     emoji: '🔁',  name: 'Ankles'     },
];

function BodyPartCard({ part, isSelected, onPress }: {
  part: typeof BODY_PARTS[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <HapticButton
        haptic="light"
        style={[
          styles.gridCard,
          {
            borderColor: isSelected ? colors.accent : 'transparent',
            backgroundColor: isSelected ? colors.accentLight : colors.white,
          },
        ]}
        onPress={handlePress}
      >
        <Text style={styles.gridEmoji}>{part.emoji}</Text>
        <Text style={[styles.gridName, { color: isSelected ? colors.accent : colors.textDark }]}>
          {part.name}
        </Text>
        <View style={[styles.checkCircle, { opacity: isSelected ? 1 : 0 }]}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      </HapticButton>
    </Animated.View>
  );
}

export default function BodyPartPicker() {
  const { positions } = useLocalSearchParams<{ positions: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const selectAll   = () => setSelected(BODY_PARTS.map(p => p.id));
  const allSelected = selected.length === BODY_PARTS.length;
  const isSelected  = (id: string) => selected.includes(id);

  const handleStart = () => router.push({
    pathname: '/session',
    params: { positions, bodyPart: selected.join(',') },
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={gradient.screen} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>

          <View style={styles.heroSection}>
            <Text style={shared.heroTitle}>Any Focus Today?</Text>
            <Text style={shared.subtitle}>Pick one or more areas, or select all</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {BODY_PARTS.map(part => (
                <BodyPartCard
                  key={part.id}
                  part={part}
                  isSelected={isSelected(part.id)}
                  onPress={() => toggle(part.id)}
                />
              ))}
            </View>

            <HapticButton
              haptic="light"
              style={[
                styles.allButton,
                {
                  borderColor: allSelected ? colors.accent : colors.border,
                  backgroundColor: allSelected ? colors.accentLight : 'transparent',
                }
              ]}
              onPress={allSelected ? () => setSelected([]) : selectAll}
            >
              <Text style={styles.allButtonText}>
                {allSelected ? '✦  Deselect All' : '✦  Select All Areas'}
              </Text>
            </HapticButton>

            <View style={{ height: 100 }} />
          </ScrollView>

          {selected.length > 0 && (
            <View style={shared.floatingWrapper}>
              <GradientButton
                label={`Start Stretching${selected.length > 1 ? ` (${selected.length} areas)` : ''} →`}
                haptic="medium"
                onPress={handleStart}
              />
            </View>
          )}

        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: 24 },
  heroSection:  { alignItems: 'center', marginBottom: 28 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  cardWrapper:  { width: '47.5%' },
  gridCard:     { borderRadius: 16, paddingVertical: 24, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, position: 'relative', ...shadows.card },
  gridEmoji:    { fontSize: 30, marginBottom: 8 },
  gridName:     { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  checkCircle:  { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  checkMark:    { color: colors.white, fontSize: 11, fontWeight: '700' },
  allButton:    { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, alignItems: 'center' },
  allButtonText:{ fontSize: 15, fontWeight: '600', color: colors.accent },
});