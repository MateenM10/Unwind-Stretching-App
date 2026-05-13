import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, gradient, shared } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🧘',
    title: 'Stretch anywhere,\nanytime',
    desc: 'On the couch, standing, or lying down — we meet you where you are.',
    accent: '#FFD4A3',
  },
  {
    emoji: '🎯',
    title: 'Focused or\nfull body',
    desc: 'Target a specific muscle group or stretch everything at once.',
    accent: '#C2D4A3',
  },
  {
    emoji: '🔥',
    title: 'Build a habit\nthat sticks',
    desc: 'Track your streak, favourite your stretches, and get daily reminders.',
    accent: '#FFBCB3',
  },
];

export default function OnboardingScreen() {
  const scrollX   = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const router = useRouter();

  const finish = async () => {
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace('/' as any);
  };

  const goNext = () => {
    if (slideIndex === SLIDES.length - 1) {
      finish();
    } else {
      const next = slideIndex + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setSlideIndex(next);
    }
  };

  // Large circle moves at 25% scroll speed — slowest, furthest back
  const bgTranslateX = scrollX.interpolate({
    inputRange: [0, width * (SLIDES.length - 1)],
    outputRange: [0, -width * (SLIDES.length - 1) * 0.25],
  });

  // Small circle moves at 45% — mid layer
  const accentTranslateX = scrollX.interpolate({
    inputRange: [0, width * (SLIDES.length - 1)],
    outputRange: [0, -width * (SLIDES.length - 1) * 0.45],
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={gradient.screen} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>

          {/* Parallax layer 1 — large soft circle, slowest */}
          <Animated.View style={[styles.parallaxLayer, { transform: [{ translateX: bgTranslateX }] }]}>
            {SLIDES.map((slide, i) => (
              <View key={i} style={[styles.parallaxSlot, { left: width * i }]}>
                <View style={[styles.circleLarge, { backgroundColor: slide.accent }]} />
              </View>
            ))}
          </Animated.View>

          {/* Parallax layer 2 — small circle, mid speed */}
          <Animated.View style={[styles.parallaxLayer, { transform: [{ translateX: accentTranslateX }] }]}>
            {SLIDES.map((slide, i) => (
              <View key={i} style={[styles.parallaxSlot, { left: width * i }]}>
                <View style={[styles.circleSmall, { backgroundColor: slide.accent }]} />
              </View>
            ))}
          </Animated.View>

          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={finish}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Slides — full speed (1x), swipeable */}
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={e => {
              setSlideIndex(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            style={styles.scrollView}
          >
            {SLIDES.map((slide, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0, 1, 0],
                extrapolate: 'clamp',
              });
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.75, 1, 0.75],
                extrapolate: 'clamp',
              });
              const emojiTranslateY = scrollX.interpolate({
                inputRange,
                outputRange: [20, 0, 20],
                extrapolate: 'clamp',
              });

              return (
                <View key={i} style={styles.slide}>
                  <Animated.Text
                    style={[styles.emoji, { transform: [{ scale }, { translateY: emojiTranslateY }] }]}
                  >
                    {slide.emoji}
                  </Animated.Text>
                  <Animated.View style={{ opacity }}>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.desc}>{slide.desc}</Text>
                  </Animated.View>
                </View>
              );
            })}
          </Animated.ScrollView>

          {/* Animated dot indicators */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const dotOpacity = scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]} />
              );
            })}
          </View>

          {/* CTA */}
          <TouchableOpacity style={[shared.primaryButton, styles.cta]} onPress={goNext}>
            <Text style={shared.primaryButtonText}>
              {slideIndex === SLIDES.length - 1 ? "Let's Go 🚀" : 'Next →'}
            </Text>
          </TouchableOpacity>

        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },

  parallaxLayer:  { position: 'absolute', top: 0, left: 0, bottom: 0, width: width * SLIDES.length },
  parallaxSlot:   { position: 'absolute', top: 0, width, height: '100%' },
  circleLarge:    {
    position: 'absolute',
    top: height * 0.08,
    alignSelf: 'center',
    left: width * 0.08,
    width: width * 0.84,
    height: width * 0.84,
    borderRadius: width * 0.42,
    opacity: 0.3,
  },
  circleSmall:    {
    position: 'absolute',
    bottom: height * 0.18,
    right: -width * 0.15,
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.225,
    opacity: 0.35,
  },

  skipButton:     { alignSelf: 'flex-end', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  skipText:       { color: colors.textLight, fontSize: 15 },

  scrollView:     { flex: 1 },
  slide:          { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  emoji:          { fontSize: 88, marginBottom: 36, textAlign: 'center' },
  title:          { fontSize: 36, fontWeight: '800', color: colors.textDark, textAlign: 'center', lineHeight: 44, marginBottom: 16, letterSpacing: -0.5 },
  desc:           { fontSize: 17, color: colors.textMid, textAlign: 'center', lineHeight: 26 },

  dots:           { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 24 },
  dot:            { height: 8, borderRadius: 4, backgroundColor: colors.accent },

  cta:            { marginHorizontal: 24, marginBottom: 24 },
});