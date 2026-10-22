import { Search, X } from 'lucide-react';
import type { GiftFilter } from '../types';

interface GiftSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: GiftFilter;
  onFilterChange: (filter: GiftFilter) => void;
  hasOwnedItems: boolean;
  totalFiltered: number;
  totalVisible: number;
}

export function GiftSearch({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  hasOwnedItems,
  totalFiltered,
  totalVisible,
}: GiftSearchProps) {
  const filters: { key: GiftFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'needed', label: 'Precisamos' },
    { key: 'guaranteed', label: 'Garantidos' },
    ...(hasOwnedItems ? [{ key: 'owned' as GiftFilter, label: 'Ja temos' }] : []),
  ];

  return (
    <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
      {/* Search bar */}
      <div className="search-container" role="search" aria-label="Buscar presentes">
        <Search className="search-icon" size={18} strokeWidth={1.5} aria-hidden="true" />
        <input
          id="gift-search"
          type="search"
          className="search-input"
          placeholder="Busque um presente pelo nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar presentes pelo nome"
          autoComplete="off"
        />
        {searchTerm && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Limpar busca"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" role="tablist" aria-label="Filtrar presentes por categoria">
        {filters.map((filter) => (
          <button
            key={filter.key}
            className={`filter-tab${activeFilter === filter.key ? ' active' : ''}`}
            onClick={() => onFilterChange(filter.key)}
            role="tab"
            aria-selected={activeFilter === filter.key}
            aria-controls="gift-catalog"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      {(searchTerm || activeFilter !== 'all') && (
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: 'var(--color-gray-text)',
            marginTop: '0.75rem',
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {totalFiltered === 0
            ? 'Nenhum resultado encontrado'
            : `${totalFiltered} de ${totalVisible} presente(s)`}
        </p>
      )}
    </div>
  );
}
