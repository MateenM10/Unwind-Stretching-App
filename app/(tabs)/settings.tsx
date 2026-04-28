import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { cancelAllReminders, getSavedReminders, requestPermissions, scheduleReminders } from '../../utils/reminders';
import { colors, shadows, shared } from '../../utils/theme';

const PRESET_TIMES = [
  { label: '🌅  Morning',    time: '08:00' },
  { label: '☀️  Midday',     time: '12:00' },
  { label: '🌤️  Afternoon',  time: '15:00' },
  { label: '🌆  Evening',    time: '18:00' },
  { label: '🌙  Before Bed', time: '21:00' },
];

const formatTime = (time: string): string => {
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      const times = await getSavedReminders();
      if (times.length > 0) { setEnabled(true); setSelectedTimes(times); }
    };
    load();
  }, []));

  const toggleEnabled = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) { Alert.alert('Permission needed', 'Please enable notifications in your phone settings.'); return; }
    } else { await cancelAllReminders(); setSelectedTimes([]); }
    setEnabled(value);
    setSaved(false);
  };

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(prev => prev.filter(t => t !== time));
    } else {
      if (selectedTimes.length >= 3) { Alert.alert('Maximum 3 reminders', 'Remove one before adding another.'); return; }
      setSelectedTimes(prev => [...prev, time]);
    }
    setSaved(false);
  };

  const handleSave = async () => {
    if (selectedTimes.length === 0) { Alert.alert('Pick at least one time', 'Select a reminder time to save.'); return; }
    await scheduleReminders(selectedTimes);
    setSaved(true);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={shared.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={shared.screenTitle}>Settings</Text>
          <Text style={[shared.subtitle, styles.subtitleLeft]}>Customise your experience</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>🔔  Daily Reminders</Text>
                <Text style={styles.sectionDesc}>Get nudged to stretch every day</Text>
              </View>
              <Switch value={enabled} onValueChange={toggleEnabled} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.white} />
            </View>
          </View>

          {enabled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏰  Reminder Times</Text>
              <Text style={styles.sectionDesc}>Pick up to 3 times per day</Text>
              <View style={{ marginTop: 16 }}>
                {PRESET_TIMES.map(({ label, time }) => {
                  const isSelected = selectedTimes.includes(time);
                  return (
                    <TouchableOpacity key={time} style={[styles.timeCard, isSelected && styles.timeCardSelected]} onPress={() => toggleTime(time)}>
                      <Text style={styles.timeLabel}>{label}</Text>
                      <View style={styles.timeRight}>
                        <Text style={styles.timeValue}>{formatTime(time)}</Text>
                        {isSelected && <Text style={styles.tick}> ✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity style={[shared.primaryButton, saved && styles.saveButtonSaved, { marginTop: 8 }]} onPress={handleSave}>
                <Text style={shared.primaryButtonText}>{saved ? '✓  Reminders Saved!' : 'Save Reminders'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱  About</Text>
            <Text style={styles.aboutText}>Stretch App</Text>
            <Text style={styles.aboutVersion}>Version 1.0</Text>
            <Text style={styles.aboutDesc}>Built with React Native + Expo.{'\n'}Helping you move more, one stretch at a time.</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  subtitleLeft:     { textAlign: 'left', marginBottom: 24 },
  section:          { backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 16, ...shadows.card },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle:     { color: colors.textDark, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  sectionDesc:      { color: colors.textMid, fontSize: 13 },
  timeCard:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8, backgroundColor: colors.background },
  timeCardSelected: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  timeLabel:        { color: colors.textDark, fontSize: 15 },
  timeRight:        { flexDirection: 'row', alignItems: 'center' },
  timeValue:        { color: colors.textMid, fontSize: 14 },
  tick:             { color: colors.accent, fontSize: 14, fontWeight: '700' },
  saveButtonSaved:  { backgroundColor: colors.success },
  aboutText:        { color: colors.textDark, fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 2 },
  aboutVersion:     { color: colors.textMid, fontSize: 13, marginBottom: 8 },
  aboutDesc:        { color: colors.textMid, fontSize: 13, lineHeight: 20 },
});