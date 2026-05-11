import { ImageSourcePropType } from 'react-native';

export type Benefit = {
  icon: string;
  category: string;
  multiplier: string;
};

export type CatalogCard = {
  id: string;
  name: string;
  issuer: string;
  image: ImageSourcePropType | null;
  color: string;
  annualFee: number;
  benefits: Benefit[];
  url?: string;
};

export const ISSUERS = ['All', 'Chase', 'Amex', 'Capital One', 'Citi', 'Wells Fargo', 'Bank of America', 'US Bank', 'Discover', 'Other'];

// ─── Icon name reference (FontAwesome6 free names) ───────────────────────────
// travel/flights  → 'plane'
// hotel           → 'hotel'
// dining          → 'utensils'
// groceries       → 'basket-shopping'
// streaming       → 'tv'
// gas             → 'gas-pump'
// cashback/flat   → 'money-bill'
// rotating cats   → 'arrows-rotate'
// home/rent       → 'house'
// mobile/apple    → 'mobile-screen'
// card/apple pay  → 'credit-card'
// drugstore       → 'store'
// transit         → 'train'
// online retail   → 'cart-shopping'
// car rental      → 'car'
// Browse all: https://fontawesome.com/icons?m=free
// ────────────────────────────────────────────────────────────────────────────

export const CARD_CATALOG: CatalogCard[] = [
  {
    id: 'chase-sapphire-reserve',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    image: require('../assets/CC_images/ChaseSR.jpg'),
    color: '#1a3a5c',
    annualFee: 795,
    url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve',
    benefits: [
      { icon: 'plane',          category: 'Chase Travel', multiplier: '8x'   },
      { icon: 'hotel',          category: 'Hotels',       multiplier: '4x'   },
      { icon: 'utensils',       category: 'Dining',       multiplier: '3x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1x'   },
    ],
  },
  {
    id: 'chase-sapphire-preferred',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    image: require('../assets/CC_images/ChaseSP.jpg'),
    color: '#1a3a5c',
    annualFee: 95,
    url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred',
    benefits: [
      { icon: 'plane',          category: 'Chase Travel', multiplier: '5x'   },
      { icon: 'utensils',       category: 'Dining',       multiplier: '3x'   },
      { icon: 'basket-shopping',category: 'Groceries',    multiplier: '3x'   },
      { icon: 'tv',             category: 'Streaming',    multiplier: '3x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1x'   },
    ],
  },
  {
    id: 'chase-freedom-flex',
    name: 'Chase Freedom Flex',
    issuer: 'Chase',
    image: require('../assets/CC_images/ChaseFF.jpg'),
    color: '#1a3a5c',
    annualFee: 0,
    url: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/flex',
    benefits: [
      { icon: 'arrows-rotate',  category: 'Rotating',     multiplier: '5%'   },
      { icon: 'plane',          category: 'Chase Travel', multiplier: '5%'   },
      { icon: 'utensils',       category: 'Dining',       multiplier: '3%'   },
      { icon: 'store',          category: 'Drugstore',    multiplier: '3%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1%'   },
    ],
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    image: require('../assets/CC_images/ChaseFU.jpg'),
    color: '#1a3a5c',
    annualFee: 0,
    url: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited',
    benefits: [
      { icon: 'plane',          category: 'Chase Travel', multiplier: '5%'   },
      { icon: 'utensils',       category: 'Dining',       multiplier: '3%'   },
      { icon: 'store',          category: 'Drugstore',    multiplier: '3%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1.5%' },
    ],
  },
  {
    id: 'amex-gold',
    name: 'American Express Gold Card',
    issuer: 'Amex',
    image: require('../assets/CC_images/amexGold.png'),
    color: '#c9922a',
    annualFee: 325,
    url: 'https://www.americanexpress.com/us/credit-cards/card/gold-card/',
    benefits: [
      { icon: 'utensils',       category: 'Dining',       multiplier: '4x'   },
      { icon: 'basket-shopping',category: 'Groceries',    multiplier: '4x'   },
      { icon: 'plane',          category: 'Flights',      multiplier: '3x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1x'   },
    ],
  },
  {
    id: 'amex-platinum',
    name: 'American Express Platinum Card',
    issuer: 'Amex',
    image: require('../assets/CC_images/amexPlat.jpg'),
    color: '#8c8c8c',
    annualFee: 895,
    url: 'https://www.americanexpress.com/us/credit-cards/card/platinum/',
    benefits: [
      { icon: 'plane',          category: 'Flights',      multiplier: '5x'   },
      { icon: 'hotel',          category: 'Hotels',       multiplier: '5x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1x'   },
    ],
  },
  {
    id: 'amex-blue-cash-preferred',
    name: 'American Express Blue Cash Preferred',
    issuer: 'Amex',
    url: 'https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/',
    image: { uri: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/2681330d-450d-4f71-af38-3cb16f592c02/596f22094df609999878f43629debc8d416e18334ea8f5e68f9d92a72dd0b912.jpg' },
    color: '#1a4b8c',
    annualFee: 95,
    benefits: [
      { icon: 'basket-shopping',category: 'Groceries',    multiplier: '6%'   },
      { icon: 'tv',             category: 'Streaming',    multiplier: '6%'   },
      { icon: 'gas-pump',       category: 'Gas',          multiplier: '3%'   },
      { icon: 'train',          category: 'Transit',      multiplier: '3%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1%'   },
    ],
  },
  {
    id: 'amex-blue-cash-everyday',
    name: 'American Express Blue Cash Everyday',
    issuer: 'Amex',
    url: 'https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/',
    image: { uri: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/5ed2eb69-5e8c-4014-b8b7-23c4d600591c/bfccadb4c5dc3dc5a88464e70bf2c7339280bf494e9c8fad0ee4e5230c465dc4.jpg' },
    color: '#1a4b8c',
    annualFee: 0,
    benefits: [
      { icon: 'basket-shopping',category: 'Groceries',    multiplier: '3%'   },
      { icon: 'cart-shopping',  category: 'Online',       multiplier: '3%'   },
      { icon: 'gas-pump',       category: 'Gas',          multiplier: '3%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1%'   },
    ],
  },
  {
    id: 'citi-double-cash',
    name: 'Citi Double Cash Card',
    issuer: 'Citi',
    image: require('../assets/CC_images/CitiDC.jpg'),
    color: '#003b70',
    annualFee: 0,
    url: 'https://www.citi.com/credit-cards/citi-double-cash-credit-card',
    benefits: [
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '2%'   },
    ],
  },
  {
    id: 'citi-custom-cash',
    name: 'Citi Custom Cash Card',
    issuer: 'Citi',
    url: 'https://www.citi.com/credit-cards/citi-custom-cash-credit-card',
    image: { uri: 'https://aemapi.citi.com/content/dam/cfs/uspb/usmkt/cards/en/static/images/citi-custom-cash-credit-card/citi-custom-cash-credit-card_306x192.webp' },
    color: '#003b70',
    annualFee: 0,
    benefits: [
      { icon: 'arrows-rotate',  category: 'Top Category', multiplier: '5%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1%'   },
    ],
  },
  {
    id: 'citi-strata-premier',
    name: 'Citi Strata Premier',
    issuer: 'Citi',
    url: 'https://www.citi.com/credit-cards/citi-strata-premier-card',
    image: { uri: 'https://aemapi.citi.com/content/dam/cfs/uspb/usmkt/cards/en/static/images/citi-strata-premier-credit-card/citi-strata-premier-credit-card_306x192.webp' },
    color: '#003b70',
    annualFee: 95,
    benefits: [
      { icon: 'plane',          category: 'Air Travel',   multiplier: '3x'   },
      { icon: 'hotel',          category: 'Hotels',       multiplier: '3x'   },
      { icon: 'utensils',       category: 'Dining',       multiplier: '3x'   },
      { icon: 'basket-shopping',category: 'Groceries',    multiplier: '3x'   },
      { icon: 'gas-pump',       category: 'Gas',          multiplier: '3x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1x'   },
    ],
  },
  {
    id: 'capital-one-venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    image: require('../assets/CC_images/CapitalVX.jpg'),
    color: '#004977',
    annualFee: 395,
    url: 'https://capitalone.com/credit-cards/venture-x/',
    benefits: [
      { icon: 'hotel',          category: 'Hotels',       multiplier: '10x'  },
      { icon: 'car',            category: 'Car Rental',   multiplier: '10x'  },
      { icon: 'plane',          category: 'Flights',      multiplier: '5x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '2x'   },
    ],
  },
  {
    id: 'capital-one-venture',
    name: 'Capital One Venture',
    issuer: 'Capital One',
    url: 'https://capitalone.com/credit-cards/venture/',
    image: { uri: 'https://ecm.capitalone.com/WCM/card/products/venture_cardart_prim_323x203-1/mobile.png' },
    color: '#004977',
    annualFee: 95,
    benefits: [
      { icon: 'hotel',          category: 'Hotels',       multiplier: '5x'   },
      { icon: 'car',            category: 'Car Rental',   multiplier: '5x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '2x'   },
    ],
  },
  {
    id: 'capital-one-quicksilver',
    name: 'Capital One Quicksilver',
    issuer: 'Capital One',
    url: 'https://capitalone.com/credit-cards/quicksilver/',
    image: { uri: 'https://ecm.capitalone.com/WCM/card/products/quicksilver_cardart.png' },
    color: '#004977',
    annualFee: 0,
    benefits: [
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1.5%' },
    ],
  },
  {
    id: 'discover-it',
    name: 'Discover it Cash Back',
    issuer: 'Discover',
    image: require('../assets/CC_images/DiscoverIT.jpg'),
    color: '#f06423',
    annualFee: 0,
    url: 'https://www.discover.com/credit-cards/cash-back/it-card.html',
    benefits: [
      { icon: 'arrows-rotate',  category: 'Rotating',     multiplier: '5%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1%'   },
    ],
  },
  {
    id: 'apple-card',
    name: 'Apple Card',
    issuer: 'Other',
    image: require('../assets/CC_images/appleCC.png'),
    color: '#555555',
    annualFee: 0,
    url: 'https://www.apple.com/apple-card/',
    benefits: [
      { icon: 'mobile-screen',  category: 'Apple/Partners',multiplier: '3%'  },
      { icon: 'credit-card',    category: 'Apple Pay',    multiplier: '2%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1%'   },
    ],
  },
  {
    id: 'wells-fargo-active-cash',
    name: 'Wells Fargo Active Cash',
    issuer: 'Wells Fargo',
    url: 'https://www.wellsfargo.com/credit-cards/active-cash/',
    image: { uri: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/b954a46c-caec-11eb-abf1-efb90fc6e740/403a0deae03eaff0d1ca2c7ab1175fcc45ebc9a9551d0c8104e758b3d82771d1.jpg' },
    color: '#c8102e',
    annualFee: 0,
    benefits: [
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '2%'   },
    ],
  },
  {
    id: 'bofa-customized-cash',
    name: 'Bank of America Customized Cash Rewards',
    issuer: 'Bank of America',
    image: require('../assets/CC_images/bofaCC.png'),
    color: '#c8102e',
    annualFee: 0,
    url: 'https://www.bankofamerica.com/credit-cards/products/cash-back-credit-card/',
    benefits: [
      { icon: 'arrows-rotate',  category: 'Choice Cat.',  multiplier: '3%'   },
      { icon: 'basket-shopping',category: 'Groceries',    multiplier: '2%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1%'   },
    ],
  },
  {
    id: 'bilt',
    name: 'Bilt Mastercard',
    issuer: 'Other',
    image: require('../assets/CC_images/BiltM.jpg'),
    color: '#1a1a1a',
    annualFee: 0,
    url: 'https://www.biltrewards.com/card',
    benefits: [
      { icon: 'utensils',       category: 'Dining',       multiplier: '3x'   },
      { icon: 'plane',          category: 'Travel',       multiplier: '2x'   },
      { icon: 'house',          category: 'Rent',         multiplier: '1x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1x'   },
    ],
  },
  {
    id: 'robinhood-gold',
    name: 'Robinhood Gold Card',
    issuer: 'Other',
    image: require('../assets/CC_images/RobinhoodGold.png'),
    color: '#1a1a1a',
    annualFee: 50,
    url: 'https://robinhood.com/creditcard/',
    benefits: [
      { icon: 'plane',          category: 'Travel Portal',multiplier: '5%'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '3%'   },
    ],
  },
  {
    id: 'us-bank-altitude-go',
    name: 'US Bank Altitude Go',
    issuer: 'US Bank',
    url: 'https://www.usbank.com/credit-cards/altitude-go-visa-signature-credit-card.html',
    image: { uri: 'https://www.usbank.com/content/dam/usbank/en/images/illustrations/card-art/credit-cards/altitude-go-visa-signature-credit-card.png' },
    color: '#002b49',
    annualFee: 0,
    benefits: [
      { icon: 'utensils',       category: 'Dining',       multiplier: '4x'   },
      { icon: 'basket-shopping',category: 'Groceries',    multiplier: '2x'   },
      { icon: 'gas-pump',       category: 'Gas',          multiplier: '2x'   },
      { icon: 'tv',             category: 'Streaming',    multiplier: '2x'   },
      { icon: 'money-bill',     category: 'All Purchases',multiplier: '1x'   },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Card',
    issuer: 'Other',
    image: null,
    color: '#2d2d4e',
    annualFee: 0,
    benefits: [],
  },
];
