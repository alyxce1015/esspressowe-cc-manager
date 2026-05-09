import { StyleSheet } from 'react-native';

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: '#3A2A24',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#8C6E5A',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8F4EF',
    letterSpacing: -0.3,
  },
  closeButton: {
    fontSize: 16,
    color: '#CBB9A8',
    padding: 4,
  },
  backButton: {
    fontSize: 16,
    color: '#C08A5B',
    fontWeight: '500',
  },

  searchInput: {
    backgroundColor: '#2B1D17',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#F8F4EF',
    fontSize: 15,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  issuerFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  issuerPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#2B1D17',
  },
  issuerPillActive: {
    backgroundColor: '#C08A5B',
  },
  issuerPillText: {
    color: '#CBB9A8',
    fontSize: 13,
    fontWeight: '500',
  },
  issuerPillTextActive: {
    color: '#F8F4EF',
    fontWeight: '600',
  },

  catalogList: {
    flex: 1,
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(140,110,90,0.3)',
    gap: 12,
  },
  catalogItemPressed: {
    backgroundColor: 'rgba(192,138,91,0.1)',
  },
  catalogImageWrap: {
    width: 86,
    height: 54,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogImage: {
    width: '100%',
    height: '100%',
  },
  catalogCustomLabel: {
    color: '#F8F4EF',
    fontSize: 12,
    fontWeight: '600',
  },
  catalogItemInfo: {
    flex: 1,
  },
  catalogCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8F4EF',
    marginBottom: 2,
  },
  catalogCardIssuer: {
    fontSize: 12,
    color: '#CBB9A8',
  },
  catalogFeeBadge: {
    backgroundColor: '#2B1D17',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catalogFeeBadgeText: {
    fontSize: 11,
    color: '#CBB9A8',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: '#8C6E5A',
  },

  detailsRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  detailsLeft: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    gap: 8,
  },
  detailThumb: {
    width: '90%',
    aspectRatio: 1.586,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailThumbImage: {
    width: '100%',
    height: '100%',
  },
  detailCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8F4EF',
    textAlign: 'center',
    lineHeight: 18,
  },
  detailFeePill: {
    backgroundColor: '#C08A5B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailFeePillText: {
    color: '#F8F4EF',
    fontSize: 15,
    fontWeight: '700',
  },
  detailNoFeePill: {
    backgroundColor: 'rgba(122,158,126,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailNoFeePillText: {
    color: '#7A9E7E',
    fontSize: 15,
    fontWeight: '600',
  },
  detailsRight: {
    flex: 1,
    paddingTop: 4,
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBB9A8',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#2B1D17',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8F4EF',
    fontSize: 15,
    marginBottom: 16,
  },
  benefitsGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBB9A8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  benefitCol: {
    alignItems: 'center',
    gap: 5,
    minWidth: 52,
  },
  benefitColLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBB9A8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  benefitColPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192,138,91,0.15)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    gap: 5,
  },
  benefitColPillText: {
    fontSize: 14,
    color: '#C08A5B',
    fontWeight: '700',
  },

  saveErrorText: {
    color: '#ff3b30',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#8C6E5A',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#2B1D17',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#CBB9A8',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#C08A5B',
  },
  saveButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    color: '#F8F4EF',
    fontSize: 15,
    fontWeight: '700',
  },
});
