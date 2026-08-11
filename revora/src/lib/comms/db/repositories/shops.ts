import type { SupabaseClient } from '@supabase/supabase-js';
import type { ShopRow } from '../types';

export async function getShopById(
  client: SupabaseClient,
  shopId: string,
): Promise<ShopRow | null> {
  const { data, error } = await client
    .from('shops')
    .select('*')
    .eq('id', shopId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load shop: ${error.message}`);
  return (data as ShopRow | null) ?? null;
}
