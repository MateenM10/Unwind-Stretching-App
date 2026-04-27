import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SLIDES = [
  {
    emoji: '🧘',
    title: 'Stretch anywhere,\nanytime',
    desc: 'On the couch, standing, or lying down — we meet you where you are.',
  },
  {
    emoji: '🎯',
    title: 'Focused or\nfull body',
    desc: 'Target a specific muscle group or stretch everything at once.',
  },
  {
    emoji: '🔥',
    title: 'Build a habit\nthat sticks',
    desc: 'Track your streak, favourite your stretches, and get daily reminders.',
  },
];

export default function OnboardingScreen() {
  const [slideIndex, setSlideIndex] = useState(0);
  const router = useRouter();
  const isLast = slideIndex === SLIDES.length - 1;
  const slide = SLIDES[slideIndex];

  const handleNext = async () => {
    if (isLast) {
      await AsyncStorage.setItem('onboarded', 'true');
      router.replace('/' as any);
    } else {
      setSlideIndex(i => i + 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace('/' as any);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      <SafeAreaView style={styles.container}>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.slideContent}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.desc}>{slide.desc}</Text>
        </View>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === slideIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>{isLast ? "Let's Go 🚀" : 'Next →'}</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FAF7F2', padding: 24, justifyContent: 'space-between' },
  skipButton:   { alignSelf: 'flex-end', padding: 8 },
  skipText:     { color: '#C4B5A5', fontSize: 15 },
  slideContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  emoji:        { fontSize: 80, marginBottom: 32 },
  title:        { fontSize: 34, fontWeight: '700', color: '#2C2416', textAlign: 'center', lineHeight: 42, marginBottom: 16 },
  desc:         { fontSize: 17, color: '#9B8573', textAlign: 'center', lineHeight: 26 },
  dots:         { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EDE5D8' },
  dotActive:    { backgroundColor: '#C9A96E', width: 24 },
  nextButton:   { backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 16 },
  nextText:     { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});