import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALL_STRETCHES } from '../../utils/stretches';
import { colors, shadows, shared } from '../../utils/theme';
import { getFavourites, getWeights, toggleFavourite } from '../../utils/weights';

export default function LibraryScreen() {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<'all' | 'favourites'>('all');

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const favs = await getFavourites();
        const w = await getWeights();
        setFavourites(favs);
        setWeights(w);
      };
      load();
    }, [])
  );

  const handleFavourite = async (id: string) => {
    const updated = await toggleFavourite(id);
    setFavourites(updated);
  };

  const displayed = filter === 'favourites'
    ? ALL_STRETCHES.filter(s => favourites.includes(s.id))
    : ALL_STRETCHES;

  const getWeightLabel = (id: string) => {
    const w = weights[id] ?? 1.0;
    if (w >= 1.6) return { label: 'Shows often',  color: colors.success };
    if (w <= 0.4) return { label: 'Rarely shown', color: '#D4896A' };
    return { label: 'Normal', color: colors.textMid };
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={shared.screen}>
        <Text style={shared.screenTitle}>Stretch Library</Text>
        <Text style={[shared.subtitle, styles.subtitleLeft]}>Manage your favourites</Text>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'favourites' && styles.filterTabActive]}
            onPress={() => setFilter('favourites')}
          >
            <Text style={[styles.filterText, filter === 'favourites' && styles.filterTextActive]}>❤️ Favourites</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {displayed.length === 0 && (
            <Text style={shared.emptyText}>No favourites yet — heart a stretch during a session!</Text>
          )}
          {displayed.map(stretch => {
            const isFav = favourites.includes(stretch.id);
            const weightInfo = getWeightLabel(stretch.id);
            return (
              <View key={stretch.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardName}>{stretch.name}</Text>
                  <Text style={styles.cardMuscle}>{stretch.muscle.toUpperCase()} · {stretch.duration}s</Text>
                  <Text style={[styles.cardWeight, { color: weightInfo.color }]}>{weightInfo.label}</Text>
                </View>
                <TouchableOpacity onPress={() => handleFavourite(stretch.id)}>
                  <Text style={styles.heartIcon}>{isFav ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  subtitleLeft:     { textAlign: 'left', marginBottom: 20 },
  filterRow:        { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterTab:        { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  filterTabActive:  { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText:       { color: colors.textMid, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: colors.white },
  card:             { backgroundColor: colors.white, borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...shadows.card },
  cardLeft:         { flex: 1 },
  cardName:         { color: colors.textDark, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardMuscle:       { color: colors.textLight, fontSize: 12, marginBottom: 4 },
  cardWeight:       { fontSize: 12, fontWeight: '500' },
  heartIcon:        { fontSize: 24 },
});