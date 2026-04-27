import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Modal, TextInput, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { CARD_CATALOG, ISSUERS, type CatalogCard } from './data/cards';

type UserCard = {
  id: string;
  catalogId: string;
  name: string;
  lastFour: string;
  dueDay: number;
  limit: string;
  imageUrl: string;
  color: string;
};

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const initialCards: UserCard[] = [
  {
    id: '1',
    catalogId: 'chase-freedom-flex',
    name: 'Chase Freedom Flex',
    lastFour: '4821',
    dueDay: 15,
    limit: '$10,000',
    imageUrl: 'https://images.ctfassets.net/8qmz0ef3xzub/7KrVet3yXT2YntiE8PqwAe/8705c3a1b357e949f56bbab918e3cf11/freedom_flex_card_alt.webp',
    color: '#1a3a5c',
  },
  {
    id: '2',
    catalogId: 'apple-card',
    name: 'Apple Card',
    lastFour: '3390',
    dueDay: 27,
    limit: '$5,000',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/4528cd20-add2-11eb-b8c6-230f8597051d/ff9cbb30ffe2501aa1b667251366a4faf92194234ad19d87f24ccd8c839c5c7b.jpg',
    color: '#555555',
  },
  {
    id: '3',
    catalogId: 'discover-it',
    name: 'Discover it Cash Back',
    lastFour: '7712',
    dueDay: 2,
    limit: '$3,500',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/a4a36a73-0294-4ca1-b36b-3eef5cee53ca/a1de1f5a52d4ab48b729c2ea25588d40b1b0382c84ddac318b584f1d62aa37bd.jpg',
    color: '#f06423',
  },
];

export default function App() {
  const [cards, setCards] = useState<UserCard[]>(initialCards);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'pick' | 'details'>('pick');
  const [selectedCard, setSelectedCard] = useState<CatalogCard | null>(null);
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('All');
  const [form, setForm] = useState({ customName: '', lastFour: '', dueDay: '', limit: '' });

  function openModal() {
    setStep('pick');
    setSelectedCard(null);
    setSearch('');
    setIssuerFilter('All');
    setForm({ customName: '', lastFour: '', dueDay: '', limit: '' });
    setModalVisible(true);
  }

  function pickCard(card: CatalogCard) {
    setSelectedCard(card);
    setStep('details');
  }

  function saveCard() {
    if (!selectedCard) return;
    const dueDay = parseInt(form.dueDay, 10);
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) return;
    const name = selectedCard.id === 'custom' ? form.customName.trim() : selectedCard.name;
    if (!name) return;

    setCards((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        catalogId: selectedCard.id,
        name,
        lastFour: form.lastFour.trim(),
        dueDay,
        limit: form.limit.trim(),
        imageUrl: selectedCard.imageUrl,
        color: selectedCard.color,
      },
    ]);
    setModalVisible(false);
  }

  const filteredCatalog = CARD_CATALOG.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase());
    const matchesIssuer = issuerFilter === 'All' || card.issuer === issuerFilter;
    return matchesSearch && matchesIssuer;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.header}>My Cards</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={[styles.cardImageWrap, { backgroundColor: card.color }]}>
              {card.imageUrl ? (
                <Image source={{ uri: card.imageUrl }} style={styles.cardImage} resizeMode="cover" />
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
                <Text style={styles.value}>{card.limit}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>+ Add Card</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {step === 'pick' ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choose Your Card</Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                <TextInput
                  style={styles.searchInput}
                  placeholder="Search cards..."
                  placeholderTextColor="#555570"
                  value={search}
                  onChangeText={setSearch}
                />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.issuerFilterContent}
                  style={styles.issuerFilterRow}
                >
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
                </ScrollView>

                <ScrollView style={styles.catalogList}>
                  {filteredCatalog.map((card) => (
                    <Pressable key={card.id} style={styles.catalogItem} onPress={() => pickCard(card)}>
                      <View style={[styles.catalogImageWrap, { backgroundColor: card.color }]}>
                        {card.imageUrl ? (
                          <Image source={{ uri: card.imageUrl }} style={styles.catalogImage} resizeMode="cover" />
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
              </>
            ) : (
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <View style={styles.modalHeader}>
                  <Pressable onPress={() => setStep('pick')}>
                    <Text style={styles.backButton}>‹  Back</Text>
                  </Pressable>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.detailsContent}>
                  <View style={[styles.detailPreviewWrap, { backgroundColor: selectedCard?.color }]}>
                    {selectedCard?.imageUrl ? (
                      <Image source={{ uri: selectedCard.imageUrl }} style={styles.detailPreview} resizeMode="cover" />
                    ) : (
                      <Text style={styles.customCardLabel}>Custom Card</Text>
                    )}
                  </View>

                  {selectedCard?.id !== 'custom' && (
                    <Text style={styles.selectedCardName}>{selectedCard?.name}</Text>
                  )}

                  {selectedCard?.id === 'custom' && (
                    <>
                      <Text style={styles.inputLabel}>Card Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. My Store Card"
                        placeholderTextColor="#555570"
                        value={form.customName}
                        onChangeText={(v) => setForm((f) => ({ ...f, customName: v }))}
                      />
                    </>
                  )}

                  <Text style={styles.inputLabel}>Last 4 Digits</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 4821"
                    placeholderTextColor="#555570"
                    keyboardType="numeric"
                    maxLength={4}
                    value={form.lastFour}
                    onChangeText={(v) => setForm((f) => ({ ...f, lastFour: v }))}
                  />

                  <Text style={styles.inputLabel}>Payment Due Day (1–31)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 15"
                    placeholderTextColor="#555570"
                    keyboardType="numeric"
                    maxLength={2}
                    value={form.dueDay}
                    onChangeText={(v) => setForm((f) => ({ ...f, dueDay: v }))}
                  />

                  <Text style={styles.inputLabel}>Credit Limit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. $10,000"
                    placeholderTextColor="#555570"
                    value={form.limit}
                    onChangeText={(v) => setForm((f) => ({ ...f, limit: v }))}
                  />

                  <View style={styles.modalButtons}>
                    <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={styles.saveButton} onPress={saveCard}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Home screen cards
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  cardImageWrap: {
    width: 90,
    height: 57,
    borderRadius: 6,
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
    color: '#ffffff',
    marginBottom: 2,
  },
  cardLast4: {
    fontSize: 13,
    color: '#a0a0b0',
  },
  label: {
    fontSize: 11,
    color: '#a0a0b0',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e94560',
    textAlign: 'right',
  },

  // Add button
  addButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalSheet: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 18,
    color: '#a0a0b0',
    padding: 4,
  },
  backButton: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: '600',
  },

  // Search
  searchInput: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 15,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // Issuer filter
  issuerFilterRow: {
    marginBottom: 12,
  },
  issuerFilterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  issuerPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0f3460',
  },
  issuerPillActive: {
    backgroundColor: '#e94560',
  },
  issuerPillText: {
    color: '#a0a0b0',
    fontSize: 13,
    fontWeight: '500',
  },
  issuerPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
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
    borderBottomColor: '#0f3460',
  },
  catalogImageWrap: {
    width: 90,
    height: 57,
    borderRadius: 6,
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
    color: '#ffffff',
    marginBottom: 2,
  },
  catalogCardIssuer: {
    fontSize: 12,
    color: '#a0a0b0',
  },
  chevron: {
    fontSize: 22,
    color: '#a0a0b0',
  },

  // Details step
  detailsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  detailPreviewWrap: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailPreview: {
    width: '100%',
    height: '100%',
  },
  selectedCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: '#a0a0b0',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#0f3460',
  },
  cancelButtonText: {
    color: '#a0a0b0',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#e94560',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
