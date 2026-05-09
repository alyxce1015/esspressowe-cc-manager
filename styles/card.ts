import { StyleSheet } from 'react-native';

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  cardSelected: {
    borderColor: '#007aff',
    backgroundColor: '#f0f6ff',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#c7c7cc',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  trashButton: {
    alignSelf: 'flex-start',
    paddingTop: 2,
    paddingLeft: 4,
  },


  cardImageColumn: {
    alignItems: 'center',
    flexShrink: 0,
    gap: 3,
  },
  cardImageWrap: {
    width: 90,
    height: 57,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  cardDateOpenedLabel: {
    fontSize: 9,
    color: '#aeaeb2',
    fontWeight: '500',
    textAlign: 'center',
  },
  cardAgeLabel: {
    fontSize: 9,
    color: '#c7c7cc',
    textAlign: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  customCardLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  feeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#007aff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  feeBadgeUrgent: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  feeBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  feeBadgeTextUrgent: {
    color: '#ff3b30',
  },
  cardLast4: {
    fontSize: 12,
    color: '#aeaeb2',
  },

  noFeePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f8ed',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  noFeePillText: {
    color: '#34c759',
    fontSize: 12,
    fontWeight: '600',
  },

  renewalSection: {
    marginTop: 4,
    gap: 4,
  },
  renewalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  renewalLabel: {
    fontSize: 11,
    color: '#aeaeb2',
  },
  daysText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e5ea',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#007aff',
    borderRadius: 2,
  },
  progressFillUrgent: {
    backgroundColor: '#ff3b30',
  },
  daysTextUrgent: {
    color: '#ff3b30',
  },
  progressFeeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1c1c1e',
    flexShrink: 0,
  },
  renewalDateText: {
    fontSize: 11,
    color: '#aeaeb2',
  },
  setDateHint: {
    fontSize: 11,
    color: '#c7c7cc',
    marginTop: 2,
    fontStyle: 'italic',
  },
  cardOpenedText: {
    fontSize: 11,
    color: '#aeaeb2',
    marginTop: 2,
  },

  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
  },
  benefitChip: {
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  benefitChipText: {
    fontSize: 12,
    color: '#6c6c70',
    fontWeight: '500',
  },
});
