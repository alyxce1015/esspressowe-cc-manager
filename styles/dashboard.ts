import { StyleSheet, Platform } from 'react-native';

export const dashStyles = StyleSheet.create({
  // Home scroll
  homeScroll: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  homeScrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },

  // Hero "Wallet at a Glance" card
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
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
    color: '#aeaeb2',
    letterSpacing: 1.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c6c70',
    textAlign: 'center',
  },
  heroAmount: {
    fontSize: 52,
    fontWeight: '800',
    color: '#1c1c1e',
    letterSpacing: -2,
    marginTop: 4,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: '#aeaeb2',
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  insightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 7,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  insightText: {
    fontSize: 12,
    color: '#6c6c70',
    lineHeight: 16,
  },

  // Hero right stat cards
  heroStatCard: {
    backgroundColor: '#f2f2f7',
    borderRadius: 14,
    padding: 12,
    gap: 3,
  },
  heroStatCardBlue: {
    backgroundColor: '#e8f0ff',
  },
  heroStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#aeaeb2',
    letterSpacing: 1,
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1c1c1e',
  },

  // 2-column stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#1c1c1e',
  },
  statLabel: {
    fontSize: 13,
    color: '#aeaeb2',
    fontWeight: '500',
  },

  // Split tile (two halves side by side)
  splitTile: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  splitHalf: {
    flex: 1,
  },
  splitDivider: {
    width: 1,
    backgroundColor: '#e5e5ea',
    marginHorizontal: 16,
  },
  splitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aeaeb2',
    marginBottom: 4,
  },
  splitValueBlue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#007aff',
  },
  splitValueGreen: {
    fontSize: 26,
    fontWeight: '800',
    color: '#34c759',
  },

  // Section cards
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
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
    color: '#1c1c1e',
    fontWeight: '500',
  },
  listSub: {
    fontSize: 11,
    color: '#aeaeb2',
    marginTop: 2,
  },
  listBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c6c70',
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  listBadgeUrgent: {
    color: '#ff3b30',
    backgroundColor: '#fff0f0',
  },
  listBadgeSoon: {
    color: '#ff9500',
    backgroundColor: '#fff8e6',
  },

  // Home empty state
  homeEmpty: {
    alignItems: 'center',
    paddingVertical: 72,
    gap: 10,
  },
  homeEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginTop: 8,
  },
  homeEmptySub: {
    fontSize: 14,
    color: '#aeaeb2',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Placeholder tabs
  placeholder: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#aeaeb2',
    fontWeight: '500',
  },

  // Bottom tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5ea',
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
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#aeaeb2',
  },
  tabLabelActive: {
    color: '#007aff',
    fontWeight: '700',
  },
});
