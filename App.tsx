import { useState, useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import {
  Text, View, ScrollView, Pressable,
  Modal, TextInput, KeyboardAvoidingView, Platform, Image,
  useWindowDimensions, Animated,
} from 'react-native';
import { layoutStyles } from './styles/layout';
import { cardStyles } from './styles/card';
import { modalStyles } from './styles/modal';
import { FontAwesome6 } from '@expo/vector-icons';
import { CARD_CATALOG, ISSUERS, type CatalogCard } from './data/cards';
import { getCards, insertCard, type UserCard } from './db/database';

// ─── Helpers ────────────────────────────────────────────────────────────────


function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
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

// Parses "MM/YYYY" → "YYYY-MM-01", returns undefined if invalid
function parseMemberSince(input: string): string | undefined {
  const match = input.trim().match(/^(\d{1,2})\/(\d{4})$/);
  if (!match) return undefined;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  if (month < 1 || month > 12) return undefined;
  if (year < 1990 || year > new Date().getFullYear() + 1) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function nextRenewalDate(memberSince: string): Date {
  const since = new Date(memberSince + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let renewal = new Date(today.getFullYear(), since.getMonth(), since.getDate());
  if (renewal <= today) renewal = new Date(today.getFullYear() + 1, since.getMonth(), since.getDate());
  return renewal;
}

function daysUntilRenewal(memberSince: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((nextRenewalDate(memberSince).getTime() - today.getTime()) / 86400000);
}

function renewalProgress(memberSince: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = nextRenewalDate(memberSince);
  const prev = new Date(renewal);
  prev.setFullYear(prev.getFullYear() - 1);
  const total = renewal.getTime() - prev.getTime();
  const elapsed = today.getTime() - prev.getTime();
  return Math.max(0, Math.min(1, elapsed / total));
}

function formatRenewalDate(memberSince: string): string {
  return nextRenewalDate(memberSince).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function App() {
  const [fontsLoaded] = useFonts(FontAwesome6.font);
  const { height: windowHeight } = useWindowDimensions();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'pick' | 'details'>('pick');
  const [selectedCard, setSelectedCard] = useState<CatalogCard | null>(null);
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('All');
  const [form, setForm] = useState({ customName: '', lastFour: '', dueDay: '', limit: '', memberSince: '' });
  const [saveError, setSaveError] = useState('');

  const stepAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getCards()
      .then(setCards)
      .catch((e) => setSaveError('Could not load cards: ' + (e instanceof Error ? e.message : String(e))));
  }, []);

  if (!fontsLoaded) return null;

  function openModal() {
    setStep('pick');
    setSelectedCard(null);
    setSearch('');
    setIssuerFilter('All');
    setForm({ customName: '', lastFour: '', dueDay: '', limit: '', memberSince: '' });
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
    animateStep(() => { setSelectedCard(card); setStep('details'); });
  }

  function goBack() {
    animateStep(() => setStep('pick'));
  }

  async function saveCard() {
    setSaveError('');
    if (!selectedCard) { setSaveError('No card selected.'); return; }

    const dueDay = parseInt(form.dueDay, 10);
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      setSaveError('Enter a due day between 1 and 31.');
      return;
    }

    const name = selectedCard.id === 'custom' ? form.customName.trim() : selectedCard.name;
    if (!name) { setSaveError('Card name is required.'); return; }

    const memberSince = form.memberSince.trim() ? parseMemberSince(form.memberSince) : undefined;
    if (form.memberSince.trim() && !memberSince) {
      setSaveError('Enter card open date as MM/YYYY (e.g. 04/2023).');
      return;
    }

    try {
      await insertCard({
        id: generateUUID(),
        catalogId: selectedCard.id,
        name,
        lastFour: form.lastFour.trim(),
        dueDay,
        limit: form.limit.trim(),
        imageUrl: '',
        color: selectedCard.color,
        memberSince,
      });
      setCards(await getCards());
      setModalVisible(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    }
  }

  const filteredCatalog = CARD_CATALOG.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesIssuer = issuerFilter === 'All' || c.issuer === issuerFilter;
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
          const annualFee = catalogEntry?.annualFee ?? 0;
          const benefits = catalogEntry?.benefits ?? [];

          return (
            <Pressable
              key={card.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              {/* Card image */}
              <View style={[styles.cardImageWrap, { backgroundColor: card.color }]}>
                {imageSource
                  ? <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
                  : <Text style={styles.customCardLabel}>{card.name}</Text>
                }
              </View>

              {/* Card info */}
              <View style={styles.cardInfo}>

                {/* Name + annual fee badge */}
                <View style={styles.cardNameRow}>
                  <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
                  <View style={styles.feeBadge}>
                    <Text style={styles.feeBadgeText}>
                      {annualFee === 0 ? '$0' : `$${annualFee}`}
                    </Text>
                  </View>
                </View>

                {/* Last 4 */}
                <Text style={styles.cardLast4}>•••• {card.lastFour}</Text>

                {/* Annual fee section */}
                {annualFee === 0 ? (
                  <View style={styles.noFeePill}>
                    <Text style={styles.noFeePillText}>No annual fee</Text>
                  </View>
                ) : card.memberSince ? (
                  <View style={styles.renewalSection}>
                    <View style={styles.renewalRow}>
                      <Text style={styles.renewalLabel}>Next annual fee</Text>
                      <Text style={styles.daysText}>
                        {daysUntilRenewal(card.memberSince)} days remaining
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.round(renewalProgress(card.memberSince) * 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.renewalDateText}>
                      {formatRenewalDate(card.memberSince)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.setDateHint}>Add open date to track renewal</Text>
                )}

                {/* Benefit chips */}
                {benefits.length > 0 && (
                  <View style={styles.benefitsRow}>
                    {benefits.slice(0, 3).map((b, i) => (
                      <View key={i} style={styles.benefitChip}>
                        <FontAwesome6 name={b.icon} size={10} color="#6c6c70" iconStyle="regular" />
                        <Text style={styles.benefitChipText}> {b.multiplier}</Text>
                      </View>
                    ))}
                  </View>
                )}
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

      {/* ── Add Card Modal ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { height: windowHeight * 0.92 }]}>
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
                          {card.image
                            ? <Image source={card.image} style={styles.catalogImage} resizeMode="cover" />
                            : <Text style={styles.catalogCustomLabel}>Custom</Text>
                          }
                        </View>
                        <View style={styles.catalogItemInfo}>
                          <Text style={styles.catalogCardName}>{card.name}</Text>
                          <Text style={styles.catalogCardIssuer}>{card.issuer}</Text>
                        </View>
                        {card.annualFee > 0 && (
                          <View style={styles.catalogFeeBadge}>
                            <Text style={styles.catalogFeeBadgeText}>${card.annualFee}/yr</Text>
                          </View>
                        )}
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

                  <View style={styles.detailsRow}>
                    {/* Left: card thumb + name */}
                    <View style={styles.detailsLeft}>
                      <View style={[styles.detailThumb, { backgroundColor: selectedCard?.color }]}>
                        {selectedCard?.image
                          ? <Image source={selectedCard.image} style={styles.detailThumbImage} resizeMode="cover" />
                          : <Text style={styles.customCardLabel}>{form.customName || 'Custom'}</Text>
                        }
                      </View>
                      <Text style={styles.detailCardName} numberOfLines={3}>
                        {selectedCard?.id === 'custom'
                          ? (form.customName || 'Custom Card')
                          : selectedCard?.name}
                      </Text>
                      {selectedCard && selectedCard.annualFee > 0 && (
                        <View style={styles.detailFeePill}>
                          <Text style={styles.detailFeePillText}>${selectedCard.annualFee}/yr</Text>
                        </View>
                      )}
                      {selectedCard && selectedCard.annualFee === 0 && (
                        <View style={styles.detailNoFeePill}>
                          <Text style={styles.detailNoFeePillText}>No annual fee</Text>
                        </View>
                      )}
                    </View>

                    {/* Right: inputs */}
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

                      <Text style={styles.inputLabel}>Card Opened (MM/YYYY)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="04/2023"
                        placeholderTextColor="#aeaeb2"
                        keyboardType="numeric"
                        maxLength={7}
                        value={form.memberSince}
                        onChangeText={(v) => setForm((f) => ({ ...f, memberSince: v }))}
                      />
                    </ScrollView>
                  </View>

                  {saveError !== '' && (
                    <Text style={styles.saveErrorText}>{saveError}</Text>
                  )}

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

const styles = { ...layoutStyles, ...cardStyles, ...modalStyles };
