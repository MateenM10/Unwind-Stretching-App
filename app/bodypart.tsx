import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BODY_PARTS = [
  { id: 'neck',       label: '🙆  Neck'       },
  { id: 'shoulders',  label: '💪  Shoulders'  },
  { id: 'chest',      label: '❤️  Chest'       },
  { id: 'back',       label: '🔄  Back'        },
  { id: 'hips',       label: '🌀  Hips'        },
  { id: 'quads',      label: '🦵  Quads'       },
  { id: 'hamstrings', label: '🦵  Hamstrings'  },
  { id: 'calves',     label: '🦶  Calves'      },
  { id: 'ankles',     label: '🔁  Ankles'      },
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

  const handleGeneral = () => {
    router.push({
      pathname: '/session',
      params: { positions, bodyPart: 'general' },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Any focus today?</Text>
        <Text style={styles.subtitle}>Pick one or more areas, or go general</Text>

        {/* General button */}
        <TouchableOpacity style={styles.generalButton} onPress={handleGeneral}>
          <Text style={styles.generalLabel}>✦  General — stretch everything</Text>
        </TouchableOpacity>

        <Text style={styles.divider}>— or focus on —</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Body part cards */}
          {BODY_PARTS.map(part => (
            <TouchableOpacity
              key={part.id}
              style={[styles.card, isSelected(part.id) && styles.cardSelected]}
              onPress={() => toggle(part.id)}
            >
              <Text style={styles.cardLabel}>{part.label}</Text>
              {isSelected(part.id) && <Text style={styles.tick}>✓</Text>}
            </TouchableOpacity>
          ))}

          {/* Select all */}
          <TouchableOpacity
            style={[styles.allButton, allSelected && styles.allButtonSelected]}
            onPress={selectAll}
          >
            <Text style={styles.allButtonText}>✦  Select All Body Parts</Text>
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
  container:        { flex: 1, backgroundColor: '#FAF7F2', padding: 24 },
  title:            { fontSize: 28, fontWeight: '700', color: '#2C2416', marginBottom: 6 },
  subtitle:         { fontSize: 15, color: '#9B8573', marginBottom: 20 },
  generalButton:    { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: '#C9A96E', marginBottom: 20, alignItems: 'center', shadowColor: '#C9A96E', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  generalLabel:     { fontSize: 16, fontWeight: '600', color: '#C9A96E' },
  divider:          { color: '#C4B5A5', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  card:             { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1, borderWidth: 2, borderColor: 'transparent' },
  cardSelected:     { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  cardLabel:        { fontSize: 17, fontWeight: '500', color: '#2C2416' },
  tick:             { fontSize: 16, color: '#C9A96E', fontWeight: '700' },
  allButton:        { borderRadius: 16, padding: 18, marginTop: 4, borderWidth: 2, borderColor: '#EDE5D8', alignItems: 'center' },
  allButtonSelected:{ borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  allButtonText:    { fontSize: 15, fontWeight: '600', color: '#C9A96E' },
  startWrapper:     { position: 'absolute', bottom: 24, left: 24, right: 24 },
  startButton:      { backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#C9A96E', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  startText:        { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});