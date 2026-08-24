import { Image } from 'expo-image';
import React from 'react';
import {
  Dimensions,
  ImageSourcePropType,
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

// Maps a stretch id to its demo GIF. Empty for now — an early pass generated
// a couple of proof-of-concept animations via an AI video tool, but they
// carried a visible watermark from the generator and were pulled rather than
// ship branded output. The lookup and rendering logic below is left in place
// so a stretch's animation shows automatically the moment a real entry is
// added here — the UI already gracefully skips the section when one isn't.
const ANIMATIONS: Record<string, ImageSourcePropType> = {};

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

            {animation && (
              <View style={styles.animationBox}>
                <Image
                  source={animation}
                  style={styles.animation}
                  contentFit="contain"
                  autoplay
                />
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
  stepsTitle:           { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 16 },
  stepRow:              { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  stepNumber:           { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumberText:       { color: colors.white, fontSize: 12, fontWeight: '700' },
  stepText:             { flex: 1, fontSize: 14, color: colors.textDark, lineHeight: 22 },
});