import * as SQLite from 'expo-sqlite';

export type UserCard = {
  id: string;
  catalogId: string;
  name: string;
  lastFour: string;
  dueDay: number;
  limit: string;
  imageUrl: string;
  color: string;
};

let db: SQLite.SQLiteDatabase | null = null;

export function initDatabase() {
  db = SQLite.openDatabaseSync('cards.db');
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY NOT NULL,
      catalogId TEXT NOT NULL,
      name TEXT NOT NULL,
      lastFour TEXT,
      dueDay INTEGER NOT NULL,
      cardLimit TEXT,
      imageUrl TEXT,
      color TEXT
    )
  `);
}

export function getCards(): UserCard[] {
  if (!db) return [];
  const rows = db.getAllSync<{
    id: string;
    catalogId: string;
    name: string;
    lastFour: string;
    dueDay: number;
    cardLimit: string;
    imageUrl: string;
    color: string;
  }>('SELECT * FROM cards ORDER BY dueDay ASC');

  return rows.map((row) => ({ ...row, limit: row.cardLimit }));
}

export function insertCard(card: UserCard) {
  if (!db) return;
  db.runSync(
    'INSERT INTO cards (id, catalogId, name, lastFour, dueDay, cardLimit, imageUrl, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [card.id, card.catalogId, card.name, card.lastFour, card.dueDay, card.limit, card.imageUrl, card.color]
  );
}

export function deleteCard(id: string) {
  if (!db) return;
  db.runSync('DELETE FROM cards WHERE id = ?', [id]);
}

export function updateCard(card: UserCard) {
  if (!db) return;
  db.runSync(
    'UPDATE cards SET catalogId = ?, name = ?, lastFour = ?, dueDay = ?, cardLimit = ?, imageUrl = ?, color = ? WHERE id = ?',
    [card.catalogId, card.name, card.lastFour, card.dueDay, card.limit, card.imageUrl, card.color, card.id]
  );
}
