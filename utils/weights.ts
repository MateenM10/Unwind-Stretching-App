import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'stretch_weights';

export const getWeights = async (): Promise<Record<string, number>> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const adjustWeight = async (id: string, direction: 'up' | 'down') => {
  try {
    const weights = await getWeights();
    const current = weights[id] ?? 1.0;
    const updated = direction === 'up'
      ? Math.min(2.0, current + 0.2)
      : Math.max(0.2, current - 0.2);
    weights[id] = parseFloat(updated.toFixed(1));
    await AsyncStorage.setItem(KEY, JSON.stringify(weights));
  } catch {}
};

export const getFavourites = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem('stretch_favourites');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleFavourite = async (id: string): Promise<string[]> => {
  try {
    const favs = await getFavourites();
    const updated = favs.includes(id)
      ? favs.filter(f => f !== id)
      : [...favs, id];
    await AsyncStorage.setItem('stretch_favourites', JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const weightedShuffle = (
  stretches: any[],
  weights: Record<string, number>
): any[] => {
  const weighted = stretches.map(s => ({
    ...s,
    _weight: weights[s.id] ?? 1.0,
  }));
  return weighted.sort(() => Math.random() - 0.5 / weighted.reduce((a, b) => a + b._weight, 0));
};