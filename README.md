# Esspresowe

A React Native (Expo) app for tracking your credit cards, monitoring available credit, logging purchases, and keeping an eye on upcoming payments and annual fee renewals.

## Features

- Add cards from a built-in catalog or create a custom card
- Track credit limits and available balance after purchases
- Log purchases by card, amount, merchant, category, and date
- Upcoming payment and annual fee renewal alerts
- Benefit chip display showing top earning categories + base rate
- Icon legend explaining every reward category symbol
- Responsive layout — optimized for both phone and desktop web

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — install globally:
  ```bash
  npm install -g expo-cli
  ```
- **Expo Go** app on your phone (iOS or Android) — for testing on a real device
- A [Supabase](https://supabase.com/) project (free tier works)

---

## Supabase Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com/), create a new project, and note your **Project URL** and **Anon Key** from Settings → API.

### 2. Create the database tables

Run the following in your Supabase **SQL Editor**:

```sql
-- Cards table
create table cards (
  id text primary key,
  catalog_id text not null,
  name text not null,
  last_four text,
  due_day integer not null,
  card_limit text,
  image_url text,
  color text,
  member_since text,
  fee_due_date text,
  created_at timestamptz default now()
);

alter table cards disable row level security;

-- Purchases table
create table purchases (
  id text primary key,
  card_id text not null,
  amount numeric(10,2) not null,
  merchant text not null,
  category text not null,
  date date not null,
  created_at timestamptz default now()
);

alter table purchases disable row level security;
```

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/alyxce1015/credit-card-manager.git
cd credit-card-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your Supabase project URL and anon key.

### 4. Start the app

```bash
npm start
```

This opens the Expo dev tools. From there:

| Platform | How to run |
|----------|-----------|
| **Phone** | Scan the QR code with Expo Go |
| **iOS Simulator** | Press `i` in the terminal |
| **Android Emulator** | Press `a` in the terminal |
| **Web browser** | Press `w` in the terminal |

---

## Project Structure

```
credit-card-manager/
├── App.tsx              # Main app — all screens and navigation
├── data/
│   └── cards.ts         # Card catalog (21 cards + custom)
├── db/
│   └── database.ts      # Supabase queries for cards and purchases
├── lib/
│   └── supabase.ts      # Supabase client setup
├── styles/
│   ├── card.ts          # Card tile styles
│   ├── dashboard.ts     # Home screen + tab bar styles
│   ├── layout.ts        # Shared layout styles
│   └── modal.ts         # Modal and form styles
└── assets/
    └── CC_images/       # Card artwork
```

---

## Tech Stack

- [Expo](https://expo.dev/) 54 (React Native)
- [React](https://react.dev/) 19
- [Supabase](https://supabase.com/) (PostgreSQL backend)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (session persistence)
- [@expo/vector-icons](https://docs.expo.dev/guides/icons/) — FontAwesome 6
