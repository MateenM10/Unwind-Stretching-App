import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelected(BODY_PARTS.map(p => p.id));
  const allSelected = selected.length === BODY_PARTS.length;
  const isSelected = (id: string) => selected.includes(id);

  const handleStart = () => {
    router.push({
      pathname: '/session',
      params: { positions, bodyPart: selected.join(',') },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      <SafeAreaView style={styles.container}>

        <View style={styles.heroSection}>
          <Text style={styles.title}>Any Focus Today?</Text>
          <Text style={styles.subtitle}>Pick one or more areas, or select all</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* 2-column grid */}
          <View style={styles.grid}>
            {BODY_PARTS.map(part => (
              <TouchableOpacity
                key={part.id}
                style={[styles.gridCard, isSelected(part.id) && styles.gridCardSelected]}
                onPress={() => toggle(part.id)}
              >
                <Text style={styles.gridEmoji}>{part.emoji}</Text>
                <Text style={[styles.gridName, isSelected(part.id) && styles.gridNameSelected]}>
                  {part.name}
                </Text>
                {isSelected(part.id) && (
                  <View style={styles.gridCheck}>
                    <Text style={styles.gridCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Select all / Deselect all */}
          <TouchableOpacity
            style={[styles.allButton, allSelected && styles.allButtonSelected]}
            onPress={allSelected ? () => setSelected([]) : selectAll}
          >
            <Text style={styles.allButtonText}>
              {allSelected ? '✦  Deselect All' : '✦  Select All Areas'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating start button */}
        {selected.length > 0 && (
          <View style={styles.startWrapper}>
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startText}>
                Start Stretching{selected.length > 1 ? ` (${selected.length} areas)` : ''} →
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#FAF7F2', padding: 24 },
  heroSection:       { alignItems: 'center', marginBottom: 28 },
  title:             { fontSize: 32, fontWeight: '800', color: '#2C2416', textAlign: 'center', marginBottom: 8 },
  subtitle:          { fontSize: 15, color: '#9B8573', textAlign: 'center' },
  grid:              { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  gridCard:          { width: '47.5%', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 24, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1, position: 'relative' },
  gridCardSelected:  { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  gridEmoji:         { fontSize: 30, marginBottom: 8 },
  gridName:          { fontSize: 14, fontWeight: '600', color: '#2C2416', textAlign: 'center' },
  gridNameSelected:  { color: '#C9A96E' },
  gridCheck:         { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#C9A96E', alignItems: 'center', justifyContent: 'center' },
  gridCheckText:     { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  allButton:         { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#EDE5D8', alignItems: 'center' },
  allButtonSelected: { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  allButtonText:     { fontSize: 15, fontWeight: '600', color: '#C9A96E' },
  startWrapper:      { position: 'absolute', bottom: 24, left: 24, right: 24 },
  startButton:       { backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#C9A96E', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  startText:         { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});