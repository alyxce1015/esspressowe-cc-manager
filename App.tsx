import { useState, useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import {
  Text, View, ScrollView, Pressable, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform, Image,
  useWindowDimensions, Animated,
} from 'react-native';
import { layoutStyles } from './styles/layout';
import { cardStyles } from './styles/card';
import { modalStyles } from './styles/modal';
import { FontAwesome6 } from '@expo/vector-icons';
import { CARD_CATALOG, ISSUERS, type CatalogCard } from './data/cards';
import { getCards, insertCard, deleteCard, deleteCards, type UserCard } from './db/database';

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

function formatMemberSince(input: string): string {
  const digits = input.replace(/[^0-9]/g, '').slice(0, 6);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

// Parses "MM/YYYY" → "YYYY-MM-01", returns undefined if invalid or out of range
function parseMemberSince(input: string): string | undefined {
  const match = input.trim().match(/^(\d{1,2})\/(\d{4})$/);
  if (!match) return undefined;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  if (month < 1 || month > 12) return undefined;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const minYear = currentYear - 60;

  if (year < minYear || (year === minYear && month < currentMonth)) return undefined;
  if (year > currentYear || (year === currentYear && month > currentMonth)) return undefined;

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
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const [cards, setCards] = useState<UserCard[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'pick' | 'details'>('pick');
  const [selectedCard, setSelectedCard] = useState<CatalogCard | null>(null);
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('All');
  const [form, setForm] = useState({ customName: '', lastFour: '', dueDay: '', limit: '', memberSince: '' });
  const [saveError, setSaveError] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState('');

  const stepAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getCards()
      .then(setCards)
      .catch((e) => setSaveError('Could not load cards: ' + (e instanceof Error ? e.message : String(e))));
  }, []);

  if (!fontsLoaded) return null;

  function enterSelectMode() {
    setSelectMode(true);
    setSelectedIds(new Set());
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleDeleteOne(id: string) {
    setDeleteError('');
    setCards(prev => prev.filter(c => c.id !== id));
    try {
      await deleteCard(id);
    } catch (e) {
      setCards(await getCards());
      setDeleteError(e instanceof Error ? e.message : 'Could not remove card');
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    setDeleteError('');
    const ids = [...selectedIds];
    exitSelectMode();
    setCards(prev => prev.filter(c => !ids.includes(c.id)));
    try {
      await deleteCards(ids);
    } catch (e) {
      setCards(await getCards());
      setDeleteError(e instanceof Error ? e.message : 'Could not remove cards');
    }
  }

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
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      setSaveError(`Date must be MM/YYYY, between ${mm}/${yyyy - 60} and ${mm}/${yyyy}.`);
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
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Cards</Text>
        {cards.length > 0 && (
          <Pressable onPress={selectMode ? exitSelectMode : enterSelectMode} hitSlop={8}>
            <Text style={styles.selectButton}>{selectMode ? 'Cancel' : 'Select'}</Text>
          </Pressable>
        )}
      </View>

      {deleteError !== '' && (
        <Text style={styles.deleteErrorText}>{deleteError}</Text>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {cards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No cards yet</Text>
            <Text style={styles.emptyStateSub}>Tap + Add Card to get started</Text>
          </View>
        )}

        <View style={[styles.cardGrid, isDesktop && styles.cardGridDesktop]}>
          {cards.map((card) => {
          const catalogEntry = CARD_CATALOG.find((c) => c.id === card.catalogId);
          const imageSource = catalogEntry?.image ?? null;
          const annualFee = catalogEntry?.annualFee ?? 0;
          const benefits = catalogEntry?.benefits ?? [];

          const isSelected = selectedIds.has(card.id);

          return (
            <View key={card.id} style={isDesktop ? styles.cardGridItem : undefined}>
              <View style={[styles.card, isSelected && styles.cardSelected]}>
              {/* Card content — Pressable only active in select mode */}
              <Pressable
                style={({ pressed }) => [
                  styles.cardInner,
                  pressed && selectMode && styles.cardPressed,
                ]}
                onPress={selectMode ? () => toggleSelect(card.id) : undefined}
              >
                {/* Checkbox in select mode */}
                {selectMode && (
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <FontAwesome6 name="check" size={10} color="#fff" iconStyle="solid" />}
                  </View>
                )}

                {/* Card image */}
                <View style={[styles.cardImageWrap, { backgroundColor: card.color }]}>
                  {imageSource
                    ? <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
                    : <Text style={styles.customCardLabel}>{card.name}</Text>
                  }
                </View>

                {/* Card info */}
                <View style={styles.cardInfo}>

                  {/* Name + credit limit badge */}
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
                    {card.limit ? (
                      <View style={styles.feeBadge}>
                        <Text style={styles.feeBadgeText}>{card.limit}</Text>
                      </View>
                    ) : null}
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
                      <View style={styles.progressRow}>
                        <View style={[styles.progressTrack, { flex: 1 }]}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${Math.round(renewalProgress(card.memberSince) * 100)}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressFeeLabel}>${annualFee}/yr</Text>
                      </View>
                      <Text style={styles.renewalDateText}>
                        {formatRenewalDate(card.memberSince)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.setDateHint}>Add open date to track ${annualFee}/yr renewal</Text>
                  )}

                  {/* Benefit chips */}
                  {benefits.length > 0 && (
                    <View style={styles.benefitsRow}>
                      {benefits.slice(0, 3).map((b, i) => (
                        <View key={i} style={styles.benefitChip}>
                          <FontAwesome6 name={b.icon} size={10} color="#6c6c70" iconStyle="solid" />
                          <Text style={styles.benefitChipText}> {b.multiplier}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </Pressable>

              {/* Trash button — sibling to content, not nested inside it */}
              {!selectMode && (
                <Pressable style={styles.trashButton} onPress={() => handleDeleteOne(card.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => (
                    <FontAwesome6 name="trash" size={14} color={hovered || pressed ? '#ff0000' : '#ff3b30'} iconStyle="solid" />
                  )}
                </Pressable>
              )}
              </View>
            </View>
          );
        })}
        </View>
      </ScrollView>

      {selectMode ? (
        <View style={styles.selectModeBar}>
          <Text style={styles.selectedCount}>
            {selectedIds.size === 0 ? 'Tap cards to select' : `${selectedIds.size} selected`}
          </Text>
          <TouchableOpacity
            style={[
              styles.deleteSelectedButton,
              selectedIds.size === 0 && styles.deleteSelectedButtonDisabled,
            ]}
            onPress={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            activeOpacity={0.75}
          >
            <Text style={[styles.deleteSelectedText, selectedIds.size === 0 && styles.deleteSelectedTextDisabled]}>
              {selectedIds.size > 0 ? `Remove (${selectedIds.size})` : 'Remove'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={openModal}
        >
          <Text style={styles.addButtonText}>+ Add Card</Text>
        </Pressable>
      )}

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
                        value={form.memberSince}
                        onChangeText={(v) => setForm((f) => ({ ...f, memberSince: formatMemberSince(v) }))}
                      />

                      {selectedCard && selectedCard.benefits.length > 0 && (
                        <>
                          <Text style={styles.benefitsGridLabel}>Benefits</Text>
                          <View style={styles.benefitsGrid}>
                            {selectedCard.benefits.map((b, i) => (
                              <View key={i} style={styles.benefitCol}>
                                <Text style={styles.benefitColLabel}>{b.category}</Text>
                                <View style={styles.benefitColPill}>
                                  <FontAwesome6 name={b.icon} size={13} color="#007aff" iconStyle="solid" />
                                  <Text style={styles.benefitColPillText}>{b.multiplier}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </>
                      )}
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
