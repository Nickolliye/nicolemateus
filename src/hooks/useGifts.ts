import { useState, useEffect, useCallback } from 'react';
import { fetchPublicGiftsViaRpc } from '../services/gifts';
import type { Gift, GiftFilter } from '../types';
import { matchesSearch } from '../utils';

export function useGifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<GiftFilter>('all');

  const loadGifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicGiftsViaRpc();
      setGifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar presentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGifts();
    // Refresh every 60 seconds to catch reservations from other users
    const interval = setInterval(loadGifts, 60_000);
    return () => clearInterval(interval);
  }, [loadGifts]);

  const filteredGifts = gifts.filter((gift) => {
    const searchMatch = matchesSearch(
      { name: gift.name, description: gift.description },
      searchTerm
    );
    if (!searchMatch) return false;

    switch (activeFilter) {
      case 'needed':
        return gift.inventory_status === 'needed' && !gift.is_guaranteed;
      case 'guaranteed':
        return gift.inventory_status === 'needed' && gift.is_guaranteed;
      case 'owned':
        return gift.inventory_status === 'owned';
      case 'all':
      default:
        return true;
    }
  });

  const hasOwnedItems = gifts.some((g) => g.inventory_status === 'owned');
  const neededCount = gifts.filter(
    (g) => g.inventory_status === 'needed' && !g.is_guaranteed
  ).length;
  const guaranteedCount = gifts.filter(
    (g) => g.inventory_status === 'needed' && g.is_guaranteed
  ).length;

  return {
    gifts,
    filteredGifts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    refresh: loadGifts,
    hasOwnedItems,
    neededCount,
    guaranteedCount,
  };
}
