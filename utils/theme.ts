import { StyleSheet } from 'react-native';

// ————————————————————————————
// COLOURS — change these to retheme the whole app
// ————————————————————————————
export const colors = {
  background:  '#FAF7F2',
  white:       '#FFFFFF',
  card:        '#FFFFFF',
  cardActive:  '#FDF8F2',
  border:      '#EDE5D8',
  borderActive:'#C9A96E',
  accent:      '#C9A96E',
  accentLight: '#FDF8F2',
  textDark:    '#2C2416',
  textMid:     '#9B8573',
  textLight:   '#C4B5A5',
  success:     '#8DB87A',
};

// ————————————————————————————
// SHARED SHADOWS
// ————————————————————————————
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  accent: {
    shadowColor: '#C9A96E',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  button: {
    shadowColor: '#C9A96E',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

// Add to your existing theme.ts exports
export const motivationColors = {
  flame:    '#FF8C42',
  streak:   '#E8924A',
  energy:   '#F5B947',
  cool:     '#7DAEA0',
};

export const gradient = {
  screen: ['#FAF7F2', '#F5EDE0'] as const,
};

// ————————————————————————————
// SHARED STYLES — reused across screens
// ————————————————————————————
export const shared = StyleSheet.create({

  // Containers
  screen: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    padding: 24,
  },

  // Typography
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2C2416',
    textAlign: 'center',
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2416',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#9B8573',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C4B5A5',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardSelected: {
    borderColor: '#C9A96E',
    backgroundColor: '#FDF8F2',
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#C9A96E',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center' as const,
    shadowColor: '#C9A96E',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#EDE5D8',
    alignItems: 'center' as const,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C9A96E',
  },
  ghostButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDE5D8',
    alignItems: 'center' as const,
  },
  ghostButtonText: {
    color: '#9B8573',
    fontSize: 14,
  },

  // Progress bar
  progressTrack: {
    height: 4,
    backgroundColor: '#EDE5D8',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#C9A96E',
    borderRadius: 2,
  },

  // Tip box
  tipBox: {
    flexDirection: 'row' as const,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDE5D8',
    alignItems: 'flex-start' as const,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#9B8573',
    lineHeight: 20,
  },

  // Check circle
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C9A96E',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Floating button wrapper
  floatingWrapper: {
    position: 'absolute' as const,
    bottom: 24,
    left: 24,
    right: 24,
  },

  // Empty state
  emptyText: {
    color: '#C4B5A5',
    fontSize: 15,
    textAlign: 'center' as const,
    marginTop: 40,
    lineHeight: 24,
  },
});