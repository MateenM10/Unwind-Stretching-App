import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALL_STRETCHES } from '../../utils/stretches';
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
    if (w >= 1.6) return { label: 'Shows often', color: '#4ade80' };
    if (w <= 0.4) return { label: 'Rarely shown', color: '#f87171' };
    return { label: 'Normal', color: '#888' };
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Stretch Library</Text>
        <Text style={styles.subtitle}>Manage your favourites</Text>

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
            <Text style={styles.emptyText}>No favourites yet — heart a stretch during a session!</Text>
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
  container:       { flex: 1, backgroundColor: '#0f0f0f', padding: 24 },
  title:           { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle:        { fontSize: 15, color: '#888', marginBottom: 20 },
  filterRow:       { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterTab:       { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  filterTabActive: { backgroundColor: '#a78bfa', borderColor: '#a78bfa' },
  filterText:      { color: '#888', fontSize: 14, fontWeight: '600' },
  filterTextActive:{ color: '#fff' },
  card:            { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft:        { flex: 1 },
  cardName:        { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardMuscle:      { color: '#666', fontSize: 12, marginBottom: 4 },
  cardWeight:      { fontSize: 12, fontWeight: '500' },
  heartIcon:       { fontSize: 24 },
  emptyText:       { color: '#555', fontSize: 15, textAlign: 'center', marginTop: 40, lineHeight: 24 },
});