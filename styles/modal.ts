import { StyleSheet } from 'react-native';

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e5e5ea',
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
    color: '#1c1c1e',
    letterSpacing: -0.3,
  },
  closeButton: {
    fontSize: 16,
    color: '#aeaeb2',
    padding: 4,
  },
  backButton: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '500',
  },

  searchInput: {
    backgroundColor: '#f2f2f7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#1c1c1e',
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
    backgroundColor: '#f2f2f7',
  },
  issuerPillActive: {
    backgroundColor: '#1c1c1e',
  },
  issuerPillText: {
    color: '#6c6c70',
    fontSize: 13,
    fontWeight: '500',
  },
  issuerPillTextActive: {
    color: '#ffffff',
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
    borderBottomColor: '#f2f2f7',
    gap: 12,
  },
  catalogItemPressed: {
    backgroundColor: '#f9f9fb',
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
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  catalogItemInfo: {
    flex: 1,
  },
  catalogCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 2,
  },
  catalogCardIssuer: {
    fontSize: 12,
    color: '#aeaeb2',
  },
  catalogFeeBadge: {
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catalogFeeBadgeText: {
    fontSize: 11,
    color: '#6c6c70',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: '#c7c7cc',
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
    color: '#1c1c1e',
    textAlign: 'center',
    lineHeight: 18,
  },
  detailFeePill: {
    backgroundColor: '#007aff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  detailFeePillText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  detailNoFeePill: {
    backgroundColor: '#e8f8ed',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  detailNoFeePillText: {
    color: '#34c759',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsRight: {
    flex: 1,
    paddingTop: 4,
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#aeaeb2',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1c1c1e',
    fontSize: 15,
    marginBottom: 16,
  },
  benefitsGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#aeaeb2',
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
    fontSize: 9,
    fontWeight: '600',
    color: '#aeaeb2',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  benefitColPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f6ff',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  benefitColPillText: {
    fontSize: 12,
    color: '#007aff',
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
    borderTopColor: '#f2f2f7',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#6c6c70',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  saveButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
