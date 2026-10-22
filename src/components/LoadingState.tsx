export function GiftCardSkeleton() {
  return (
    <div className="gift-card" aria-hidden="true">
      <div className="gift-card__image">
        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="gift-card__body">
        <div className="skeleton" style={{ height: '24px', width: '70%' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%', marginTop: '8px' }} />
        <div className="skeleton" style={{ height: '16px', width: '60%', marginTop: '4px' }} />
      </div>
      <div className="gift-card__footer">
        <div className="skeleton" style={{ height: '40px', width: '100%' }} />
      </div>
    </div>
  );
}

export function GiftGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="gift-grid" aria-label="Carregando presentes...">
      {Array.from({ length: count }, (_, i) => (
        <GiftCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
      }}
      aria-live="polite"
      aria-label="Carregando..."
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--color-beige)',
          borderTopColor: 'var(--color-marsala)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: 'var(--color-gray-text)', fontSize: '0.875rem' }}>
        Carregando...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
