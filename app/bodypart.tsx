import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import GradientButton from '../components/GradientButton';
import HapticButton from '../components/HapticButton';
import { colors, shadows, shared } from '../utils/theme';

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

export default function BodyPartPicker() {
  const { positions } = useLocalSearchParams<{ positions: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const selectAll = () => setSelected(BODY_PARTS.map(p => p.id));
  const allSelected = selected.length === BODY_PARTS.length;
  const isSelected = (id: string) => selected.includes(id);

  const handleStart = () => router.push({
    pathname: '/session',
    params: { positions, bodyPart: selected.join(',') },
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={shared.screen}>

        <View style={styles.heroSection}>
          <Text style={shared.heroTitle}>Any Focus Today?</Text>
          <Text style={shared.subtitle}>Pick one or more areas, or select all</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {BODY_PARTS.map(part => (
              <HapticButton
                key={part.id}
                haptic="light"
                style={[styles.gridCard, isSelected(part.id) && styles.gridCardSelected]}
                onPress={() => toggle(part.id)}
              >
                <Text style={styles.gridEmoji}>{part.emoji}</Text>
                <Text style={[styles.gridName, isSelected(part.id) && styles.gridNameSelected]}>
                  {part.name}
                </Text>
                {isSelected(part.id) && (
                  <View style={shared.checkCircle}>
                    <Text style={shared.checkMark}>✓</Text>
                  </View>
                )}
              </HapticButton>
            ))}
          </View>

          <HapticButton
            haptic="light"
            style={[shared.secondaryButton, allSelected && styles.allButtonSelected, { marginBottom: 12 }]}
            onPress={allSelected ? () => setSelected([]) : selectAll}
          >
            <Text style={shared.secondaryButtonText}>
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
    </>
  );
}

const styles = StyleSheet.create({
  heroSection:       { alignItems: 'center', marginBottom: 28 },
  grid:              { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  gridCard:          { width: '47.5%', backgroundColor: colors.white, borderRadius: 16, paddingVertical: 24, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative', ...shadows.card },
  gridCardSelected:  { borderColor: colors.accent, backgroundColor: colors.accentLight },
  gridEmoji:         { fontSize: 30, marginBottom: 8 },
  gridName:          { fontSize: 14, fontWeight: '600', color: colors.textDark, textAlign: 'center' },
  gridNameSelected:  { color: colors.accent },
  allButtonSelected: { borderColor: colors.accent, backgroundColor: colors.accentLight },
});