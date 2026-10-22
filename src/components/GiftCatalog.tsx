import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { GiftCard } from './GiftCard';
import { GiftSearch } from './GiftSearch';
import { ReservationModal } from './ReservationModal';
import { GiftGridSkeleton } from './LoadingState';
import { EmptyState } from './EmptyState';
import { useGifts } from '../hooks/useGifts';
import type { Gift, ReservationResult } from '../types';

export function GiftCatalog() {
  const {
    gifts,
    filteredGifts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    refresh,
    hasOwnedItems,
  } = useGifts();

  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  const handleReserveClick = (gift: Gift) => {
    setSelectedGift(gift);
  };

  const handleModalClose = () => {
    setSelectedGift(null);
    refresh(); // Refresh data when modal closes to show updated availability
  };

  const handleReservationSuccess = (_result: ReservationResult) => {
    // Refresh will happen on modal close
  };

  return (
    <section id="presentes" className="section" aria-label="Catalogo de presentes">
      <div className="container">
        <div className="section-header">
          <h2>Lista de Presentes</h2>
          <p>
            Escolha o que o seu coracao mandar. Cada gesto e recebido com imensa gratidao.
          </p>
        </div>

        <GiftSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          hasOwnedItems={hasOwnedItems}
          totalFiltered={filteredGifts.length}
          totalVisible={gifts.length}
        />

        <div id="gift-catalog" role="tabpanel" aria-label="Lista filtrada de presentes">
          {loading ? (
            <GiftGridSkeleton count={6} />
          ) : error ? (
            <EmptyState type="error" onRetry={refresh} />
          ) : filteredGifts.length === 0 ? (
            <EmptyState
              type={searchTerm || activeFilter !== 'all' ? 'no-results' : 'no-gifts'}
              searchTerm={searchTerm}
              onClearSearch={() => { setSearchTerm(''); setActiveFilter('all'); }}
            />
          ) : (
            <>
              <div className="gift-grid">
                {filteredGifts.map((gift) => (
                  <GiftCard
                    key={gift.id}
                    gift={gift}
                    onReserve={handleReserveClick}
                  />
                ))}
              </div>

              {/* Refresh hint */}
              <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={refresh}
                  aria-label="Atualizar lista de presentes"
                >
                  <RefreshCw size={14} strokeWidth={2} />
                  Atualizar lista
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedGift && (
        <ReservationModal
          gift={selectedGift}
          onClose={handleModalClose}
          onSuccess={handleReservationSuccess}
        />
      )}
    </section>
  );
}
