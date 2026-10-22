import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { fetchAdminReservations, cancelReservation } from '../services/reservations';
import type { GiftReservation } from '../types';
import { formatDate, getImageUrl } from '../utils';
import { FullPageLoader } from '../components/LoadingState';

export function AdminReservations() {
  const [reservations, setReservations] = useState<GiftReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminReservations();
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reservas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (r: GiftReservation) => {
    if (!confirm(`Cancelar reserva de "${r.guest_name}" para "${(r.gift as { name: string } | undefined)?.name ?? 'este item'}"?`)) return;
    setCancellingId(r.id);
    try {
      await cancelReservation(r.id, 'Cancelado pelo administrador');
      showToast('Reserva cancelada com sucesso.');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar reserva.');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = reservations.filter((r) =>
    filter === 'all' ? true : r.status === filter
  );

  const activeCount = reservations.filter((r) => r.status === 'active').length;
  const cancelledCount = reservations.filter((r) => r.status === 'cancelled').length;

  if (loading) return <FullPageLoader />;

  return (
    <>
      <div className="admin-header">
        <h1>Reservas</h1>
        <p>Acompanhe as intencoes de presente dos convidados</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        {(['all', 'active', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            className={`filter-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `Todas (${reservations.length})` : f === 'active' ? `Ativas (${activeCount})` : `Canceladas (${cancelledCount})`}
          </button>
        ))}
      </div>

      <div className="admin-table-container">
        <table className="admin-table" aria-label="Lista de reservas de presentes">
          <thead>
            <tr>
              <th>Convidado</th>
              <th>Presente</th>
              <th>Quantidade</th>
              <th>Data</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-gray-text)' }}>
                  Nenhuma reserva {filter !== 'all' ? filter === 'active' ? 'ativa' : 'cancelada' : ''} encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const gift = r.gift as { name: string; image_path: string | null } | undefined;
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.guest_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        {gift?.image_path && (
                          <img
                            src={getImageUrl(gift.image_path) ?? ''}
                            alt={gift.name}
                            style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                        <span>{gift?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td>{r.quantity}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-gray-text)' }}>
                      {formatDate(r.created_at)}
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'active' ? 'badge-needed' : 'badge-guaranteed'}`}>
                        {r.status === 'active' ? 'Ativa' : 'Cancelada'}
                      </span>
                    </td>
                    <td>
                      {r.status === 'active' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(r)}
                          disabled={cancellingId === r.id}
                          aria-label={`Cancelar reserva de ${r.guest_name}`}
                          title="Cancelar reserva"
                        >
                          <X size={14} />
                          {cancellingId === r.id ? '...' : 'Cancelar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}
    </>
  );
}
