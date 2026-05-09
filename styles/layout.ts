import { StyleSheet } from 'react-native';

export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5a473e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  header: {
    fontSize: 34,
    fontWeight: '700',
    color: '#F8F4EF',
    letterSpacing: -0.5,
  },
  selectButton: {
    fontSize: 16,
    color: '#C08A5B',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardGrid: {},
  cardGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cardGridItem: {
    width: '50%',
    paddingHorizontal: 6,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8F4EF',
    marginBottom: 6,
  },
  emptyStateSub: {
    fontSize: 14,
    color: '#CBB9A8',
  },

  deleteErrorText: {
    color: '#ff3b30',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  selectModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CBB9A8',
    flexShrink: 1,
  },
  deleteSelectedButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteSelectedButtonDisabled: {
    backgroundColor: '#3A2A24',
  },
  deleteSelectedButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  deleteSelectedText: {
    color: '#F8F4EF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteSelectedTextDisabled: {
    color: '#CBB9A8',
  },

  addButton: {
    backgroundColor: '#6d4c2f',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    color: '#F8F4EF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
