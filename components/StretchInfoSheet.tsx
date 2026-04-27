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
import StretchIllustration from './StretchIllustration';

const { height } = Dimensions.get('window');

const STEPS: Record<string, string[]> = {
  neck: [
    'Sit or stand with your spine tall',
    'Slowly drop your right ear toward your right shoulder',
    'Hold for 3 seconds, feeling the stretch on the left side',
    'Roll your chin down toward your chest',
    'Continue to the left side and repeat',
  ],
  shoulders: [
    'Sit or stand with your back straight',
    'Lift both shoulders up toward your ears',
    'Hold at the top for 2 seconds',
    'Drop them down as far as possible',
    'Repeat slowly and feel the release each time',
  ],
  chest: [
    'Stand tall or sit at the edge of your seat',
    'Clasp your hands behind your back',
    'Straighten your arms and squeeze your shoulder blades together',
    'Lift your hands slightly and open your chest upward',
    'Hold and breathe deeply into the front of your chest',
  ],
  back: [
    'Sit tall or lie flat depending on the stretch',
    'Engage your core lightly to protect your spine',
    'Move slowly into the stretch — never force it',
    'Breathe out as you go deeper',
    'Hold at the point of mild tension, not pain',
  ],
  hips: [
    'Lie on your back with knees bent',
    'Cross one ankle over the opposite knee',
    'Flex your foot to protect your knee joint',
    'Pull both legs gently toward your chest',
    'Hold then switch sides',
  ],
  quads: [
    'Stand near a wall for balance if needed',
    'Bend one knee and bring your foot toward your glutes',
    'Hold your ankle — not your foot — to protect your knee',
    'Keep your knees together and stand tall',
    'Hold then switch to the other leg',
  ],
  hamstrings: [
    'Keep a soft bend in your knee throughout',
    'Hinge forward from your hips, not your waist',
    'Let your spine stay long — avoid rounding your back',
    'Reach toward your feet but stop before you feel strain',
    'Hold the position and breathe slowly',
  ],
  calves: [
    'Stand with feet hip-width apart',
    'Rise up onto the balls of both feet',
    'Hold at the top for a full second',
    'Lower back down slowly — this is where the stretch happens',
    'Repeat or hold in the lowered position for a static stretch',
  ],
  ankles: [
    'Sit comfortably with one foot lifted off the ground',
    'Draw large slow circles with your foot',
    'Go clockwise 5 times, then counter-clockwise 5 times',
    'Make the circles as big as possible',
    'Switch feet and repeat',
  ],
  general: [
    'Lie flat on your back with legs straight',
    'Reach both arms overhead as far as possible',
    'Point your toes away from you at the same time',
    'Take a deep breath in as you stretch everything long',
    'Release and relax fully on the exhale',
  ],
};

interface Props {
  visible: boolean;
  onClose: () => void;
  stretchName: string;
  muscle: string;
}

export default function StretchInfoSheet({ visible, onClose, stretchName, muscle }: Props) {
  const steps = STEPS[muscle] ?? STEPS['general'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>

          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.muscle}>{muscle.toUpperCase()}</Text>
            <Text style={styles.name}>{stretchName}</Text>

            {/* Illustration */}
            <View style={styles.illustrationBox}>
              <StretchIllustration muscle={muscle} />
            </View>

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

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Got it ✓</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:          { flex: 1, justifyContent: 'flex-end' },
  backdrop:         { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet:            { backgroundColor: '#FAF7F2', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: height * 0.85 },
  handle:           { width: 40, height: 4, backgroundColor: '#EDE5D8', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  muscle:           { fontSize: 11, fontWeight: '700', color: '#C9A96E', letterSpacing: 1.5, marginBottom: 4 },
  name:             { fontSize: 24, fontWeight: '700', color: '#2C2416', marginBottom: 20 },
  illustrationBox:  { backgroundColor: '#FFFFFF', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24, height: 200, shadowColor: '#C9A96E', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  stepsTitle:       { fontSize: 16, fontWeight: '700', color: '#2C2416', marginBottom: 16 },
  stepRow:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  stepNumber:       { width: 26, height: 26, borderRadius: 13, backgroundColor: '#C9A96E', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumberText:   { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepText:         { flex: 1, fontSize: 14, color: '#2C2416', lineHeight: 22 },
  closeButton:      { backgroundColor: '#C9A96E', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  closeText:        { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});