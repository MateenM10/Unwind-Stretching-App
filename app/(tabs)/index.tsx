import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const positions = [
  { id: 'couch',    label: '🛋️',  name: 'On the Couch',  desc: 'Seated stretches'  },
  { id: 'standing', label: '🧍',  name: 'Standing',      desc: 'Upright stretches' },
  { id: 'lying',    label: '🛏️',  name: 'Lying Down',    desc: 'Floor stretches'   },
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

        {/* Hero title */}
        <View style={styles.heroSection}>
          <Text style={styles.question}>Where Are You{'\n'}Right Now?</Text>
          <Text style={styles.subtitle}>Pick one or more positions to get started</Text>
        </View>

        {/* Position cards */}
        <View style={styles.cards}>
          {positions.map(pos => (
            <TouchableOpacity
              key={pos.id}
              style={[styles.card, isSelected(pos.id) && styles.cardSelected]}
              onPress={() => toggle(pos.id)}
            >
              <Text style={styles.cardEmoji}>{pos.label}</Text>
              <Text style={styles.cardLabel}>{pos.name}</Text>
              <Text style={styles.cardDesc}>{pos.desc}</Text>
              {isSelected(pos.id) && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* All 3 button */}
        <TouchableOpacity
          style={[styles.allButton, allSelected && styles.allButtonSelected]}
          onPress={selectAll}
        >
          <Text style={styles.allButtonText}>✦  All 3 Positions</Text>
        </TouchableOpacity>

        {/* Start button */}
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
  heroSection:       { alignItems: 'center', marginBottom: 36 },
  question:          { fontSize: 36, fontWeight: '800', color: '#2C2416', textAlign: 'center', lineHeight: 44, marginBottom: 10 },
  subtitle:          { fontSize: 15, color: '#9B8573', textAlign: 'center' },
  cards:             { flexDirection: 'row', gap: 10, marginBottom: 14 },
  card:              { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 24, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1, position: 'relative' },
  cardSelected:      { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  cardEmoji:         { fontSize: 28, marginBottom: 8 },
  cardLabel:         { fontSize: 13, fontWeight: '700', color: '#2C2416', textAlign: 'center', marginBottom: 4 },
  cardDesc:          { fontSize: 11, color: '#9B8573', textAlign: 'center' },
  checkCircle:       { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#C9A96E', alignItems: 'center', justifyContent: 'center' },
  checkMark:         { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  allButton:         { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#EDE5D8', alignItems: 'center' },
  allButtonSelected: { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  allButtonText:     { fontSize: 15, fontWeight: '600', color: '#C9A96E' },
  startButton:       { backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#C9A96E', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  startText:         { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});