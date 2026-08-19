import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const REMINDERS_KEY = 'reminder_times';

const MESSAGES = [
  "Time to stretch! Your body will thank you.",
  "Quick stretch break? You've earned it.",
  "30 seconds is all it takes — let's go.",
  "Your muscles are calling. Time to stretch!",
  "Stretch break time! Feel better in minutes.",
  "Don't forget to move — your body needs it.",
  "A little stretch goes a long way.",
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const getSavedReminders = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const scheduleReminders = async (times: string[]): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Stretch App",
          body: message,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }

    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(times));
  } catch (e) {
    console.error('Failed to schedule reminders:', e);
  }
};

export const cancelAllReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(REMINDERS_KEY);
};