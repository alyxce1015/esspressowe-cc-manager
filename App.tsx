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
import { getCards, insertCard, deleteCard, deleteCards, updateCard, getPurchases, insertPurchase, type UserCard, type Purchase } from './db/database';

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

function formatPurchaseAmount(input: string): string {
  const stripped = input.replace(/[^0-9.]/g, '');
  const parts = stripped.split('.');
  const whole = parts[0] || '';
  const decimal = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';
  if (!whole && !decimal) return '';
  return '$' + whole + decimal;
}

function parsePurchaseAmount(input: string): number {
  const n = parseFloat(input.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function formatDateInput(input: string): string {
  const digits = input.replace(/[^0-9]/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}

function parseDateInput(input: string): string | undefined {
  const match = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function abbreviateCardName(name: string): string {
  return name
    .replace(/Bank of America/gi, 'BofA')
    .replace(/American Express/gi, 'AMEX')
    .replace(/Wells Fargo/gi, 'WF')
    .replace(/Capital One/gi, 'Cap1');
}

function memberSinceToDisplay(stored: string): string {
  const parts = stored.split('-');
  if (parts.length < 2) return '';
  return `${parts[1]}/${parts[0]}`; // MM/YYYY
}

function feeDueDateToDisplay(stored: string): string {
  // stored: "2000-MM-DD"
  const parts = stored.split('-');
  if (parts.length < 3) return '';
  return `${parts[1]}/${parts[2]}`; // MM/DD
}

function formatPurchaseDate(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayMMDDYYYY(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CATEGORY_META: Record<Purchase['category'], { icon: string; label: string }> = {
  food:    { icon: 'utensils',        label: 'Food & Dining' },
  grocery: { icon: 'basket-shopping', label: 'Grocery'       },
  gas:     { icon: 'gas-pump',        label: 'Gas'           },
  travel:  { icon: 'plane',           label: 'Travel'        },
  online:  { icon: 'cart-shopping',   label: 'Online'        },
  store:   { icon: 'bag-shopping',    label: 'In-Store'      },
};

const BENEFIT_LEGEND: { icon: string; label: string; description: string }[] = [
  { icon: 'plane',           label: 'Travel / Flights',          description: 'Airline tickets, Chase/Amex travel portals' },
  { icon: 'hotel',           label: 'Hotels',                    description: 'Hotel stays booked directly or via portal' },
  { icon: 'utensils',        label: 'Dining',                    description: 'Restaurants, cafes, bars, and food delivery' },
  { icon: 'basket-shopping', label: 'Groceries',                 description: 'Supermarkets and grocery stores' },
  { icon: 'gas-pump',        label: 'Gas Stations',              description: 'Fuel purchases at gas stations' },
  { icon: 'cart-shopping',   label: 'Online Shopping',           description: 'Purchases made online (e.g. Amazon)' },
  { icon: 'store',           label: 'Drugstores',                description: 'Pharmacies like CVS and Walgreens' },
  { icon: 'house',           label: 'Rent',                      description: 'Eligible rent payments' },
  { icon: 'arrows-rotate',   label: 'Rotating / Choice Cat.',    description: 'Categories that change quarterly or you choose' },
  { icon: 'money-bill',      label: 'All Purchases',             description: 'Base rate on everything else' },
];


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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<UserCard | null>(null);
  const [editForm, setEditForm] = useState({ customName: '', lastFour: '', dueDay: '', limit: '', memberSince: '', feeDueDate: '' });
  const [editError, setEditError] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    cardId: '',
    amount: '',
    merchant: '',
    category: '' as Purchase['category'] | '',
    date: '',
  });
  const [purchaseError, setPurchaseError] = useState('');
  const [legendVisible, setLegendVisible] = useState(false);

  const stepAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getCards()
      .then(setCards)
      .catch((e) => setSaveError('Could not load cards: ' + (e instanceof Error ? e.message : String(e))));
    getPurchases()
      .then(setPurchases)
      .catch(() => {}); // non-fatal — table may not exist yet
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

  const spentByCard = purchases.reduce<Record<string, number>>((acc, p) => {
    acc[p.cardId] = (acc[p.cardId] ?? 0) + p.amount;
    return acc;
  }, {});
  const totalSpent = Object.values(spentByCard).reduce((sum, n) => sum + n, 0);
  const totalAvailable = totalLimitValue - totalSpent;

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

  function openPurchaseModal() {
    setPurchaseForm({
      cardId: cards.length === 1 ? cards[0].id : '',
      amount: '',
      merchant: '',
      category: '',
      date: todayMMDDYYYY(),
    });
    setPurchaseError('');
    setPurchaseModalVisible(true);
  }

  async function savePurchase() {
    setPurchaseError('');
    if (!purchaseForm.cardId) { setPurchaseError('Select a card.'); return; }
    const amount = parsePurchaseAmount(purchaseForm.amount);
    if (!amount || amount <= 0) { setPurchaseError('Enter a valid amount.'); return; }
    if (!purchaseForm.merchant.trim()) { setPurchaseError('Enter a merchant name.'); return; }
    if (!purchaseForm.category) { setPurchaseError('Select a category.'); return; }
    const date = parseDateInput(purchaseForm.date);
    if (!date) { setPurchaseError('Enter a valid date (MM/DD/YYYY).'); return; }
    const purchase: Purchase = {
      id: generateUUID(),
      cardId: purchaseForm.cardId,
      amount,
      merchant: purchaseForm.merchant.trim(),
      category: purchaseForm.category as Purchase['category'],
      date,
    };
    try {
      await insertPurchase(purchase);
      setPurchases(await getPurchases());
      setPurchaseModalVisible(false);
    } catch (e) {
      setPurchaseError(e instanceof Error ? e.message : 'Could not save purchase.');
    }
  }

  function openEditModal(card: UserCard) {
    setEditingCard(card);
    setEditForm({
      customName: card.catalogId === 'custom' ? card.name : '',
      lastFour: card.lastFour,
      dueDay: String(card.dueDay),
      limit: card.limit,
      memberSince: card.memberSince ? memberSinceToDisplay(card.memberSince) : '',
      feeDueDate: card.feeDueDate ? feeDueDateToDisplay(card.feeDueDate) : '',
    });
    setEditError('');
    setEditModalVisible(true);
  }

  async function saveEdit() {
    setEditError('');
    if (!editingCard) return;
    const dueDay = parseInt(editForm.dueDay, 10);
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) { setEditError('Enter a due day between 1 and 31.'); return; }
    const isCustom = editingCard.catalogId === 'custom';
    if (isCustom && !editForm.customName.trim()) { setEditError('Card name is required.'); return; }
    const memberSince = editForm.memberSince.trim() ? parseMemberSince(editForm.memberSince) : undefined;
    if (editForm.memberSince.trim() && !memberSince) { setEditError('Card Opened must be MM/YYYY.'); return; }
    const catalogEntry = CARD_CATALOG.find(c => c.id === editingCard.catalogId);
    const hasFee = (catalogEntry?.annualFee ?? 0) > 0;
    const feeDueDate = hasFee && editForm.feeDueDate.trim() ? parseFeeDueDate(editForm.feeDueDate) : undefined;
    if (hasFee && editForm.feeDueDate.trim() && !feeDueDate) { setEditError('Enter a valid fee due date (MM/DD).'); return; }
    try {
      await updateCard({
        ...editingCard,
        name: isCustom ? editForm.customName.trim() : editingCard.name,
        lastFour: editForm.lastFour.trim(),
        dueDay,
        limit: editForm.limit.trim(),
        memberSince,
        feeDueDate,
      });
      setCards(await getCards());
      setEditModalVisible(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Could not save changes.');
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={activeTab === 'home' ? 'light' : 'dark'} />

      {/* ── HOME TAB ── */}
      {activeTab === 'home' && (
        <ScrollView style={ds.homeScroll} contentContainerStyle={ds.homeScrollContent} showsVerticalScrollIndicator={false}>

          {/* App title */}
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={ds.appTitle}>Esspressowe</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '55%' }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(192,138,91,0.45)' }} />
              <FontAwesome6 name="mug-hot" size={10} color="#C08A5B" iconStyle="solid" />
              <FontAwesome6 name="mug-hot" size={10} color="#C08A5B" iconStyle="solid" />
              <FontAwesome6 name="mug-hot" size={10} color="#C08A5B" iconStyle="solid" />
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(192,138,91,0.45)' }} />
            </View>
          </View>

          {/* Hero card */}
          <View style={ds.heroCard}>
            <View style={ds.heroLeft}>
              <Text style={ds.heroHeading}>Available Credit</Text>
              <Text style={ds.heroAmount}>
                {totalLimitValue > 0 ? '$' + Math.max(0, totalAvailable).toLocaleString('en-US') : '—'}
              </Text>
              <Text style={ds.heroSub}>
                {cards.length > 0
                  ? totalSpent > 0
                    ? `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent · $${totalLimitValue.toLocaleString('en-US')} total limit`
                    : `Across ${cards.length} active card${cards.length !== 1 ? 's' : ''}`
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

          {/* Recent Transactions */}
          {purchases.length > 0 && (
            <View style={ds.sectionCard}>
              <Text style={ds.sectionTitle}>Recent Transactions</Text>
              {[...purchases].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((p) => {
                const card = cards.find(c => c.id === p.cardId);
                const meta = CATEGORY_META[p.category];
                return (
                  <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: 'rgba(192,138,91,0.15)',
                      justifyContent: 'center', alignItems: 'center', flexShrink: 0,
                    }}>
                      <FontAwesome6 name={meta.icon} size={15} color="#C08A5B" iconStyle="solid" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={ds.listName} numberOfLines={1}>{p.merchant}</Text>
                      <Text style={ds.listSub}>
                        {meta.label}{card ? ` · ${isDesktop ? card.name : abbreviateCardName(card.name)}` : ''}{card?.lastFour ? ` ••${card.lastFour}` : ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#2A211C' }}>
                        -${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      <Text style={ds.listSub}>{formatPurchaseDate(p.date)}</Text>
                    </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
              <Text style={styles.header}>My Cards</Text>
              <Pressable onPress={() => setLegendVisible(true)} hitSlop={8} style={{ marginBottom: 4 }}>
                <FontAwesome6 name="circle-info" size={15} color="#CBB9A8" iconStyle="solid" />
              </Pressable>
            </View>
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
                          {card.limit ? (
                            <Text style={styles.cardDateOpenedLabel}>Limit: {card.limit}</Text>
                          ) : null}
                        </View>

                        <View style={styles.cardInfo}>
                          <View style={[styles.cardNameRow, isDesktop && styles.cardNameRowDesktop]}>
                            <Text style={[styles.cardName, isDesktop && styles.cardNameDesktop]} numberOfLines={isDesktop ? 1 : 2}>{isDesktop ? card.name : abbreviateCardName(card.name)}</Text>
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
                              {card.limit ? (() => {
                                const limitNum = parseInt(card.limit.replace(/[^0-9]/g, ''), 10);
                                const spent = spentByCard[card.id] ?? 0;
                                const available = !isNaN(limitNum) && spent > 0
                                  ? Math.max(0, limitNum - spent)
                                  : null;
                                const nearLimit = available !== null && !isNaN(limitNum) && limitNum > 0
                                  && available <= limitNum * 0.10;
                                return (
                                  <View style={[styles.feeBadge, nearLimit && { backgroundColor: 'rgba(139,58,58,0.12)', borderWidth: 1, borderColor: '#ff3b30' }]}>
                                    {nearLimit && (
                                      <FontAwesome6 name="triangle-exclamation" size={10} color="#ff3b30" iconStyle="solid" />
                                    )}
                                    <Text style={[styles.feeBadgeText, nearLimit && { color: '#ff3b30' }]}>
                                      {available !== null
                                        ? `$${available.toLocaleString('en-US')}`
                                        : card.limit}
                                    </Text>
                                  </View>
                                );
                              })() : null}
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

                          {benefits.length > 0 && (() => {
                            const bonus = benefits.filter(b => b.category !== 'All Purchases').slice(0, 3);
                            const base = benefits.find(b => b.category === 'All Purchases');
                            const chips = base ? [...bonus, base] : bonus;
                            return (
                              <View style={styles.benefitsRow}>
                                {chips.map((b, i) => (
                                  <View key={i} style={[styles.benefitChip, b.category === 'All Purchases' && { backgroundColor: 'rgba(122,158,126,0.2)' }]}>
                                    <FontAwesome6 name={b.icon} size={10} color={b.category === 'All Purchases' ? '#7A9E7E' : '#6F4E37'} iconStyle="solid" />
                                    <Text style={[styles.benefitChipText, b.category === 'All Purchases' && { color: '#7A9E7E' }]}> {b.multiplier}</Text>
                                  </View>
                                ))}
                              </View>
                            );
                          })()}
                        </View>
                      </Pressable>

                      {!selectMode && (
                        <View style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 4 }}>
                          <Pressable onPress={() => openEditModal(card)} hitSlop={8}>
                            {({ pressed }: { pressed: boolean }) => (
                              <FontAwesome6 name="ellipsis" size={16} color={pressed ? '#C08A5B' : '#8C6E5A'} iconStyle="solid" />
                            )}
                          </Pressable>
                          <Pressable onPress={() => handleDeleteOne(card.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            {({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => (
                              <FontAwesome6 name="trash" size={14} color={hovered || pressed ? '#ff0000' : '#ff3b30'} iconStyle="solid" />
                            )}
                          </Pressable>
                        </View>
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

        {/* Center FAB */}
        <View style={ds.tabCenterWrap}>
          <Pressable
            style={({ pressed }) => [ds.tabCenterBtn, pressed && ds.tabCenterBtnPressed]}
            onPress={openPurchaseModal}
          >
            <FontAwesome6 name="plus" size={26} color="#fff" iconStyle="solid" />
          </Pressable>
        </View>

        {([
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

      {/* ── ADD PURCHASE MODAL ── */}
      <Modal visible={purchaseModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalSheet, { maxHeight: windowHeight * 0.88 }]}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Purchase</Text>
              <Pressable onPress={() => setPurchaseModalVisible(false)} hitSlop={8}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Card picker */}
              <Text style={styles.inputLabel}>Card Used</Text>
              {cards.length === 0 ? (
                <Text style={{ color: '#aeaeb2', fontSize: 13, marginBottom: 12 }}>No cards added yet</Text>
              ) : (
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {cards.map(card => (
                    <Pressable
                      key={card.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        backgroundColor: purchaseForm.cardId === card.id ? 'rgba(192,138,91,0.18)' : '#2B1D17',
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1.5,
                        borderColor: purchaseForm.cardId === card.id ? '#C08A5B' : 'transparent',
                      }}
                      onPress={() => setPurchaseForm(f => ({ ...f, cardId: card.id }))}
                    >
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: card.color }} />
                      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#F8F4EF' }} numberOfLines={1}>
                        {card.name}
                      </Text>
                      {card.lastFour ? (
                        <Text style={{ fontSize: 12, color: '#8C6E5A' }}>••{card.lastFour}</Text>
                      ) : null}
                      {purchaseForm.cardId === card.id && (
                        <FontAwesome6 name="check" size={12} color="#C08A5B" iconStyle="solid" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Amount */}
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="$0.00"
                placeholderTextColor="#aeaeb2"
                keyboardType="decimal-pad"
                value={purchaseForm.amount}
                onChangeText={(v) => setPurchaseForm(f => ({ ...f, amount: formatPurchaseAmount(v) }))}
              />

              {/* Merchant */}
              <Text style={styles.inputLabel}>Merchant</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Whole Foods"
                placeholderTextColor="#aeaeb2"
                value={purchaseForm.merchant}
                onChangeText={(v) => setPurchaseForm(f => ({ ...f, merchant: v }))}
              />

              {/* Category */}
              <Text style={styles.inputLabel}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {([
                  { key: 'food', icon: 'utensils', label: 'Food & Dining' },
                  { key: 'grocery', icon: 'basket-shopping', label: 'Grocery' },
                  { key: 'gas', icon: 'gas-pump', label: 'Gas' },
                  { key: 'travel', icon: 'plane', label: 'Travel' },
                  { key: 'online', icon: 'cart-shopping', label: 'Online' },
                  { key: 'store', icon: 'bag-shopping', label: 'In-Store' },
                ] as const).map(cat => {
                  const active = purchaseForm.category === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: active ? '#C08A5B' : '#2B1D17',
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderWidth: 1,
                        borderColor: active ? '#C08A5B' : 'transparent',
                      }}
                      onPress={() => setPurchaseForm(f => ({ ...f, category: cat.key }))}
                    >
                      <FontAwesome6 name={cat.icon} size={14} color={active ? '#fff' : '#CBB9A8'} iconStyle="solid" />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : '#CBB9A8' }}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Date */}
              <Text style={styles.inputLabel}>Date Purchased (MM/DD/YYYY)</Text>
              <TextInput
                style={styles.input}
                placeholder="05/09/2026"
                placeholderTextColor="#aeaeb2"
                keyboardType="numeric"
                value={purchaseForm.date}
                onChangeText={(v) => setPurchaseForm(f => ({ ...f, date: formatDateInput(v) }))}
              />

              {purchaseError !== '' && (
                <Text style={styles.saveErrorText}>{purchaseError}</Text>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
                onPress={() => setPurchaseModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
                onPress={savePurchase}
              >
                <Text style={styles.saveButtonText}>Save Purchase</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── EDIT CARD MODAL ── */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalSheet, { maxHeight: windowHeight * 0.85 }]}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Card</Text>
              <Pressable onPress={() => setEditModalVisible(false)} hitSlop={8}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {editingCard && (() => {
                const catalogEntry = CARD_CATALOG.find(c => c.id === editingCard.catalogId);
                const hasFee = (catalogEntry?.annualFee ?? 0) > 0;
                const isCustom = editingCard.catalogId === 'custom';
                return (
                  <>
                    {isCustom && (
                      <>
                        <Text style={styles.inputLabel}>Card Name</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. My Store Card"
                          placeholderTextColor="#aeaeb2"
                          value={editForm.customName}
                          onChangeText={(v) => setEditForm(f => ({ ...f, customName: v }))}
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
                      value={editForm.lastFour}
                      onChangeText={(v) => setEditForm(f => ({ ...f, lastFour: v }))}
                    />

                    <Text style={styles.inputLabel}>Due Day (1–31)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="15"
                      placeholderTextColor="#aeaeb2"
                      keyboardType="numeric"
                      maxLength={2}
                      value={editForm.dueDay}
                      onChangeText={(v) => setEditForm(f => ({ ...f, dueDay: v }))}
                    />

                    <Text style={styles.inputLabel}>Credit Limit</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="$10,000"
                      placeholderTextColor="#aeaeb2"
                      keyboardType="numeric"
                      value={editForm.limit}
                      onChangeText={(v) => setEditForm(f => ({ ...f, limit: formatCurrency(v) }))}
                    />

                    <Text style={styles.inputLabel}>Card Opened (MM/YYYY)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="04/2023"
                      placeholderTextColor="#aeaeb2"
                      keyboardType="numeric"
                      value={editForm.memberSince}
                      onChangeText={(v) => setEditForm(f => ({ ...f, memberSince: formatMemberSince(v) }))}
                    />

                    {hasFee && (
                      <>
                        <Text style={styles.inputLabel}>Fee Due Date (MM/DD)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="05/09"
                          placeholderTextColor="#aeaeb2"
                          keyboardType="numeric"
                          value={editForm.feeDueDate}
                          onChangeText={(v) => setEditForm(f => ({ ...f, feeDueDate: formatFeeDueDateInput(v) }))}
                        />
                      </>
                    )}

                    {editError !== '' && (
                      <Text style={styles.saveErrorText}>{editError}</Text>
                    )}
                  </>
                );
              })()}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
                onPress={saveEdit}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── ICON LEGEND MODAL ── */}
      <Modal visible={legendVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: windowHeight * 0.88 }]}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Legend</Text>
              <Pressable onPress={() => setLegendVisible(false)} hitSlop={8}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
              showsVerticalScrollIndicator={false}
            >
              {/* ── Benefit Icon Legend ── */}
              <Text style={[styles.inputLabel, { marginBottom: 10 }]}>Benefits Icons</Text>
              <View style={{
                backgroundColor: '#2B1D17',
                borderRadius: 16,
                padding: 14,
                gap: 10,
              }}>
                {BENEFIT_LEGEND.map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: 'rgba(192,138,91,0.15)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}>
                      <FontAwesome6 name={item.icon} size={15} color="#C08A5B" iconStyle="solid" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#F8F4EF', marginBottom: 1 }}>
                        {item.label}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#8C6E5A', lineHeight: 15 }}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = { ...layoutStyles, ...cardStyles, ...modalStyles };
