import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../utils/theme';

const SHEET_HEIGHT = 420;

interface Props {
  visible: boolean;
  stretchName: string;
  onResume: () => void;
  onSkip: () => void;
  onQuit: () => void;
}

export default function PauseModal({ visible, stretchName, onResume, onSkip, onQuit }: Props) {
  const slideAnim    = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SHEET_HEIGHT);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Animate down then fire callback
  const slideDown = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => callback());
  };

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    slideDown(onResume);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    slideDown(onSkip);
  };

  const handleQuit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    slideDown(onQuit);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleResume}>
      <View style={styles.container}>

        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        </Animated.View>

        <TouchableOpacity style={styles.backdropTap} onPress={handleResume} activeOpacity={1} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>

          <View style={styles.handle} />

          <View style={styles.iconRow}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </View>

          <Text style={styles.title}>Paused</Text>
          <Text style={styles.stretchName}>{stretchName}</Text>
          <Text style={styles.hint}>Take your time — we'll be here</Text>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
            <Text style={styles.resumeText}>▶  Resume Stretch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSkip}>
            <Text style={styles.actionText}>⏭  Skip This Stretch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.quitText}>End Session</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'flex-end' },
  backdrop:     { ...StyleSheet.absoluteFillObject },
  backdropTap:  { flex: 1 },
  sheet:        { backgroundColor: '#FFFFFFFA', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: 40, height: SHEET_HEIGHT, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 24, shadowOffset: { width: 0, height: -6 }, elevation: 10 },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 24 },
  iconRow:      { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 },
  pauseBar:     { width: 6, height: 28, borderRadius: 3, backgroundColor: colors.accent },
  title:        { fontSize: 26, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: 4 },
  stretchName:  { fontSize: 14, color: colors.accent, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  hint:         { fontSize: 13, color: colors.textMid, textAlign: 'center', marginBottom: 20 },
  divider:      { width: '100%', height: 1, backgroundColor: colors.border, marginBottom: 20 },
  resumeButton: { backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 10, shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  resumeText:   { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  actionButton: { backgroundColor: colors.background, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  actionText:   { color: colors.textDark, fontSize: 15, fontWeight: '600' },
  quitButton:   { paddingVertical: 10, alignItems: 'center' },
  quitText:     { color: colors.textLight, fontSize: 14 },
});