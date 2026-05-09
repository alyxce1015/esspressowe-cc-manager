import { StyleSheet } from 'react-native';

export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 6,
  },
  emptyStateSub: {
    fontSize: 14,
    color: '#aeaeb2',
  },

  addButton: {
    backgroundColor: '#1c1c1e',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
