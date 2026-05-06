import { Image } from 'expo-image';
import React from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ALL_STRETCHES, Stretch } from '../utils/stretches';
import { colors, shared } from '../utils/theme';

const { height } = Dimensions.get('window');

const ANIMATIONS: Record<string, any> = {
  n1: require('../assets/images/animations/neck.gif'),
  n2: require('../assets/images/animations/earShoulder.gif'),

  
  
};

interface Props {
  visible: boolean;
  onClose: () => void;
  stretchId: string;
  stretchName: string;
  muscle: string;
}

export default function StretchInfoSheet({ visible, onClose, stretchId, stretchName, muscle }: Props) {
  const stretch: Stretch | undefined = ALL_STRETCHES.find(s => s.id === stretchId);
  const steps: string[] = stretch?.steps ?? ['No instructions available for this stretch yet.'];
  const animation = ANIMATIONS[stretchId];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>

          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.muscle}>{muscle.toUpperCase()}</Text>
            <Text style={styles.name}>{stretchName}</Text>

            {animation ? (
              <View style={styles.animationBox}>
                <Image
                  source={animation}
                  style={styles.animation}
                  contentFit="contain"
                  autoplay
                />
              </View>
            ) : (
              <View style={styles.animationPlaceholder}>
                <Text style={styles.placeholderEmoji}>🧘</Text>
                <Text style={styles.placeholderText}>Animation coming soon</Text>
              </View>
            )}

            <Text style={styles.stepsTitle}>How to do it</Text>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            <View style={{ height: 24 }} />
          </ScrollView>

          <TouchableOpacity style={shared.primaryButton} onPress={onClose}>
            <Text style={shared.primaryButtonText}>Got it ✓</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:              { flex: 1, justifyContent: 'flex-end' },
  backdrop:             { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet:                { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: height * 0.85 },
  handle:               { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  muscle:               { fontSize: 11, fontWeight: '700', color: colors.accent, letterSpacing: 1.5, marginBottom: 4 },
  name:                 { fontSize: 24, fontWeight: '700', color: colors.textDark, marginBottom: 20 },
  animationBox:         { backgroundColor: colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24, height: 200, overflow: 'hidden' },
  animation:            { width: '100%', height: 200 },
  animationPlaceholder: { backgroundColor: colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24, height: 160, borderWidth: 1, borderColor: colors.border },
  placeholderEmoji:     { fontSize: 40, marginBottom: 8 },
  placeholderText:      { fontSize: 13, color: colors.textLight },
  stepsTitle:           { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 16 },
  stepRow:              { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  stepNumber:           { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumberText:       { color: colors.white, fontSize: 12, fontWeight: '700' },
  stepText:             { flex: 1, fontSize: 14, color: colors.textDark, lineHeight: 22 },
});