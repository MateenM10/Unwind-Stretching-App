import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const positions = [
  { id: 'couch',    label: '🛋️  On the Couch',  desc: 'Seated stretches' },
  { id: 'standing', label: '🧍 Standing',        desc: 'Upright stretches' },
  { id: 'lying',    label: '🛏️  Lying Down',     desc: 'Floor stretches' },
];

export default function PositionPicker() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelected(positions.map(p => p.id));

  const isSelected = (id: string) => selected.includes(id);
  const allSelected = selected.length === positions.length;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>How do you want to stretch?</Text>
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
        <Text style={styles.allButtonText}>✦ All 3 Positions</Text>
      </TouchableOpacity>

      {selected.length > 0 && (
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startText}>Start Stretching →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0f0f0f', padding: 24, justifyContent: 'center' },
  title:              { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle:           { fontSize: 15, color: '#888', marginBottom: 32 },
  card:               { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  cardSelected:       { borderColor: '#a78bfa' },
  cardLabel:          { fontSize: 18, fontWeight: '600', color: '#fff' },
  cardDesc:           { fontSize: 13, color: '#888', marginTop: 4 },
  allButton:          { borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 2, borderColor: '#444', alignItems: 'center' },
  allButtonSelected:  { borderColor: '#a78bfa', backgroundColor: '#1a1a1a' },
  allButtonText:      { fontSize: 16, fontWeight: '600', color: '#a78bfa' },
  startButton:        { backgroundColor: '#a78bfa', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  startText:          { fontSize: 17, fontWeight: '700', color: '#fff' },
});