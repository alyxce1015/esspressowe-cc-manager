export type CatalogCard = {
  id: string;
  name: string;
  issuer: string;
  imageUrl: string;
  color: string;
};

export const ISSUERS = ['All', 'Chase', 'Amex', 'Capital One', 'Citi', 'Other'];

export const CARD_CATALOG: CatalogCard[] = [
  {
    id: 'chase-sapphire-reserve',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    imageUrl: 'https://images.ctfassets.net/8qmz0ef3xzub/1SEpLWPkNLolbDxImf3IQw/8b7971576ddb89dcdcc44f9c27fdf38e/sapphire_reserve_card_Halo__2_.webp',
    color: '#1a3a5c',
  },
  {
    id: 'chase-sapphire-preferred',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    imageUrl: 'https://bcs.images.ctfassets.net/8qmz0ef3xzub/7iFzyweepMTrfGn2VrDdL5/74581d943a86bbe5c2e5800760def68f/sapphire_preferred_card.webp',
    color: '#1a3a5c',
  },
  {
    id: 'chase-freedom-flex',
    name: 'Chase Freedom Flex',
    issuer: 'Chase',
    imageUrl: 'https://images.ctfassets.net/8qmz0ef3xzub/7KrVet3yXT2YntiE8PqwAe/8705c3a1b357e949f56bbab918e3cf11/freedom_flex_card_alt.webp',
    color: '#1a3a5c',
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    imageUrl: 'https://www.chase.com/content/dam/jpmc-marketplace/card-art/freedom_unlimited_card_alt.png',
    color: '#1a3a5c',
  },
  {
    id: 'amex-gold',
    name: 'American Express Gold Card',
    issuer: 'Amex',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/2921dc2e-e2b0-4003-82af-f6ca0f575d1c/9939cc4d8238dcd5ad2100cc9696bd6e5999526b1b8b99e9296ca85a800a83e6.jpg',
    color: '#c9922a',
  },
  {
    id: 'amex-platinum',
    name: 'American Express Platinum Card',
    issuer: 'Amex',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/fd24850b-46ce-4ea8-9314-3594fe77944f/ef4003770aeed9c41fd5e172aaf2224611a39cde217bc4f9d10f8c75e9bb31b6.jpg',
    color: '#8c8c8c',
  },
  {
    id: 'amex-blue-cash-preferred',
    name: 'Amex Blue Cash Preferred',
    issuer: 'Amex',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/2681330d-450d-4f71-af38-3cb16f592c02/596f22094df609999878f43629debc8d416e18334ea8f5e68f9d92a72dd0b912.jpg',
    color: '#1a4b8c',
  },
  {
    id: 'amex-blue-cash-everyday',
    name: 'Amex Blue Cash Everyday',
    issuer: 'Amex',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/5ed2eb69-5e8c-4014-b8b7-23c4d600591c/bfccadb4c5dc3dc5a88464e70bf2c7339280bf494e9c8fad0ee4e5230c465dc4.jpg',
    color: '#1a4b8c',
  },
  {
    id: 'citi-double-cash',
    name: 'Citi Double Cash Card',
    issuer: 'Citi',
    imageUrl: 'https://aemapi.citi.com/content/dam/cfs/uspb/usmkt/cards/en/static/images/citi-double-cash-credit-card/citi-double-cash-credit-card_306x192.webp',
    color: '#003b70',
  },
  {
    id: 'citi-custom-cash',
    name: 'Citi Custom Cash Card',
    issuer: 'Citi',
    imageUrl: 'https://aemapi.citi.com/content/dam/cfs/uspb/usmkt/cards/en/static/images/citi-custom-cash-credit-card/citi-custom-cash-credit-card_306x192.webp',
    color: '#003b70',
  },
  {
    id: 'citi-strata-premier',
    name: 'Citi Strata Premier',
    issuer: 'Citi',
    imageUrl: 'https://aemapi.citi.com/content/dam/cfs/uspb/usmkt/cards/en/static/images/citi-strata-premier-credit-card/citi-strata-premier-credit-card_306x192.webp',
    color: '#003b70',
  },
  {
    id: 'capital-one-venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    imageUrl: 'https://ecm.capitalone.com/WCM/card/products/venturex-cg-static-card-1000x630-2.png',
    color: '#004977',
  },
  {
    id: 'capital-one-venture',
    name: 'Capital One Venture',
    issuer: 'Capital One',
    imageUrl: 'https://ecm.capitalone.com/WCM/card/products/venture_cardart_prim_323x203-1/mobile.png',
    color: '#004977',
  },
  {
    id: 'capital-one-quicksilver',
    name: 'Capital One Quicksilver',
    issuer: 'Capital One',
    imageUrl: 'https://ecm.capitalone.com/WCM/card/products/quicksilver_cardart.png',
    color: '#004977',
  },
  {
    id: 'discover-it',
    name: 'Discover it Cash Back',
    issuer: 'Other',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/a4a36a73-0294-4ca1-b36b-3eef5cee53ca/a1de1f5a52d4ab48b729c2ea25588d40b1b0382c84ddac318b584f1d62aa37bd.jpg',
    color: '#f06423',
  },
  {
    id: 'apple-card',
    name: 'Apple Card',
    issuer: 'Other',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/4528cd20-add2-11eb-b8c6-230f8597051d/ff9cbb30ffe2501aa1b667251366a4faf92194234ad19d87f24ccd8c839c5c7b.jpg',
    color: '#555555',
  },
  {
    id: 'wells-fargo-active-cash',
    name: 'Wells Fargo Active Cash',
    issuer: 'Other',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/b954a46c-caec-11eb-abf1-efb90fc6e740/403a0deae03eaff0d1ca2c7ab1175fcc45ebc9a9551d0c8104e758b3d82771d1.jpg',
    color: '#c8102e',
  },
  {
    id: 'bofa-customized-cash',
    name: 'Bank of America Customized Cash Rewards',
    issuer: 'Other',
    imageUrl: 'https://www.bankofamerica.com/content/images/ContextualSiteGraphics/CreditCardArt/en_US/Approved_PCM/8ckn_cshsigcm_v_300x188.png',
    color: '#c8102e',
  },
  {
    id: 'bilt',
    name: 'Bilt Mastercard',
    issuer: 'Other',
    imageUrl: 'https://www.nerdwallet.com/cdn-cgi/image/format=auto,width=1920,quality=80,sharpen=1/cdn/images/marketplace/credit_cards/9b157066-f0e5-11f0-a50d-b7776fbbe12c/1111d17e110315fa63bf7b8b2f4540bc53cd74320d92dee28fb534bb08655e3d.jpg',
    color: '#1a1a1a',
  },
  {
    id: 'us-bank-altitude-go',
    name: 'US Bank Altitude Go',
    issuer: 'Other',
    imageUrl: 'https://www.usbank.com/content/dam/usbank/en/images/illustrations/card-art/credit-cards/altitude-go-visa-signature-credit-card.png',
    color: '#002b49',
  },
  {
    id: 'custom',
    name: 'Custom Card',
    issuer: 'Other',
    imageUrl: '',
    color: '#2d2d4e',
  },
];
