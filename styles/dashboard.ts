import { StyleSheet, Platform } from 'react-native';

export const dashStyles = StyleSheet.create({
  // Home scroll — Dark Espresso as the main canvas
  homeScroll: {
    flex: 1,
    backgroundColor: '#5a473e',
  },
  homeScrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },

  // Hero card — Latte Cream so it pops off the dark background
  heroCard: {
    backgroundColor: '#F4EDE4',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBB9A8',
    shadowColor: '#251914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  heroLeft: {
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  heroRight: {
    width: 118,
    gap: 10,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6F4E37',
    letterSpacing: 1.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6F4E37',
    textAlign: 'center',
  },
  heroAmount: {
    fontSize: 52,
    fontWeight: '800',
    color: '#2A211C',
    letterSpacing: -2,
    marginTop: 4,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: '#8C6E5A',
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  insightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 7,
    backgroundColor: '#EDE1D4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  insightText: {
    fontSize: 12,
    color: '#6F4E37',
    lineHeight: 16,
  },

  // Hero right stat cards
  heroStatCard: {
    backgroundColor: '#EDE1D4',
    borderRadius: 14,
    padding: 12,
    gap: 3,
  },
  heroStatCardBlue: {
    backgroundColor: 'rgba(192,138,91,0.2)',
  },
  heroStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8C6E5A',
    letterSpacing: 1,
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A211C',
  },

  // 2-column stats grid — Latte Cream accent tiles on dark background
  statsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#CBB9A8',
    shadowColor: '#2B1D17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2A211C',
  },
  statLabel: {
    fontSize: 13,
    color: '#6F4E37',
    fontWeight: '500',
  },

  // Split tile
  splitTile: {
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CBB9A8',
    shadowColor: '#2B1D17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  splitHalf: {
    flex: 1,
  },
  splitDivider: {
    width: 1,
    backgroundColor: '#CBB9A8',
    marginHorizontal: 16,
  },
  splitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8C6E5A',
    marginBottom: 4,
  },
  splitValueBlue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#C08A5B',
  },
  splitValueGreen: {
    fontSize: 26,
    fontWeight: '800',
    color: '#7A9E7E',
  },

  // Section cards
  sectionCard: {
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#CBB9A8',
    shadowColor: '#2B1D17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A211C',
    marginBottom: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  listName: {
    flex: 1,
    fontSize: 14,
    color: '#2A211C',
    fontWeight: '500',
  },
  listSub: {
    fontSize: 11,
    color: '#8C6E5A',
    marginTop: 2,
  },
  listBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37',
    backgroundColor: '#EDE1D4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  listBadgeUrgent: {
    color: '#ff3b30',
    backgroundColor: 'rgba(139,58,58,0.15)',
  },
  listBadgeSoon: {
    color: '#ff9500',
    backgroundColor: 'rgba(184,107,67,0.15)',
  },

  // Home empty state — on dark background
  homeEmpty: {
    alignItems: 'center',
    paddingVertical: 72,
    gap: 10,
  },
  homeEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8F4EF',
    marginTop: 8,
  },
  homeEmptySub: {
    fontSize: 14,
    color: '#CBB9A8',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Placeholder tabs
  placeholder: {
    flex: 1,
    backgroundColor: '#5a473e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#CBB9A8',
    fontWeight: '500',
  },

  // Bottom tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#3A2A24',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8C6E5A',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  tabIconWrap: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
  },
  tabIconActive: {
    backgroundColor: 'rgba(192,138,91,0.2)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#CBB9A8',
  },
  tabLabelActive: {
    color: '#C08A5B',
    fontWeight: '700',
  },
});
