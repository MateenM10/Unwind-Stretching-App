import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { cancelAllReminders, getSavedReminders, requestPermissions, scheduleReminders } from '../../utils/reminders';

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
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
};

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const times = await getSavedReminders();
        if (times.length > 0) {
          setEnabled(true);
          setSelectedTimes(times);
        }
      };
      load();
    }, [])
  );

  const toggleEnabled = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permission needed', 'Please enable notifications in your phone settings to use reminders.');
        return;
      }
    } else {
      await cancelAllReminders();
      setSelectedTimes([]);
    }
    setEnabled(value);
    setSaved(false);
  };

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(prev => prev.filter(t => t !== time));
    } else {
      if (selectedTimes.length >= 3) {
        Alert.alert('Maximum 3 reminders', 'Remove one before adding another.');
        return;
      }
      setSelectedTimes(prev => [...prev, time]);
    }
    setSaved(false);
  };

  const handleSave = async () => {
    if (selectedTimes.length === 0) {
      Alert.alert('Pick at least one time', 'Select a reminder time to save.');
      return;
    }
    await scheduleReminders(selectedTimes);
    setSaved(true);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customise your experience</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>🔔  Daily Reminders</Text>
                <Text style={styles.sectionDesc}>Get nudged to stretch every day</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={toggleEnabled}
                trackColor={{ false: '#EDE5D8', true: '#C9A96E' }}
                thumbColor="#FFFFFF"
              />
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
                    <TouchableOpacity
                      key={time}
                      style={[styles.timeCard, isSelected && styles.timeCardSelected]}
                      onPress={() => toggleTime(time)}
                    >
                      <Text style={styles.timeLabel}>{label}</Text>
                      <View style={styles.timeRight}>
                        <Text style={styles.timeValue}>{formatTime(time)}</Text>
                        {isSelected && <Text style={styles.tick}> ✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saved && styles.saveButtonSaved]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>{saved ? '✓  Reminders Saved!' : 'Save Reminders'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱  About</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>Stretch App</Text>
              <Text style={styles.aboutVersion}>Version 1.0</Text>
              <Text style={styles.aboutDesc}>Built with React Native + Expo.{'\n'}Helping you move more, one stretch at a time.</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#FAF7F2', padding: 24 },
  title:            { fontSize: 28, fontWeight: '700', color: '#2C2416', marginBottom: 6 },
  subtitle:         { fontSize: 15, color: '#9B8573', marginBottom: 24 },
  section:          { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle:     { color: '#2C2416', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  sectionDesc:      { color: '#9B8573', fontSize: 13 },
  timeCard:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EDE5D8', marginBottom: 8, backgroundColor: '#FAF7F2' },
  timeCardSelected: { borderColor: '#C9A96E', backgroundColor: '#FDF8F2' },
  timeLabel:        { color: '#2C2416', fontSize: 15 },
  timeRight:        { flexDirection: 'row', alignItems: 'center' },
  timeValue:        { color: '#9B8573', fontSize: 14 },
  tick:             { color: '#C9A96E', fontSize: 14, fontWeight: '700' },
  saveButton:       { backgroundColor: '#C9A96E', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  saveButtonSaved:  { backgroundColor: '#8DB87A' },
  saveText:         { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  aboutCard:        { marginTop: 12 },
  aboutText:        { color: '#2C2416', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  aboutVersion:     { color: '#9B8573', fontSize: 13, marginBottom: 8 },
  aboutDesc:        { color: '#9B8573', fontSize: 13, lineHeight: 20 },
});