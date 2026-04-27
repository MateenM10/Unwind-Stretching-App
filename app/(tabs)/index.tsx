import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity } from 'react-native';

const positions = [
  { id: 'couch',    label: '🛋️  On the Couch',  desc: 'Seated stretches' },
  { id: 'standing', label: '🧍 Standing',        desc: 'Upright stretches' },
  { id: 'lying',    label: '🛏️  Lying Down',     desc: 'Floor stretches' },
];

export default function PositionPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkOnboarded = async () => {
      const onboarded = await AsyncStorage.getItem('onboarded');
      if (!onboarded) {
        router.replace('/onboarding' as any);
      }
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
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>How do you want{'\n'}to stretch?</Text>
        <Text style={styles.subtitle}>Pick one or more positions</Text>

        {positions.map(pos => (
          <TouchableOpacity
            key={pos.id}
            style={[styles.card, isSelected(pos.id) && styles.cardSelected]}
            onPress={() => toggle(pos.id)}
          >
            <Text style={styles.cardLabel}>{pos.label}</Text>
            <Text style={styles.cardDesc}>{pos.desc}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.allButton, allSelected && styles.allButtonSelected]}
          onPress={selectAll}
        >
          <Text style={styles.allButtonText}>✦  All 3 Positions</Text>
        </TouchableOpacity>

        {selected.length > 0 && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push({ pathname: '/bodypart', params: { positions: selected.join(',') } })}
          >
            <Text style={styles.startText}>Start Stretching →</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#FAF7F2', padding: 24, justifyContent: 'center' },
  title:             { fontSize: 28, fontWeight: '700', color: '#2C2416', marginBottom: 6, lineHeight: 36 },
  subtitle:          { fontSize: 15, color: '#9B8573', marginBottom: 32 },
  card:              { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', shadowColor: '#C9A96E', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardSelected:      { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  cardLabel:         { fontSize: 18, fontWeight: '600', color: '#2C2416' },
  cardDesc:          { fontSize: 13, color: '#9B8573', marginTop: 4 },
  allButton:         { borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 2, borderColor: '#EDE5D8', alignItems: 'center' },
  allButtonSelected: { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  allButtonText:     { fontSize: 16, fontWeight: '600', color: '#C9A96E' },
  startButton:       { backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  startText:         { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});