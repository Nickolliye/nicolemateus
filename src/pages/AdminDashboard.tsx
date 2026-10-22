import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, BookOpen, LogOut,
  Gift as GiftIcon, Check, Infinity as InfinityIcon, ShoppingBag, Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { fetchAdminGifts } from '../services/gifts';
import { fetchAdminReservations } from '../services/reservations';
import { AdminGifts } from './AdminGifts';
import { AdminReservations } from './AdminReservations';
import { FullPageLoader } from '../components/LoadingState';
import type { DashboardStats, GiftAdmin, GiftReservation } from '../types';
import { formatDate } from '../utils';

type AdminTab = 'dashboard' | 'gifts' | 'reservations';

function StatCard({ number, label, color }: { number: number; label: string; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card__number" style={color ? { color } : {}}>{number}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

export function AdminDashboard() {
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<GiftReservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/admin');
  }, [isAuthenticated, authLoading, navigate]);

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [gifts, reservations] = await Promise.all([
        fetchAdminGifts(),
        fetchAdminReservations(),
      ]);

      const computedStats: DashboardStats = {
        total: gifts.length,
        needed: gifts.filter((g: GiftAdmin) => g.inventory_status === 'needed' && !g.is_guaranteed).length,
        guaranteed: gifts.filter((g: GiftAdmin) => g.is_guaranteed).length,
        owned: gifts.filter((g: GiftAdmin) => g.inventory_status === 'owned').length,
        total_reservations: reservations.length,
        active_reservations: reservations.filter((r: GiftReservation) => r.status === 'active').length,
      };
      setStats(computedStats);
      setRecentReservations(reservations.slice(0, 10));
    } catch (err) {
      console.error('[dashboard] load error:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadDashboardData();
  }, [isAuthenticated, loadDashboardData]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  if (authLoading) return <FullPageLoader />;
  if (!isAuthenticated) return null;

  const navItems = [
    { key: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'gifts' as AdminTab, label: 'Presentes', icon: Package },
    { key: 'reservations' as AdminTab, label: 'Reservas', icon: BookOpen },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" aria-label="Menu administrativo">
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__monogram">N & M</div>
          <div className="admin-sidebar__subtitle">Painel dos noivos</div>
        </div>

        <nav className="admin-nav" aria-label="Navegacao administrativa">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`admin-nav__item${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}
              aria-current={activeTab === key ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div style={{ fontSize: '0.75rem', color: 'rgba(232,221,205,0.5)', marginBottom: '0.75rem' }}>
            {user?.email}
          </div>
          <a
            href="https://nickolliye.github.io/nicolemateus/"
            className="admin-nav__item"
            style={{ textDecoration: 'none', marginBottom: '0.5rem' }}
            title="Voltar ao site público"
          >
            <Globe size={16} strokeWidth={1.5} />
            Voltar ao site
          </a>
          <button
            className="admin-nav__item"
            onClick={handleSignOut}
            aria-label="Sair do painel administrativo"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main" aria-label="Conteudo administrativo">
        {activeTab === 'dashboard' && (
          <>
            <div className="admin-header">
              <h1>Dashboard</h1>
              <p>Visao geral da lista de presentes de Nicole & Mateus</p>
            </div>

            {loadingData ? (
              <FullPageLoader />
            ) : (
              <>
                <div className="stats-grid">
                  <StatCard number={stats?.total ?? 0} label="Total de itens" />
                  <StatCard number={stats?.needed ?? 0} label="Precisamos" color="var(--color-marsala)" />
                  <StatCard number={stats?.guaranteed ?? 0} label="Garantidos" color="var(--color-olive)" />
                  <StatCard number={stats?.owned ?? 0} label="Ja temos" color="var(--color-gray-text)" />
                  <StatCard number={stats?.active_reservations ?? 0} label="Reservas ativas" color="var(--color-wine)" />
                </div>

                {/* Recent Reservations */}
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', color: 'var(--color-wine)', marginBottom: 'var(--spacing-lg)' }}>
                    Reservas recentes
                  </h2>
                  {recentReservations.length === 0 ? (
                    <div className="empty-state">
                      <p>Nenhuma reserva registrada ainda.</p>
                    </div>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table" aria-label="Reservas recentes">
                        <thead>
                          <tr>
                            <th>Convidado</th>
                            <th>Presente</th>
                            <th>Qtd</th>
                            <th>Data</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentReservations.map((r) => (
                            <tr key={r.id}>
                              <td style={{ fontWeight: 500 }}>{r.guest_name}</td>
                              <td>{(r.gift as { name: string } | undefined)?.name ?? '—'}</td>
                              <td>{r.quantity}</td>
                              <td style={{ color: 'var(--color-gray-text)', fontSize: '0.8125rem' }}>
                                {formatDate(r.created_at)}
                              </td>
                              <td>
                                <span className={`badge ${r.status === 'active' ? 'badge-needed' : 'badge-guaranteed'}`}>
                                  {r.status === 'active' ? 'Ativa' : 'Cancelada'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'gifts' && <AdminGifts />}
        {activeTab === 'reservations' && <AdminReservations />}
      </main>
    </div>
  );
}
