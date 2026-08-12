import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'streak_data';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  totalSessions: number;
  totalTimeSeconds: number;
  sessionHistory: { date: string; position: string }[];
}

const defaultData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null,
  totalSessions: 0,
  totalTimeSeconds: 0,
  sessionHistory: [],
};

export const getStreakData = async (): Promise<StreakData> => {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData;
  } catch {
    return defaultData;
  }
};

export const recordSession = async (
  timeSeconds: number,
  position: string
): Promise<StreakData> => {
  try {
    const data = await getStreakData();
    const today = new Date().toISOString().split('T')[0];
    const last = data.lastSessionDate;

    let newStreak = data.currentStreak;

    if (last === today) {
      // Already did a session today — don't increment
      newStreak = data.currentStreak;
    } else if (last === getPreviousDay(today)) {
      // Consecutive day — increment
      newStreak = data.currentStreak + 1;
    } else {
      // Missed a day — reset
      newStreak = 1;
    }

    const updated: StreakData = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, data.longestStreak),
      lastSessionDate: today,
      totalSessions: data.totalSessions + 1,
      totalTimeSeconds: data.totalTimeSeconds + timeSeconds,
      sessionHistory: [
        ...data.sessionHistory.slice(-29), // keep last 30
        { date: today, position },
      ],
    };

    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return defaultData;
  }
};

const getPreviousDay = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

export const getWeeklyData = (history: { date: string }[]): number[] => {
  const days = Array(7).fill(0);
  const today = new Date();
  history.forEach(({ date }) => {
    const diff = Math.floor(
      (today.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff >= 0 && diff < 7) {
      days[6 - diff] += 1;
    }
  });
  return days;
};

// Returns real weekday labels (e.g. "Wed") for the last 7 calendar days,
// oldest first and today last — aligned index-for-index with getWeeklyData's
// output, instead of a fixed "Mon..Sun" that only matches on Sundays.
export const getWeekdayLabels = (): string[] => {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
  }
  return labels;
};