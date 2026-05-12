import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALL_STRETCHES } from '../../utils/stretches';
import { colors, gradient, shadows, shared } from '../../utils/theme';
import { getFavourites, getWeights, toggleFavourite } from '../../utils/weights';

const MUSCLE_ORDER = ['neck', 'shoulders', 'chest', 'back', 'hips', 'glutes', 'quads', 'hamstrings', 'calves', 'ankles', 'general'];

const MUSCLE_LABELS: Record<string, string> = {
  neck:       '🙆  Neck',
  shoulders:  '💪  Shoulders',
  chest:      '❤️  Chest',
  back:       '🔄  Back',
  hips:       '🌀  Hips',
  glutes:     '🍑  Glutes',
  quads:      '🦵  Quads',
  hamstrings: '🦵  Hamstrings',
  calves:     '🦶  Calves',
  ankles:     '🔁  Ankles',
  general:    '✨  General',
};

export default function LibraryScreen() {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [weights, setWeights]       = useState<Record<string, number>>({});
  const [filter, setFilter]         = useState<'all' | 'favourites'>('all');
  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const favs = await getFavourites();
        const w    = await getWeights();
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

  const toggleCollapse = (muscle: string) => {
    setCollapsed(prev => ({ ...prev, [muscle]: !prev[muscle] }));
  };

  const getWeightLabel = (id: string) => {
    const w = weights[id] ?? 1.0;
    if (w >= 1.6) return { label: 'Shows often',  color: colors.success };
    if (w <= 0.4) return { label: 'Rarely shown', color: '#D4896A'      };
    return { label: 'Normal', color: colors.textMid };
  };

  const displayed = filter === 'favourites'
    ? ALL_STRETCHES.filter(s => favourites.includes(s.id))
    : ALL_STRETCHES;

  const grouped = MUSCLE_ORDER.reduce((acc, muscle) => {
    const group = displayed.filter(s => s.muscle === muscle);
    if (group.length > 0) acc[muscle] = group;
    return acc;
  }, {} as Record<string, typeof ALL_STRETCHES>);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={gradient.screen} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <Text style={shared.screenTitle}>Stretch Library</Text>
          <Text style={[shared.subtitle, styles.subtitleLeft]}>Browse and manage your stretches</Text>

          <View style={styles.filterRow}>
            {(['all', 'favourites'] as const).map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, filter === f && styles.filterTabActive]}
                onPress={() => setFilter(f)}
              >
                {f === 'favourites' && (
                  <Ionicons
                    name="heart"
                    size={13}
                    color={filter === f ? colors.white : colors.textMid}
                  />
                )}
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === 'all' ? 'All' : 'Favourites'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.keys(grouped).length === 0 && (
              <Text style={shared.emptyText}>No favourites yet — heart a stretch during a session!</Text>
            )}

            {Object.entries(grouped).map(([muscle, stretches]) => {
              const isCollapsed = collapsed[muscle];
              return (
                <View key={muscle} style={styles.section}>
                  <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleCollapse(muscle)}>
                    <Text style={styles.sectionTitle}>{MUSCLE_LABELS[muscle]}</Text>
                    <View style={styles.sectionRight}>
                      <Text style={styles.sectionCount}>{stretches.length}</Text>
                      <Ionicons
                        name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
                        size={16}
                        color={colors.textLight}
                      />
                    </View>
                  </TouchableOpacity>

                  {!isCollapsed && stretches.map(stretch => {
                    const isFav      = favourites.includes(stretch.id);
                    const weightInfo = getWeightLabel(stretch.id);
                    return (
                      <View key={stretch.id} style={styles.card}>
                        <View style={styles.cardLeft}>
                          <Text style={styles.cardName}>{stretch.name}</Text>
                          <View style={styles.cardMeta}>
                            <Text style={styles.cardDuration}>{stretch.duration}s</Text>
                            <Text style={styles.cardDot}>·</Text>
                            <Text style={[styles.cardWeight, { color: weightInfo.color }]}>{weightInfo.label}</Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => handleFavourite(stretch.id)} style={styles.heartButton}>
                          <Ionicons
                            name={isFav ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isFav ? colors.accent : colors.textLight}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              );
            })}

            <View style={{ height: 120 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, padding: 24 },
  subtitleLeft:     { textAlign: 'left', marginBottom: 20 },
  filterRow:        { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterTab:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  filterTabActive:  { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText:       { color: colors.textMid, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: colors.white },
  section:          { marginBottom: 12 },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, marginBottom: 8 },
  sectionTitle:     { fontSize: 15, fontWeight: '700', color: colors.textDark },
  sectionRight:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionCount:     { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  card:             { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...shadows.card },
  cardLeft:         { flex: 1 },
  cardName:         { color: colors.textDark, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardMeta:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardDuration:     { color: colors.textLight, fontSize: 12 },
  cardDot:          { color: colors.textLight, fontSize: 12 },
  cardWeight:       { fontSize: 12, fontWeight: '500' },
  heartButton:      { padding: 4 },
});