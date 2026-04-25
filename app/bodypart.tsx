import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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

  const handleSelect = (bodyPart: string) => {
    router.push({ pathname: '/session', params: { positions, bodyPart } });
  };

  const handleGeneral = () => {
    router.push({ pathname: '/session', params: { positions, bodyPart: 'general' } });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Any focus today?</Text>
        <Text style={styles.subtitle}>Pick one area, or go general</Text>

        <TouchableOpacity style={styles.generalButton} onPress={handleGeneral}>
          <Text style={styles.generalLabel}>✦  General — stretch everything</Text>
        </TouchableOpacity>

        <Text style={styles.divider}>— or focus on —</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {BODY_PARTS.map(part => (
            <TouchableOpacity
              key={part.id}
              style={styles.card}
              onPress={() => handleSelect(part.id)}
            >
              <Text style={styles.cardLabel}>{part.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0f0f0f', padding: 24 },
  title:         { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle:      { fontSize: 15, color: '#888', marginBottom: 20 },
  generalButton: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: '#a78bfa', marginBottom: 20, alignItems: 'center' },
  generalLabel:  { fontSize: 16, fontWeight: '600', color: '#a78bfa' },
  divider:       { color: '#444', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  card:          { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel:     { fontSize: 17, fontWeight: '500', color: '#fff' },
  arrow:         { fontSize: 22, color: '#555' },
});