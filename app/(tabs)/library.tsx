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
    if (w >= 1.6) return { label: 'Shows often', color: '#8DB87A' };
    if (w <= 0.4) return { label: 'Rarely shown', color: '#D4896A' };
    return { label: 'Normal', color: '#9B8573' };
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Stretch Library</Text>
        <Text style={styles.subtitle}>Manage your favourites</Text>

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
  container:        { flex: 1, backgroundColor: '#FAF7F2', padding: 24 },
  title:            { fontSize: 28, fontWeight: '700', color: '#2C2416', marginBottom: 6 },
  subtitle:         { fontSize: 15, color: '#9B8573', marginBottom: 20 },
  filterRow:        { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterTab:        { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: '#EDE5D8', backgroundColor: '#FFFFFF' },
  filterTabActive:  { backgroundColor: '#C9A96E', borderColor: '#C9A96E' },
  filterText:       { color: '#9B8573', fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  card:             { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  cardLeft:         { flex: 1 },
  cardName:         { color: '#2C2416', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardMuscle:       { color: '#C4B5A5', fontSize: 12, marginBottom: 4 },
  cardWeight:       { fontSize: 12, fontWeight: '500' },
  heartIcon:        { fontSize: 24 },
  emptyText:        { color: '#C4B5A5', fontSize: 15, textAlign: 'center', marginTop: 40, lineHeight: 24 },
});