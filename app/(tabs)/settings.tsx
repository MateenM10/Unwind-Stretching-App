import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cancelAllReminders, getSavedReminders, requestPermissions, scheduleReminders } from '../../utils/reminders';
import { colors, gradient, shadows, shared } from '../../utils/theme';

const PRESET_TIMES: { label: string; time: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Morning',    time: '08:00', icon: 'sunny-outline'         },
  { label: 'Midday',     time: '12:00', icon: 'sunny'                 },
  { label: 'Afternoon',  time: '15:00', icon: 'partly-sunny-outline'  },
  { label: 'Evening',    time: '18:00', icon: 'moon-outline'          },
  { label: 'Before Bed', time: '21:00', icon: 'bed-outline'           },
];

const formatTime = (time: string): string => {
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export default function SettingsScreen() {
  const [enabled, setEnabled]             = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [saved, setSaved]                 = useState(false);
  const [name, setName]                   = useState('');
  const [nameSaved, setNameSaved]         = useState(false);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      const times = await getSavedReminders();
      if (times.length > 0) { setEnabled(true); setSelectedTimes(times); }
      const savedName = await AsyncStorage.getItem('userName');
      if (savedName) setName(savedName);
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

  const handleSaveName = async () => {
    await AsyncStorage.setItem('userName', name.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1500);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={gradient.screen} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={shared.screenTitle}>Settings</Text>
            <Text style={[shared.subtitle, styles.subtitleLeft]}>Customise your experience</Text>

            {/* Name */}
            <View style={styles.section}>
              <View style={styles.sectionLeft}>
                <Ionicons name="person-outline" size={20} color={colors.accent} />
                <View>
                  <Text style={styles.sectionTitle}>Your Name</Text>
                  <Text style={styles.sectionDesc}>Used to personalise your greeting</Text>
                </View>
              </View>
              <View style={styles.nameRow}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textLight}
                  style={styles.nameInput}
                  onSubmitEditing={handleSaveName}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.nameSaveButton, nameSaved && styles.saveButtonSaved]}
                  onPress={handleSaveName}
                >
                  <Ionicons
                    name={nameSaved ? 'checkmark' : 'arrow-forward'}
                    size={16}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reminders toggle */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLeft}>
                  <Ionicons name="notifications-outline" size={20} color={colors.accent} />
                  <View>
                    <Text style={styles.sectionTitle}>Daily Reminders</Text>
                    <Text style={styles.sectionDesc}>Get nudged to stretch every day</Text>
                  </View>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={toggleEnabled}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            {/* Reminder times */}
            {enabled && (
              <View style={styles.section}>
                <View style={styles.sectionLeft}>
                  <Ionicons name="time-outline" size={20} color={colors.accent} />
                  <View>
                    <Text style={styles.sectionTitle}>Reminder Times</Text>
                    <Text style={styles.sectionDesc}>Pick up to 3 times per day</Text>
                  </View>
                </View>
                <View style={{ marginTop: 16 }}>
                  {PRESET_TIMES.map(({ label, time, icon }) => {
                    const isSelected = selectedTimes.includes(time);
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeCard, isSelected && styles.timeCardSelected]}
                        onPress={() => toggleTime(time)}
                      >
                        <View style={styles.timeLeft}>
                          <Ionicons name={icon} size={16} color={colors.textMid} />
                          <Text style={styles.timeLabel}>{label}</Text>
                        </View>
                        <View style={styles.timeRight}>
                          <Text style={styles.timeValue}>{formatTime(time)}</Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={18} color={colors.accent} style={{ marginLeft: 6 }} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TouchableOpacity
                  style={[shared.primaryButton, saved && styles.saveButtonSaved, { marginTop: 8 }]}
                  onPress={handleSave}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {saved && <Ionicons name="checkmark" size={18} color={colors.white} />}
                    <Text style={shared.primaryButtonText}>
                      {saved ? 'Reminders Saved!' : 'Save Reminders'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* About */}
            <View style={styles.section}>
              <View style={styles.sectionLeft}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.accent} />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <Text style={styles.aboutText}>Unwind</Text>
              <Text style={styles.aboutVersion}>Version 1.0</Text>
              <Text style={styles.aboutDesc}>
                Built with React Native + Expo.{'\n'}Helping you move more, one stretch at a time.
              </Text>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, padding: 24 },
  subtitleLeft:     { textAlign: 'left', marginBottom: 24 },
  section:          { backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 16, ...shadows.card },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  nameRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  nameInput:        { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.textDark, backgroundColor: colors.background },
  nameSaveButton:   { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sectionTitle:     { color: colors.textDark, fontSize: 16, fontWeight: '600', marginBottom: 2 },
  sectionDesc:      { color: colors.textMid, fontSize: 13 },
  timeCard:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8, backgroundColor: colors.background },
  timeCardSelected: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  timeLeft:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeLabel:        { color: colors.textDark, fontSize: 15 },
  timeRight:        { flexDirection: 'row', alignItems: 'center' },
  timeValue:        { color: colors.textMid, fontSize: 14 },
  saveButtonSaved:  { backgroundColor: colors.success },
  aboutText:        { color: colors.textDark, fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 2 },
  aboutVersion:     { color: colors.textMid, fontSize: 13, marginBottom: 8 },
  aboutDesc:        { color: colors.textMid, fontSize: 13, lineHeight: 20 },
});