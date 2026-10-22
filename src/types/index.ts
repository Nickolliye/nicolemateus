// ============================================================
// Nicole & Mateus - Wedding Gift List - Type Definitions
// ============================================================

export type QuantityMode = 'fixed' | 'unlimited';
export type InventoryStatus = 'needed' | 'owned';
export type ReservationStatus = 'active' | 'cancelled';

export interface Gift {
  id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  quantity_mode: QuantityMode;
  required_quantity: number | null;
  reserved_quantity: number;
  available_quantity: number | null;
  inventory_status: InventoryStatus;
  display_order: number;
  is_guaranteed: boolean;
  created_at: string;
}

export interface GiftAdmin extends Gift {
  is_visible: boolean;
  updated_at: string;
}

export interface GiftReservation {
  id: string;
  gift_id: string;
  guest_name: string;
  quantity: number;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
  gift?: Pick<GiftAdmin, 'name' | 'image_path'>;
}

export type GiftFilter = 'all' | 'needed' | 'guaranteed' | 'owned';

export interface ReservationResult {
  success: boolean;
  error?: string;
  message?: string;
  reservation_id?: string;
  gift_name?: string;
  guest_name?: string;
  quantity?: number;
  available?: number;
}

export interface GiftFormData {
  name: string;
  description: string;
  image_path: string;
  quantity_mode: QuantityMode;
  required_quantity: number | null;
  inventory_status: InventoryStatus;
  is_visible: boolean;
  display_order: number;
}

export interface DashboardStats {
  total: number;
  needed: number;
  guaranteed: number;
  owned: number;
  total_reservations: number;
  active_reservations: number;
}
