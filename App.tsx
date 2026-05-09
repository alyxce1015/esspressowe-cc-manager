import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Modal, TextInput, KeyboardAvoidingView, Platform, Image,
  useWindowDimensions, Animated,
} from 'react-native';
import { CARD_CATALOG, ISSUERS, type CatalogCard } from './data/cards';
import { getCards, insertCard, type UserCard } from './db/database';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function formatCurrency(input: string): string {
  const digits = input.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return '$' + parseInt(digits, 10).toLocaleString('en-US');
}

export default function App() {
  const { height: windowHeight } = useWindowDimensions();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'pick' | 'details'>('pick');
  const [selectedCard, setSelectedCard] = useState<CatalogCard | null>(null);
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('All');
  const [form, setForm] = useState({ customName: '', lastFour: '', dueDay: '', limit: '' });
  const [saveError, setSaveError] = useState('');

  const stepAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('Loading cards from Supabase...');
    getCards()
      .then((loaded) => {
        console.log('Cards loaded:', loaded.length);
        setCards(loaded);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('Failed to load cards:', msg);
        setSaveError('Could not load cards: ' + msg);
      });
  }, []);

  function openModal() {
    setStep('pick');
    setSelectedCard(null);
    setSearch('');
    setIssuerFilter('All');
    setForm({ customName: '', lastFour: '', dueDay: '', limit: '' });
    setSaveError('');
    stepAnim.setValue(1);
    setModalVisible(true);
  }

  function animateStep(callback: () => void) {
    Animated.timing(stepAnim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(stepAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  }

  function pickCard(card: CatalogCard) {
    animateStep(() => {
      setSelectedCard(card);
      setStep('details');
    });
  }

  function goBack() {
    animateStep(() => setStep('pick'));
  }

  async function saveCard() {
    setSaveError('');
    console.log('saveCard called', { selectedCard: selectedCard?.id, form });

    if (!selectedCard) {
      setSaveError('No card selected.');
      return;
    }

    const dueDay = parseInt(form.dueDay, 10);
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      setSaveError('Enter a due day between 1 and 31.');
      return;
    }

    const name = selectedCard.id === 'custom' ? form.customName.trim() : selectedCard.name;
    if (!name) {
      setSaveError('Card name is required.');
      return;
    }

    const newCard = {
      id: generateUUID(),
      catalogId: selectedCard.id,
      name,
      lastFour: form.lastFour.trim(),
      dueDay,
      limit: form.limit.trim(),
      imageUrl: '',
      color: selectedCard.color,
    };

    console.log('Inserting card:', newCard);

    try {
      await insertCard(newCard);
      console.log('Insert succeeded, refreshing list...');
      setCards(await getCards());
      setModalVisible(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Insert failed:', msg);
      setSaveError(msg);
    }
  }

  const filteredCatalog = CARD_CATALOG.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase());
    const matchesIssuer = issuerFilter === 'All' || card.issuer === issuerFilter;
    return matchesSearch && matchesIssuer;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.header}>My Cards</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {cards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No cards yet</Text>
            <Text style={styles.emptyStateSub}>Tap + Add Card to get started</Text>
          </View>
        )}
        {cards.map((card) => {
          const catalogEntry = CARD_CATALOG.find((c) => c.id === card.catalogId);
          const imageSource = catalogEntry?.image ?? null;
          return (
            <Pressable
              key={card.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={[styles.cardImageWrap, { backgroundColor: card.color }]}>
                {imageSource ? (
                  <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.customCardLabel}>{card.name}</Text>
                )}
              </View>
              <View style={styles.cardBodyLeft}>
                <Text style={styles.cardName}>{card.name}</Text>
                <Text style={styles.cardLast4}>•••• {card.lastFour}</Text>
              </View>
              <View style={styles.cardBodyRight}>
                <View>
                  <Text style={styles.label}>Due</Text>
                  <Text style={styles.value}>{ordinal(card.dueDay)}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Limit</Text>
                  <Text style={styles.value}>{card.limit || '—'}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        onPress={openModal}
      >
        <Text style={styles.addButtonText}>+ Add Card</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { height: windowHeight * 0.92 }]}>

            {/* drag handle */}
            <View style={styles.dragHandle} />

            <Animated.View style={{ flex: 1, opacity: stepAnim }}>
              {step === 'pick' ? (
                <View style={{ flex: 1 }}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Choose a Card</Text>
                    <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                      <Text style={styles.closeButton}>✕</Text>
                    </Pressable>
                  </View>

                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search cards..."
                    placeholderTextColor="#aeaeb2"
                    value={search}
                    onChangeText={setSearch}
                  />

                  <View style={styles.issuerFilterRow}>
                    {ISSUERS.map((issuer) => (
                      <Pressable
                        key={issuer}
                        style={[styles.issuerPill, issuerFilter === issuer && styles.issuerPillActive]}
                        onPress={() => setIssuerFilter(issuer)}
                      >
                        <Text style={[styles.issuerPillText, issuerFilter === issuer && styles.issuerPillTextActive]}>
                          {issuer}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <ScrollView style={styles.catalogList} showsVerticalScrollIndicator={false}>
                    {filteredCatalog.map((card) => (
                      <Pressable
                        key={card.id}
                        style={({ pressed }) => [styles.catalogItem, pressed && styles.catalogItemPressed]}
                        onPress={() => pickCard(card)}
                      >
                        <View style={[styles.catalogImageWrap, { backgroundColor: card.color }]}>
                          {card.image ? (
                            <Image source={card.image} style={styles.catalogImage} resizeMode="cover" />
                          ) : (
                            <Text style={styles.catalogCustomLabel}>Custom</Text>
                          )}
                        </View>
                        <View style={styles.catalogItemInfo}>
                          <Text style={styles.catalogCardName}>{card.name}</Text>
                          <Text style={styles.catalogCardIssuer}>{card.issuer}</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                  <View style={styles.modalHeader}>
                    <Pressable onPress={goBack} hitSlop={8}>
                      <Text style={styles.backButton}>‹  Back</Text>
                    </Pressable>
                    <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                      <Text style={styles.closeButton}>✕</Text>
                    </Pressable>
                  </View>

                  {/* Two-column body */}
                  <View style={styles.detailsRow}>

                    {/* Left: card thumbnail + name */}
                    <View style={styles.detailsLeft}>
                      <View style={[styles.detailThumb, { backgroundColor: selectedCard?.color }]}>
                        {selectedCard?.image ? (
                          <Image source={selectedCard.image} style={styles.detailThumbImage} resizeMode="cover" />
                        ) : (
                          <Text style={styles.customCardLabel}>
                            {form.customName || 'Custom'}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.detailCardName} numberOfLines={3}>
                        {selectedCard?.id === 'custom'
                          ? (form.customName || 'Custom Card')
                          : selectedCard?.name}
                      </Text>
                    </View>

                    {/* Right: input fields */}
                    <ScrollView
                      style={styles.detailsRight}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      {selectedCard?.id === 'custom' && (
                        <>
                          <Text style={styles.inputLabel}>Card Name</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="e.g. My Store Card"
                            placeholderTextColor="#aeaeb2"
                            value={form.customName}
                            onChangeText={(v) => setForm((f) => ({ ...f, customName: v }))}
                          />
                        </>
                      )}

                      <Text style={styles.inputLabel}>Last 4 Digits</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="4821"
                        placeholderTextColor="#aeaeb2"
                        keyboardType="numeric"
                        maxLength={4}
                        value={form.lastFour}
                        onChangeText={(v) => setForm((f) => ({ ...f, lastFour: v }))}
                      />

                      <Text style={styles.inputLabel}>Due Day (1–31)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="15"
                        placeholderTextColor="#aeaeb2"
                        keyboardType="numeric"
                        maxLength={2}
                        value={form.dueDay}
                        onChangeText={(v) => setForm((f) => ({ ...f, dueDay: v }))}
                      />

                      <Text style={styles.inputLabel}>Credit Limit</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="$10,000"
                        placeholderTextColor="#aeaeb2"
                        keyboardType="numeric"
                        value={form.limit}
                        onChangeText={(v) => setForm((f) => ({ ...f, limit: formatCurrency(v) }))}
                      />
                    </ScrollView>
                  </View>

                  {/* Inline error */}
                  {saveError !== '' && (
                    <Text style={styles.saveErrorText}>{saveError}</Text>
                  )}

                  {/* Buttons — full width below both columns */}
                  <View style={styles.modalButtons}>
                    <Pressable
                      style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
                      onPress={saveCard}
                    >
                      <Text style={styles.saveButtonText}>Save Card</Text>
                    </Pressable>
                  </View>
                </KeyboardAvoidingView>
              )}
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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

  // Home screen cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  cardImageWrap: {
    width: 90,
    height: 57,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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
  },
  cardBodyLeft: {
    flex: 1,
  },
  cardBodyRight: {
    flexDirection: 'row',
    gap: 16,
    flexShrink: 0,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 2,
  },
  cardLast4: {
    fontSize: 13,
    color: '#6c6c70',
  },
  label: {
    fontSize: 11,
    color: '#aeaeb2',
    marginBottom: 2,
    textAlign: 'right',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1c1c1e',
    textAlign: 'right',
  },

  // Empty state
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

  // Add button
  addButton: {
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
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

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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

  // Search
  searchInput: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#1c1c1e',
    fontSize: 15,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // Issuer filter
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

  // Catalog list
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
    paddingHorizontal: 12,
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
  chevron: {
    fontSize: 20,
    color: '#c7c7cc',
  },

  // Details step — two-column layout
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
  },
  detailThumb: {
    width: '90%',
    aspectRatio: 1.586,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1c1c1e',
    fontSize: 15,
    marginBottom: 16,
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
    borderRadius: 14,
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
    borderRadius: 14,
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
