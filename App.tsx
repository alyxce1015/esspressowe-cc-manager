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
import { dashStyles as ds } from './styles/dashboard';
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

function ordinal(n: number): string {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
}

function daysUntilDue(dueDay: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let due = new Date(today.getFullYear(), today.getMonth(), dueDay);
  due.setHours(0, 0, 0, 0);
  if (due < today) due = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

function formatCurrency(input: string): string {
  const digits = input.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return '$' + parseInt(digits, 10).toLocaleString('en-US');
}

// Card Opened field (no-fee cards) — MM/YYYY input helpers
function formatMemberSince(input: string): string {
  const digits = input.replace(/[^0-9]/g, '').slice(0, 6);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

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
  if (year < minYear || year > currentYear) return undefined;
  if (year === currentYear && month > currentMonth) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function formatCardOpened(memberSince: string): string {
  const d = new Date(memberSince + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getCardAge(memberSince: string): string {
  const opened = new Date(memberSince + 'T00:00:00');
  const today = new Date();
  const totalMonths = (today.getFullYear() - opened.getFullYear()) * 12 + (today.getMonth() - opened.getMonth());
  if (totalMonths < 1) return '< 1 mo old';
  if (totalMonths < 12) return `${totalMonths} mo old`;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (months === 0) return `${years} yr${years > 1 ? 's' : ''} old`;
  return `${years} yr${years > 1 ? 's' : ''} ${months} mo old`;
}

// Fee Due Date field (annual-fee cards) — MM/DD/YYYY input helpers
function formatFeeDueDateInput(input: string): string {
  const digits = input.replace(/[^0-9]/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

function parseFeeDueDate(input: string): string | undefined {
  const match = input.trim().match(/^(\d{2})\/(\d{2})$/);
  if (!match) return undefined;
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  // Validate the day exists in that month (use a leap year so Feb 29 is valid)
  const d = new Date(2000, month - 1, day);
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return undefined;
  return `2000-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Annual fee renewal tracking — based on exact fee due date
function nextRenewalDate(feeDueDate: string): Date {
  const due = new Date(feeDueDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let renewal = new Date(due);
  renewal.setFullYear(today.getFullYear());
  renewal.setHours(0, 0, 0, 0);
  if (renewal < today) {
    renewal.setFullYear(today.getFullYear() + 1);
    renewal.setHours(0, 0, 0, 0);
  }
  return renewal;
}

function daysUntilRenewal(feeDueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((nextRenewalDate(feeDueDate).getTime() - today.getTime()) / 86400000);
}

function renewalProgress(feeDueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = nextRenewalDate(feeDueDate);
  const prev = new Date(renewal);
  prev.setFullYear(prev.getFullYear() - 1);
  const total = renewal.getTime() - prev.getTime();
  const elapsed = today.getTime() - prev.getTime();
  return Math.max(0, Math.min(1, elapsed / total));
}

function formatRenewalDate(feeDueDate: string): string {
  return nextRenewalDate(feeDueDate).toLocaleDateString('en-US', {
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
  const [form, setForm] = useState({ customName: '', lastFour: '', dueDay: '', limit: '', memberSince: '', feeDueDate: '' });
  const [saveError, setSaveError] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'cards' | 'benefits' | 'more'>('home');
  const [, setTick] = useState(0);

  const stepAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getCards()
      .then(setCards)
      .catch((e) => setSaveError('Could not load cards: ' + (e instanceof Error ? e.message : String(e))));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 60_000);
    return () => clearInterval(id);
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
    setForm({ customName: '', lastFour: '', dueDay: '', limit: '', memberSince: '', feeDueDate: '' });
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

    const hasFee = selectedCard.annualFee > 0;

    // All cards: validate Card Opened (MM/YYYY)
    const memberSince = form.memberSince.trim() ? parseMemberSince(form.memberSince) : undefined;
    if (form.memberSince.trim() && !memberSince) {
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      setSaveError(`Date must be MM/YYYY, between ${mm}/${yyyy - 60} and ${mm}/${yyyy}.`);
      return;
    }

    // Fee cards: validate Fee Due Date (MM/DD/YYYY)
    const feeDueDate = hasFee && form.feeDueDate.trim() ? parseFeeDueDate(form.feeDueDate) : undefined;
    if (hasFee && form.feeDueDate.trim() && !feeDueDate) {
      setSaveError('Enter a valid fee due date (MM/DD/YYYY).');
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
        feeDueDate,
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

  // Dashboard computations
  const totalLimitValue = cards.reduce((sum, c) => {
    const n = parseInt(c.limit.replace(/[^0-9]/g, ''), 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const totalAnnualFees = cards.reduce((sum, c) => {
    const cat = CARD_CATALOG.find(x => x.id === c.catalogId);
    return sum + (cat?.annualFee ?? 0);
  }, 0);

  const sortedByDue = [...cards]
    .map(c => ({ ...c, days: daysUntilDue(c.dueDay) }))
    .filter(c => c.days <= 15)
    .sort((a, b) => a.days - b.days);

  const feesUpcoming = cards
    .filter((c): c is UserCard & { feeDueDate: string } => c.feeDueDate != null)
    .map(c => ({ ...c, days: daysUntilRenewal(c.feeDueDate) }))
    .filter(c => c.days <= 15)
    .sort((a, b) => a.days - b.days);

  const paymentInsight = sortedByDue.length > 0
    ? `${sortedByDue[0].name} · ${sortedByDue[0].days === 0 ? 'Statement due today' : sortedByDue[0].days === 1 ? 'Statement due tomorrow' : `Statement due in ${sortedByDue[0].days} days`}`
    : null;

  const feeInsight = feesUpcoming.length > 0
    ? `${feesUpcoming[0].name} · annual fee in ${feesUpcoming[0].days} days`
    : null;

  function handleTabPress(tab: typeof activeTab) {
    if (tab !== 'cards') exitSelectMode();
    setActiveTab(tab);
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={activeTab === 'home' ? 'light' : 'dark'} />

      {/* ── HOME TAB ── */}
      {activeTab === 'home' && (
        <ScrollView style={ds.homeScroll} contentContainerStyle={ds.homeScrollContent} showsVerticalScrollIndicator={false}>

          {/* Hero card */}
          <View style={ds.heroCard}>
            <View style={ds.heroLeft}>
              <Text style={ds.heroHeading}>Total Credit Available</Text>
              <Text style={ds.heroAmount}>
                {totalLimitValue > 0 ? '$' + totalLimitValue.toLocaleString('en-US') : '—'}
              </Text>
              <Text style={ds.heroSub}>
                {cards.length > 0
                  ? `Across ${cards.length} active card${cards.length !== 1 ? 's' : ''}`
                  : 'No cards added yet'}
              </Text>
              {(paymentInsight || feeInsight) ? (
                <View style={{ gap: 8, alignSelf: 'center', marginTop: 16 }}>
                  {paymentInsight && (
                    <View style={ds.insightPill}>
                      <FontAwesome6 name="credit-card" size={11} color="#C08A5B" iconStyle="solid" />
                      <Text style={ds.insightText}>{paymentInsight}</Text>
                    </View>
                  )}
                  {feeInsight && (
                    <View style={ds.insightPill}>
                      <FontAwesome6 name="receipt" size={11} color="#D4A373" iconStyle="solid" />
                      <Text style={ds.insightText}>{feeInsight}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={ds.insightPill}>
                  <FontAwesome6 name="sparkles" size={11} color="#7A9E7E" iconStyle="solid" />
                  <Text style={ds.insightText}>Add a card to see personalized insights</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats grid */}
          <View style={ds.statsGrid}>
            <View style={ds.statTile}>
              <View style={[ds.statIconWrap, { backgroundColor: 'rgba(192,138,91,0.15)' }]}>
                <FontAwesome6 name="credit-card" size={20} color="#C08A5B" iconStyle="solid" />
              </View>
              <Text style={ds.statValue}>{cards.length}</Text>
              <Text style={ds.statLabel}>Active cards</Text>
            </View>
            <View style={ds.statTile}>
              <View style={[ds.statIconWrap, { backgroundColor: 'rgba(122,158,126,0.15)' }]}>
                <FontAwesome6 name="receipt" size={20} color="#7A9E7E" iconStyle="solid" />
              </View>
              <Text style={ds.statValue}>${totalAnnualFees}</Text>
              <Text style={ds.statLabel}>Annual fees</Text>
            </View>
          </View>

          {/* Upcoming payments */}
          {sortedByDue.length > 0 && (
            <View style={ds.sectionCard}>
              <Text style={ds.sectionTitle}>Upcoming Payments</Text>
              {sortedByDue.map((item) => {
                const urgent = item.days <= 10;
                const soon = !urgent && item.days <= 15;
                const label = item.days === 0 ? 'Today' : item.days === 1 ? 'Tomorrow' : `${item.days}d`;
                return (
                  <View key={item.id} style={ds.listRow}>
                    <View style={[ds.listDot, { backgroundColor: item.color }]} />
                    <Text style={ds.listName} numberOfLines={1}>{item.name}</Text>
                    {urgent && (
                      <FontAwesome6 name="triangle-exclamation" size={13} color="#ff3b30" iconStyle="solid" />
                    )}
                    {soon && (
                      <FontAwesome6 name="triangle-exclamation" size={13} color="#ff9500" iconStyle="solid" />
                    )}
                    <Text style={[ds.listBadge, urgent && ds.listBadgeUrgent, soon && ds.listBadgeSoon]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Annual fee renewals */}
          {feesUpcoming.length > 0 && (
            <View style={ds.sectionCard}>
              <Text style={ds.sectionTitle}>Annual Fee Renewals</Text>
              {feesUpcoming.map((item) => {
                const cat = CARD_CATALOG.find(c => c.id === item.catalogId);
                const urgent = item.days <= 10;
                const soon = !urgent && item.days <= 15;
                return (
                  <View key={item.id} style={ds.listRow}>
                    <View style={[ds.listDot, { backgroundColor: item.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={ds.listName} numberOfLines={1}>{item.name}</Text>
                      <Text style={ds.listSub}>${cat?.annualFee}/yr · {formatRenewalDate(item.feeDueDate)}</Text>
                    </View>
                    {urgent && (
                      <FontAwesome6 name="triangle-exclamation" size={13} color="#ff3b30" iconStyle="solid" />
                    )}
                    {soon && (
                      <FontAwesome6 name="triangle-exclamation" size={13} color="#ff9500" iconStyle="solid" />
                    )}
                    <Text style={[ds.listBadge, urgent && ds.listBadgeUrgent, soon && ds.listBadgeSoon]}>
                      {item.days}d
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Empty state */}
          {cards.length === 0 && (
            <View style={ds.homeEmpty}>
              <FontAwesome6 name="credit-card" size={44} color="#CBB9A8" iconStyle="solid" />
              <Text style={ds.homeEmptyTitle}>No cards yet</Text>
              <Text style={ds.homeEmptySub}>Head to the Cards tab{'\n'}to add your first card</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── CARDS TAB ── */}
      {activeTab === 'cards' && (
        <View style={{ flex: 1, backgroundColor: '#5a473e', paddingTop: 60, paddingHorizontal: 20 }}>
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
                    <View style={[styles.card, isSelected && styles.cardSelected, isDesktop && { flex: 1 }]}>
                      <Pressable
                        style={({ pressed }) => [styles.cardInner, pressed && selectMode && styles.cardPressed]}
                        onPress={selectMode ? () => toggleSelect(card.id) : undefined}
                      >
                        {selectMode && (
                          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <FontAwesome6 name="check" size={10} color="#fff" iconStyle="solid" />}
                          </View>
                        )}

                        <View style={styles.cardImageColumn}>
                          <View style={[styles.cardImageWrap, { backgroundColor: card.color }]}>
                            {imageSource
                              ? <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
                              : <Text style={styles.customCardLabel}>{card.name}</Text>
                            }
                          </View>
                          {card.memberSince && (
                            <>
                              <Text style={styles.cardDateOpenedLabel}>{formatCardOpened(card.memberSince)}</Text>
                              <Text style={styles.cardAgeLabel}>{getCardAge(card.memberSince)}</Text>
                            </>
                          )}
                        </View>

                        <View style={styles.cardInfo}>
                          <View style={styles.cardNameRow}>
                            <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
                            <View style={styles.cardBadgeRow}>
                              {(() => {
                                const urgent = daysUntilDue(card.dueDay) <= 10;
                                return (
                                  <View style={[styles.feeBadge, urgent && styles.feeBadgeUrgent]}>
                                    {urgent && (
                                      <FontAwesome6 name="triangle-exclamation" size={10} color="#ff3b30" iconStyle="solid" />
                                    )}
                                    <Text style={[styles.feeBadgeText, urgent && styles.feeBadgeTextUrgent]}>
                                      Statement Ends: {ordinal(card.dueDay)}
                                    </Text>
                                  </View>
                                );
                              })()}
                              {card.limit ? (
                                <View style={styles.feeBadge}>
                                  <Text style={styles.feeBadgeText}>{card.limit}</Text>
                                </View>
                              ) : null}
                            </View>
                          </View>

                          <Text style={styles.cardLast4}>•••• {card.lastFour}</Text>

                          {annualFee === 0 ? (
                            <View style={styles.noFeePill}>
                              <Text style={styles.noFeePillText}>No annual fee</Text>
                            </View>
                          ) : card.feeDueDate ? (
                            <View style={styles.renewalSection}>
                              {(() => {
                                const feeUrgent = daysUntilRenewal(card.feeDueDate) <= 10;
                                return (
                                  <>
                                    <View style={styles.renewalRow}>
                                      <Text style={styles.renewalLabel}>Next annual fee</Text>
                                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        {feeUrgent && (
                                          <FontAwesome6 name="triangle-exclamation" size={10} color="#ff3b30" iconStyle="solid" />
                                        )}
                                        <Text style={[styles.daysText, feeUrgent && styles.daysTextUrgent]}>
                                          {daysUntilRenewal(card.feeDueDate)} days remaining
                                        </Text>
                                      </View>
                                    </View>
                                    <View style={styles.progressRow}>
                                      <View style={[styles.progressTrack, { flex: 1 }]}>
                                        <View
                                          style={[
                                            styles.progressFill,
                                            feeUrgent && styles.progressFillUrgent,
                                            { width: `${Math.round(renewalProgress(card.feeDueDate) * 100)}%` },
                                          ]}
                                        />
                                      </View>
                                      <Text style={styles.progressFeeLabel}>${annualFee}/yr</Text>
                                    </View>
                                  </>
                                );
                              })()}
                              <Text style={styles.renewalDateText}>{formatRenewalDate(card.feeDueDate)}</Text>
                            </View>
                          ) : (
                            <Text style={styles.setDateHint}>Add fee due date to track ${annualFee}/yr renewal</Text>
                          )}

                          {benefits.length > 0 && (
                            <View style={styles.benefitsRow}>
                              {benefits.slice(0, 3).map((b, i) => (
                                <View key={i} style={styles.benefitChip}>
                                  <FontAwesome6 name={b.icon} size={10} color="#6F4E37" iconStyle="solid" />
                                  <Text style={styles.benefitChipText}> {b.multiplier}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      </Pressable>

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
            <View style={[styles.selectModeBar, { marginBottom: 10 }]}>
              <Text style={styles.selectedCount}>
                {selectedIds.size === 0 ? 'Tap cards to select' : `${selectedIds.size} selected`}
              </Text>
              <TouchableOpacity
                style={[styles.deleteSelectedButton, selectedIds.size === 0 && styles.deleteSelectedButtonDisabled]}
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
              style={({ pressed }) => [styles.addButton, { marginBottom: 10 }, pressed && styles.addButtonPressed]}
              onPress={openModal}
            >
              <Text style={styles.addButtonText}>+ Add Card</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ── BENEFITS / MORE placeholders ── */}
      {(activeTab === 'benefits' || activeTab === 'more') && (
        <View style={ds.placeholder}>
          <Text style={ds.placeholderText}>
            {activeTab === 'benefits' ? 'Benefits — Coming Soon' : 'More — Coming Soon'}
          </Text>
        </View>
      )}

      {/* ── BOTTOM TAB BAR ── */}
      <View style={ds.tabBar}>
        {([
          { key: 'home', icon: 'house', label: 'Home' },
          { key: 'cards', icon: 'credit-card', label: 'Cards' },
          { key: 'benefits', icon: 'star', label: 'Benefits' },
          { key: 'more', icon: 'ellipsis', label: 'More' },
        ] as const).map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable key={tab.key} style={ds.tabItem} onPress={() => handleTabPress(tab.key)}>
              <View style={[ds.tabIconWrap, active && ds.tabIconActive]}>
                <FontAwesome6 name={tab.icon} size={20} color={active ? '#C08A5B' : '#CBB9A8'} iconStyle="solid" />
              </View>
              <Text style={[ds.tabLabel, active && ds.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── ADD CARD MODAL ── */}
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

                      {selectedCard && selectedCard.annualFee > 0 && (
                        <>
                          <Text style={styles.inputLabel}>Fee Due Date (MM/DD)</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="05/09"
                            placeholderTextColor="#aeaeb2"
                            keyboardType="numeric"
                            value={form.feeDueDate}
                            onChangeText={(v) => setForm((f) => ({ ...f, feeDueDate: formatFeeDueDateInput(v) }))}
                          />
                        </>
                      )}

                      {selectedCard && selectedCard.benefits.length > 0 && (
                        <>
                          <Text style={styles.benefitsGridLabel}>Benefits</Text>
                          <View style={styles.benefitsGrid}>
                            {selectedCard.benefits.map((b, i) => (
                              <View key={i} style={styles.benefitCol}>
                                <Text style={styles.benefitColLabel}>{b.category}</Text>
                                <View style={styles.benefitColPill}>
                                  <FontAwesome6 name={b.icon} size={13} color="#C08A5B" iconStyle="solid" />
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
