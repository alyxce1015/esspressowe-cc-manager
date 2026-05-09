import { supabase } from '../lib/supabase';

export type UserCard = {
  id: string;
  catalogId: string;
  name: string;
  lastFour: string;
  dueDay: number;
  limit: string;
  imageUrl: string;
  color: string;
  memberSince?: string;  // "YYYY-MM-01" — card opened month, shown on no-fee cards
  feeDueDate?: string;   // "YYYY-MM-DD" — exact annual fee due date, for fee cards
};

function toRow(card: UserCard) {
  return {
    id: card.id,
    catalog_id: card.catalogId,
    name: card.name,
    last_four: card.lastFour,
    due_day: card.dueDay,
    card_limit: card.limit,
    image_url: card.imageUrl,
    color: card.color,
    ...(card.memberSince !== undefined && { member_since: card.memberSince }),
    ...(card.feeDueDate !== undefined && { fee_due_date: card.feeDueDate }),
  };
}

function fromRow(row: Record<string, unknown>): UserCard {
  return {
    id: row.id as string,
    catalogId: row.catalog_id as string,
    name: row.name as string,
    lastFour: row.last_four as string,
    dueDay: row.due_day as number,
    limit: row.card_limit as string,
    imageUrl: row.image_url as string,
    color: row.color as string,
    memberSince: (row.member_since as string | null | undefined) ?? undefined,
    feeDueDate: (row.fee_due_date as string | null | undefined) ?? undefined,
  };
}

export async function getCards(): Promise<UserCard[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('due_day', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(fromRow);
}

export async function insertCard(card: UserCard): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .insert(toRow(card));

  if (error) throw new Error(error.message);
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteCards(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .in('id', ids);

  if (error) throw new Error(error.message);
}

export async function updateCard(card: UserCard): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update(toRow(card))
    .eq('id', card.id);

  if (error) throw new Error(error.message);
}
