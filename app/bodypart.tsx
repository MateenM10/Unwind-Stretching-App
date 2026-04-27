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
    router.push({
      pathname: '/duration',
      params: { positions, bodyPart },
    });
  };

  const handleGeneral = () => {
    router.push({
      pathname: '/duration',
      params: { positions, bodyPart: 'general' },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
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
  container:     { flex: 1, backgroundColor: '#FAF7F2', padding: 24 },
  title:         { fontSize: 28, fontWeight: '700', color: '#2C2416', marginBottom: 6 },
  subtitle:      { fontSize: 15, color: '#9B8573', marginBottom: 20 },
  generalButton: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: '#C9A96E', marginBottom: 20, alignItems: 'center', shadowColor: '#C9A96E', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  generalLabel:  { fontSize: 16, fontWeight: '600', color: '#C9A96E' },
  divider:       { color: '#C4B5A5', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  card:          { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  cardLabel:     { fontSize: 17, fontWeight: '500', color: '#2C2416' },
  arrow:         { fontSize: 22, color: '#C4B5A5' },
});