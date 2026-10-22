import { Gift, Search } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-gifts' | 'no-results' | 'error';
  searchTerm?: string;
  onRetry?: () => void;
  onClearSearch?: () => void;
}

export function EmptyState({ type = 'no-gifts', searchTerm, onRetry, onClearSearch }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="empty-state" role="status" aria-live="polite">
        <div className="empty-state__icon">
          <Search size={48} strokeWidth={1} />
        </div>
        <h3>Nenhum presente encontrado</h3>
        <p style={{ marginTop: '0.5rem' }}>
          Nao encontramos nenhum item{searchTerm ? ` com "${searchTerm}"` : '.'}
        </p>
        {onClearSearch && (
          <button
            className="btn btn-secondary"
            style={{ marginTop: '1.5rem' }}
            onClick={onClearSearch}
          >
            Limpar busca
          </button>
        )}
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="empty-state" role="alert">
        <div className="empty-state__icon">
          <Gift size={48} strokeWidth={1} />
        </div>
        <h3>Algo deu errado</h3>
        <p style={{ marginTop: '0.5rem' }}>
          Nao conseguimos carregar a lista. Verifique sua conexao e tente novamente.
        </p>
        {onRetry && (
          <button
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={onRetry}
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Gift size={48} strokeWidth={1} />
      </div>
      <h3>Lista em preparacao</h3>
      <p style={{ marginTop: '0.5rem' }}>
        Em breve os presentes estarao disponiveis aqui. Obrigada pela paciencia!
      </p>
    </div>
  );
}
