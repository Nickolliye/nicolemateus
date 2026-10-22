import supabase from './supabase';
import type { Gift, GiftAdmin, GiftFormData, ReservationResult } from '../types';

// ─── PUBLIC API ──────────────────────────────────────────────

/**
 * Fetch all visible gifts with aggregated reservation counts.
 * Does NOT expose guest names.
 */
export async function fetchPublicGifts(): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('id, name, description, image_path, quantity_mode, required_quantity, inventory_status, display_order, is_guaranteed:gift_reservations(count)')
    .eq('is_visible', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[gifts] fetchPublicGifts error:', error);
    throw new Error('Erro ao carregar a lista de presentes. Tente novamente.');
  }
  // We need aggregated counts — use the get_gifts_public function
  return fetchPublicGiftsViaRpc();
}

export async function fetchPublicGiftsViaRpc(): Promise<Gift[]> {
  const { data, error } = await supabase
    .rpc('get_gifts_public');

  if (error) {
    console.error('[gifts] RPC error:', error);
    // Fallback: fetch from view
    return fetchGiftsFallback();
  }
  return (data as Gift[]) || [];
}

async function fetchGiftsFallback(): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error('Erro ao carregar presentes.');

  // Fetch reservation counts for each gift
  const giftsWithCounts = await Promise.all(
    (data || []).map(async (gift) => {
      const { count } = await supabase
        .from('gift_reservations')
        .select('quantity', { count: 'exact', head: false })
        .eq('gift_id', gift.id)
        .eq('status', 'active');

      const reservedQuantity = count || 0;
      const availableQuantity =
        gift.quantity_mode === 'fixed'
          ? Math.max(0, gift.required_quantity - reservedQuantity)
          : null;
      const isGuaranteed =
        gift.quantity_mode === 'fixed' &&
        reservedQuantity >= gift.required_quantity;

      return {
        ...gift,
        reserved_quantity: reservedQuantity,
        available_quantity: availableQuantity,
        is_guaranteed: isGuaranteed,
      } as Gift;
    })
  );
  return giftsWithCounts;
}

/**
 * Reserve a gift atomically via the secure backend function.
 */
export async function reserveGift(
  giftId: string,
  guestName: string,
  quantity: number = 1
): Promise<ReservationResult> {
  const { data, error } = await supabase.rpc('reserve_gift', {
    p_gift_id: giftId,
    p_guest_name: guestName.trim(),
    p_quantity: quantity,
  });

  if (error) {
    console.error('[gifts] reserveGift error:', error);
    return {
      success: false,
      error: 'network_error',
      message: 'Erro de comunicacao com o servidor. Por favor, tente novamente.',
    };
  }

  return data as ReservationResult;
}

// ─── ADMIN API ───────────────────────────────────────────────

export async function fetchAdminGifts(): Promise<GiftAdmin[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error('Erro ao carregar presentes.');

  // Enrich with reservation counts
  const enriched = await Promise.all(
    (data || []).map(async (gift) => {
      const { data: reservations } = await supabase
        .from('gift_reservations')
        .select('quantity')
        .eq('gift_id', gift.id)
        .eq('status', 'active');

      const reservedQty = (reservations || []).reduce((sum, r) => sum + r.quantity, 0);
      const availableQty =
        gift.quantity_mode === 'fixed'
          ? Math.max(0, gift.required_quantity - reservedQty)
          : null;

      return {
        ...gift,
        reserved_quantity: reservedQty,
        available_quantity: availableQty,
        is_guaranteed:
          gift.quantity_mode === 'fixed' && reservedQty >= gift.required_quantity,
      } as GiftAdmin;
    })
  );
  return enriched;
}

export async function createGift(formData: GiftFormData): Promise<GiftAdmin> {
  const payload = {
    name: formData.name.trim(),
    description: formData.description?.trim() || null,
    image_path: formData.image_path?.trim() || null,
    quantity_mode: formData.quantity_mode,
    required_quantity:
      formData.quantity_mode === 'fixed' ? formData.required_quantity : null,
    inventory_status: formData.inventory_status,
    is_visible: formData.is_visible,
    display_order: formData.display_order,
  };

  const { data, error } = await supabase
    .from('gifts')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { ...data, reserved_quantity: 0, available_quantity: data.required_quantity, is_guaranteed: false } as GiftAdmin;
}

export async function updateGift(id: string, formData: Partial<GiftFormData>): Promise<GiftAdmin> {
  const payload: Record<string, unknown> = {};
  if (formData.name !== undefined) payload.name = formData.name.trim();
  if (formData.description !== undefined) payload.description = formData.description?.trim() || null;
  if (formData.image_path !== undefined) payload.image_path = formData.image_path?.trim() || null;
  if (formData.quantity_mode !== undefined) {
    payload.quantity_mode = formData.quantity_mode;
    payload.required_quantity = formData.quantity_mode === 'fixed' ? formData.required_quantity : null;
  }
  if (formData.inventory_status !== undefined) payload.inventory_status = formData.inventory_status;
  if (formData.is_visible !== undefined) payload.is_visible = formData.is_visible;
  if (formData.display_order !== undefined) payload.display_order = formData.display_order;

  const { data, error } = await supabase
    .from('gifts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as GiftAdmin;
}

export async function deleteGift(id: string): Promise<void> {
  // Check for active reservations first
  const { count } = await supabase
    .from('gift_reservations')
    .select('id', { count: 'exact', head: true })
    .eq('gift_id', id)
    .eq('status', 'active');

  if (count && count > 0) {
    throw new Error(
      'Este presente possui reservas ativas. Cancele-as antes de excluir o item.'
    );
  }

  const { error } = await supabase.from('gifts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function uploadGiftImage(file: File, giftId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `gifts/${giftId}.${ext}`;
  const { error } = await supabase.storage
    .from('gift-images')
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('gift-images').getPublicUrl(path);
  return data.publicUrl;
}

// RPC function registration — called once in Supabase setup
// The get_gifts_public function must be created via migration
export async function registerPublicGiftsFunction(): Promise<void> {
  // This is a no-op in the client — the function lives in Supabase
  // See supabase/migrations/001_initial_schema.sql
}
