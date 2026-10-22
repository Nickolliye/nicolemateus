import supabase from './supabase';
import type { GiftReservation } from '../types';

export async function fetchAdminReservations(): Promise<GiftReservation[]> {
  const { data, error } = await supabase
    .from('gift_reservations')
    .select(`
      id, gift_id, guest_name, quantity, status, created_at, updated_at,
      gift:gifts ( name, image_path )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as unknown as GiftReservation[];
}

export async function cancelReservation(
  reservationId: string,
  notes?: string
): Promise<void> {
  const { data, error } = await supabase.rpc('cancel_reservation', {
    p_reservation_id: reservationId,
    p_notes: notes || null,
  });
  if (error) throw new Error(error.message);
  if (data && !data.success) throw new Error(data.message || 'Erro ao cancelar reserva.');
}
