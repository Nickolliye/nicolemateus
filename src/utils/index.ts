/**
 * Normalize text for accent-insensitive search
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Check if search term matches gift name/description
 */
export function matchesSearch(gift: { name: string; description: string | null }, term: string): boolean {
  if (!term.trim()) return true;
  const normalized = normalizeText(term);
  return (
    normalizeText(gift.name).includes(normalized) ||
    (gift.description ? normalizeText(gift.description).includes(normalized) : false)
  );
}

/**
 * Format date to Portuguese locale
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get public image URL — supports Supabase Storage paths and external URLs
 */
export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/gift-images/${imagePath}`;
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
