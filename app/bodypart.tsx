import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BODY_PARTS = [
  { id: 'neck',       label: '🙆',  name: 'Neck'       },
  { id: 'shoulders',  label: '💪',  name: 'Shoulders'  },
  { id: 'chest',      label: '❤️',  name: 'Chest'      },
  { id: 'back',       label: '🔄',  name: 'Back'       },
  { id: 'hips',       label: '🌀',  name: 'Hips'       },
  { id: 'quads',      label: '🦵',  name: 'Quads'      },
  { id: 'hamstrings', label: '🦵',  name: 'Hamstrings' },
  { id: 'calves',     label: '🦶',  name: 'Calves'     },
  { id: 'ankles',     label: '🔁',  name: 'Ankles'     },
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

        {/* General — full width at top */}
        <TouchableOpacity style={styles.generalButton} onPress={handleGeneral}>
          <Text style={styles.generalEmoji}>✨</Text>
          <View>
            <Text style={styles.generalLabel}>General</Text>
            <Text style={styles.generalDesc}>Stretch everything</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>OR PICK YOUR FOCUS</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 2-column grid */}
          <View style={styles.grid}>
            {BODY_PARTS.map(part => (
              <TouchableOpacity
                key={part.id}
                style={[styles.gridCard, isSelected(part.id) && styles.gridCardSelected]}
                onPress={() => toggle(part.id)}
              >
                <Text style={styles.gridEmoji}>{part.label}</Text>
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

          {/* Select all */}
          <TouchableOpacity
            style={[styles.allButton, allSelected && styles.allButtonSelected]}
            onPress={selectAll}
          >
            <Text style={styles.allButtonText}>✦  Select All Areas</Text>
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
  title:             { fontSize: 26, fontWeight: '700', color: '#2C2416', marginBottom: 4 },
  subtitle:          { fontSize: 14, color: '#9B8573', marginBottom: 20 },
  generalButton:     { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, borderWidth: 2, borderColor: '#C9A96E', marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#C9A96E', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  generalEmoji:      { fontSize: 28 },
  generalLabel:      { fontSize: 16, fontWeight: '700', color: '#C9A96E' },
  generalDesc:       { fontSize: 13, color: '#9B8573', marginTop: 2 },
  sectionLabel:      { fontSize: 11, fontWeight: '700', color: '#C4B5A5', letterSpacing: 1.5, marginBottom: 14 },
  grid:              { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  gridCard:          { width: '47.5%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1, position: 'relative' },
  gridCardSelected:  { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  gridEmoji:         { fontSize: 30, marginBottom: 8 },
  gridName:          { fontSize: 15, fontWeight: '600', color: '#2C2416' },
  gridNameSelected:  { color: '#C9A96E' },
  gridCheck:         { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#C9A96E', alignItems: 'center', justifyContent: 'center' },
  gridCheckText:     { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  allButton:         { borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#EDE5D8', alignItems: 'center', marginBottom: 12 },
  allButtonSelected: { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  allButtonText:     { fontSize: 15, fontWeight: '600', color: '#C9A96E' },
  startWrapper:      { position: 'absolute', bottom: 24, left: 24, right: 24 },
  startButton:       { backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#C9A96E', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  startText:         { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});