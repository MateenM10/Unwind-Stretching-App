import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DURATIONS = [
  { id: '5',  label: '5 min',    desc: 'Quick reset',        emoji: '⚡' },
  { id: '10', label: '10 min',   desc: 'Solid session',      emoji: '🔥' },
  { id: '15', label: '15 min',   desc: 'Deep stretch',       emoji: '🧘' },
  { id: '0',  label: 'No limit', desc: 'Do every stretch',   emoji: '♾️' },
];

export default function DurationPicker() {
  const { positions, bodyPart, feeling } = useLocalSearchParams<{
    positions: string;
    bodyPart: string;
    feeling: string;
  }>();
  const router = useRouter();

  const handleSelect = (minutes: string) => {
    router.push({
      pathname: '/session',
      params: { positions, bodyPart, minutes, feeling },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      <SafeAreaView style={styles.container}>

        <Text style={styles.title}>How long do{'\n'}you have?</Text>
        <Text style={styles.subtitle}>We'll pick the right number of stretches</Text>

        <View style={styles.cards}>
          {DURATIONS.map(d => (
            <TouchableOpacity
              key={d.id}
              style={styles.card}
              onPress={() => handleSelect(d.id)}
            >
              <Text style={styles.cardEmoji}>{d.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{d.label}</Text>
                <Text style={styles.cardDesc}>{d.desc}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2', padding: 24, justifyContent: 'center' },
  title:     { fontSize: 28, fontWeight: '700', color: '#2C2416', marginBottom: 6, lineHeight: 36 },
  subtitle:  { fontSize: 15, color: '#9B8573', marginBottom: 32 },
  cards:     { gap: 12 },
  card:      { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  cardEmoji: { fontSize: 28, marginRight: 16 },
  cardText:  { flex: 1 },
  cardLabel: { fontSize: 18, fontWeight: '700', color: '#2C2416', marginBottom: 2 },
  cardDesc:  { fontSize: 13, color: '#9B8573' },
  arrow:     { fontSize: 22, color: '#C4B5A5' },
});