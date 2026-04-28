import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows, shared } from '../../utils/theme';

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
              style={[styles.card, isSelected(pos.id) && shared.cardSelected]}
              onPress={() => toggle(pos.id)}
            >
              <Text style={styles.cardEmoji}>{pos.label}</Text>
              <Text style={styles.cardLabel}>{pos.name}</Text>
              <Text style={styles.cardDesc}>{pos.desc}</Text>
              {isSelected(pos.id) && (
                <View style={shared.checkCircle}>
                  <Text style={shared.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* All 3 button */}
        <TouchableOpacity
          style={[shared.secondaryButton, allSelected && styles.allButtonSelected, { marginBottom: 12 }]}
          onPress={selectAll}
        >
          <Text style={shared.secondaryButtonText}>✦  All 3 Positions</Text>
        </TouchableOpacity>

        {/* Start button */}
        {selected.length > 0 && (
          <TouchableOpacity
            style={shared.primaryButton}
            onPress={() => router.push({ pathname: '/bodypart', params: { positions: selected.join(',') } })}
          >
            <Text style={shared.primaryButtonText}>Start Stretching →</Text>
          </TouchableOpacity>
        )}

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, justifyContent: 'center' },
  heroSection:      { alignItems: 'center', marginBottom: 48 },
  question:         { fontSize: 36, fontWeight: '800', color: colors.textDark, textAlign: 'center', lineHeight: 44, marginBottom: 12 },
  subtitle:         { fontSize: 15, color: colors.textMid, textAlign: 'center' },
  cards:            { flexDirection: 'row', gap: 10, marginBottom: 14 },
  card:             { flex: 1, backgroundColor: colors.white, borderRadius: 20, paddingVertical: 28, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative', ...shadows.card },
  cardEmoji:        { fontSize: 30, marginBottom: 10 },
  cardLabel:        { fontSize: 13, fontWeight: '700', color: colors.textDark, textAlign: 'center', marginBottom: 4 },
  cardDesc:         { fontSize: 11, color: colors.textMid, textAlign: 'center' },
  allButtonSelected:{ borderColor: colors.accent, backgroundColor: colors.accentLight },
});