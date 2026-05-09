import { ImageSourcePropType } from 'react-native';

export type CatalogCard = {
  id: string;
  name: string;
  issuer: string;
  image: ImageSourcePropType | null;
  color: string;
};

export const ISSUERS = ['All', 'Chase', 'Amex', 'Capital One', 'Citi', 'Other'];

export const CARD_CATALOG: CatalogCard[] = [
  {
    id: 'chase-sapphire-reserve',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    image: require('../assets/CC_images/ChaseSR.jpg'),
    color: '#1a3a5c',
  },
  {
    id: 'chase-sapphire-preferred',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    image: require('../assets/CC_images/ChaseSP.jpg'),
    color: '#1a3a5c',
  },
  {
    id: 'chase-freedom-flex',
    name: 'Chase Freedom Flex',
    issuer: 'Chase',
    image: require('../assets/CC_images/ChaseFF.jpg'),
    color: '#1a3a5c',
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    image: require('../assets/CC_images/ChaseFU.jpg'),
    color: '#1a3a5c',
  },
  {
    id: 'amex-gold',
    name: 'American Express Gold Card',
    issuer: 'Amex',
    image: require('../assets/CC_images/amexGold.png'),
    color: '#c9922a',
  },
  {
    id: 'amex-platinum',
    name: 'American Express Platinum Card',
    issuer: 'Amex',
    image: require('../assets/CC_images/amexPlat.jpg'),
    color: '#8c8c8c',
  },
  {
    id: 'amex-blue-cash-preferred',
    name: 'Amex Blue Cash Preferred',
    issuer: 'Amex',
    image: { uri: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/2681330d-450d-4f71-af38-3cb16f592c02/596f22094df609999878f43629debc8d416e18334ea8f5e68f9d92a72dd0b912.jpg' },
    color: '#1a4b8c',
  },
  {
    id: 'amex-blue-cash-everyday',
    name: 'Amex Blue Cash Everyday',
    issuer: 'Amex',
    image: { uri: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/5ed2eb69-5e8c-4014-b8b7-23c4d600591c/bfccadb4c5dc3dc5a88464e70bf2c7339280bf494e9c8fad0ee4e5230c465dc4.jpg' },
    color: '#1a4b8c',
  },
  {
    id: 'citi-double-cash',
    name: 'Citi Double Cash Card',
    issuer: 'Citi',
    image: require('../assets/CC_images/CitiDC.jpg'),
    color: '#003b70',
  },
  {
    id: 'citi-custom-cash',
    name: 'Citi Custom Cash Card',
    issuer: 'Citi',
    image: { uri: 'https://aemapi.citi.com/content/dam/cfs/uspb/usmkt/cards/en/static/images/citi-custom-cash-credit-card/citi-custom-cash-credit-card_306x192.webp' },
    color: '#003b70',
  },
  {
    id: 'citi-strata-premier',
    name: 'Citi Strata Premier',
    issuer: 'Citi',
    image: { uri: 'https://aemapi.citi.com/content/dam/cfs/uspb/usmkt/cards/en/static/images/citi-strata-premier-credit-card/citi-strata-premier-credit-card_306x192.webp' },
    color: '#003b70',
  },
  {
    id: 'capital-one-venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    image: require('../assets/CC_images/CapitalVX.jpg'),
    color: '#004977',
  },
  {
    id: 'capital-one-venture',
    name: 'Capital One Venture',
    issuer: 'Capital One',
    image: { uri: 'https://ecm.capitalone.com/WCM/card/products/venture_cardart_prim_323x203-1/mobile.png' },
    color: '#004977',
  },
  {
    id: 'capital-one-quicksilver',
    name: 'Capital One Quicksilver',
    issuer: 'Capital One',
    image: { uri: 'https://ecm.capitalone.com/WCM/card/products/quicksilver_cardart.png' },
    color: '#004977',
  },
  {
    id: 'discover-it',
    name: 'Discover it Cash Back',
    issuer: 'Other',
    image: require('../assets/CC_images/DiscoverIT.jpg'),
    color: '#f06423',
  },
  {
    id: 'apple-card',
    name: 'Apple Card',
    issuer: 'Other',
    image: require('../assets/CC_images/appleCC.png'),
    color: '#555555',
  },
  {
    id: 'wells-fargo-active-cash',
    name: 'Wells Fargo Active Cash',
    issuer: 'Other',
    image: { uri: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/b954a46c-caec-11eb-abf1-efb90fc6e740/403a0deae03eaff0d1ca2c7ab1175fcc45ebc9a9551d0c8104e758b3d82771d1.jpg' },
    color: '#c8102e',
  },
  {
    id: 'bofa-customized-cash',
    name: 'Bank of America Customized Cash Rewards',
    issuer: 'Other',
    image: require('../assets/CC_images/bofaCC.png'),
    color: '#c8102e',
  },
  {
    id: 'bilt',
    name: 'Bilt Mastercard',
    issuer: 'Other',
    image: require('../assets/CC_images/BiltM.jpg'),
    color: '#1a1a1a',
  },
  {
    id: 'robinhood-gold',
    name: 'Robinhood Gold Card',
    issuer: 'Other',
    image: require('../assets/CC_images/RobinhoodGold.png'),
    color: '#1a1a1a',
  },
  {
    id: 'us-bank-altitude-go',
    name: 'US Bank Altitude Go',
    issuer: 'Other',
    image: { uri: 'https://www.usbank.com/content/dam/usbank/en/images/illustrations/card-art/credit-cards/altitude-go-visa-signature-credit-card.png' },
    color: '#002b49',
  },
  {
    id: 'custom',
    name: 'Custom Card',
    issuer: 'Other',
    image: null,
    color: '#2d2d4e',
  },
];
