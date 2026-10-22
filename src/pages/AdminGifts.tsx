import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, AlertCircle, Check, X } from 'lucide-react';
import { fetchAdminGifts, createGift, updateGift, deleteGift } from '../services/gifts';
import type { GiftAdmin, GiftFormData, QuantityMode, InventoryStatus } from '../types';
import { getImageUrl, formatDate } from '../utils';
import { FullPageLoader } from '../components/LoadingState';

interface GiftFormProps {
  initial?: GiftAdmin | null;
  onSave: (data: GiftFormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}

function GiftForm({ initial, onSave, onCancel, saving, error }: GiftFormProps) {
  const [form, setForm] = useState<GiftFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    image_path: initial?.image_path ?? '',
    quantity_mode: initial?.quantity_mode ?? 'fixed',
    required_quantity: initial?.required_quantity ?? 1,
    inventory_status: initial?.inventory_status ?? 'needed',
    is_visible: initial?.is_visible ?? true,
    display_order: initial?.display_order ?? 0,
  });

  const set = (key: keyof GiftFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={initial ? 'Editar presente' : 'Cadastrar presente'}
    >
      <div className="modal-content animate-slide-up" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', color: 'var(--color-wine)' }}>
            {initial ? 'Editar presente' : 'Novo presente'}
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Fechar formulario">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {error && (
              <div className="alert alert-error" role="alert">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="gift-name">Nome do presente *</label>
              <input id="gift-name" type="text" className="form-input"
                value={form.name} onChange={(e) => set('name', e.target.value)}
                maxLength={120} required aria-required="true" placeholder="Ex: Jogo de tacacas de cristal" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gift-description">Descricao</label>
              <textarea id="gift-description" className="form-input"
                value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
                maxLength={500} rows={3} placeholder="Breve descricao do item (max 500 caracteres)"
                aria-describedby="desc-hint" />
              <span id="desc-hint" className="form-hint">{(form.description ?? '').length}/500 caracteres</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gift-image">URL da imagem</label>
              <input id="gift-image" type="url" className="form-input"
                value={form.image_path ?? ''} onChange={(e) => set('image_path', e.target.value)}
                placeholder="https://... ou caminho no Supabase Storage" />
              <span className="form-hint">URL externa (https://) ou caminho no Storage (ex: gifts/item.jpg)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="gift-qty-mode">Tipo de quantidade *</label>
                <select id="gift-qty-mode" className="form-input"
                  value={form.quantity_mode}
                  onChange={(e) => {
                    set('quantity_mode', e.target.value as QuantityMode);
                    if (e.target.value === 'unlimited') set('required_quantity', null);
                    else set('required_quantity', 1);
                  }}
                >
                  <option value="fixed">Quantidade fixa</option>
                  <option value="unlimited">Ilimitado</option>
                </select>
              </div>

              {form.quantity_mode === 'fixed' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="gift-qty">Quantidade necessaria *</label>
                  <input id="gift-qty" type="number" className="form-input"
                    value={form.required_quantity ?? 1}
                    min={1} max={9999} required={form.quantity_mode === 'fixed'}
                    onChange={(e) => set('required_quantity', parseInt(e.target.value) || 1)} />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="gift-status">Situacao *</label>
                <select id="gift-status" className="form-input"
                  value={form.inventory_status}
                  onChange={(e) => set('inventory_status', e.target.value as InventoryStatus)}
                >
                  <option value="needed">Precisamos</option>
                  <option value="owned">Ja temos</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gift-order">Ordem de exibicao</label>
                <input id="gift-order" type="number" className="form-input"
                  value={form.display_order}
                  min={0} max={9999}
                  onChange={(e) => set('display_order', parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.is_visible}
                  onChange={(e) => set('is_visible', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-marsala)' }}
                />
                <span className="form-label" style={{ margin: 0 }}>Visivel publicamente</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving} aria-busy={saving}>
              {saving ? 'Salvando...' : (initial ? 'Salvar alteracoes' : 'Cadastrar presente')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminGifts() {
  const [gifts, setGifts] = useState<GiftAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingGift, setEditingGift] = useState<GiftAdmin | null | false>(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminGifts();
      setGifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar presentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData: GiftFormData) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (editingGift) {
        await updateGift((editingGift as GiftAdmin).id, formData);
        showToast('Presente atualizado com sucesso!');
      } else {
        await createGift(formData);
        showToast('Presente cadastrado com sucesso!');
      }
      setEditingGift(false);
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (gift: GiftAdmin) => {
    try {
      await updateGift(gift.id, { is_visible: !gift.is_visible });
      showToast(`Presente ${gift.is_visible ? 'ocultado' : 'reativado'}.`);
      await load();
    } catch (err) {
      showToast('Erro ao alterar visibilidade.');
    }
  };

  const handleDelete = async (gift: GiftAdmin) => {
    if (!confirm(`Excluir "${gift.name}"? Esta acao nao pode ser desfeita.`)) return;
    setDeletingId(gift.id);
    try {
      await deleteGift(gift.id);
      showToast('Presente excluido.');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = gifts.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <FullPageLoader />;

  return (
    <>
      <div className="admin-header">
        <h1>Presentes</h1>
        <p>Gerencie os itens da lista de presentes</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-text)' }} aria-hidden="true" />
          <input
            type="search" className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Buscar presente..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar presentes na administracao"
          />
        </div>
        <button className="btn btn-primary" onClick={() => setEditingGift(null)} aria-label="Cadastrar novo presente">
          <Plus size={16} strokeWidth={2} /> Novo presente
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table" aria-label="Lista de presentes para gerenciamento">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Quantidade</th>
              <th>Reservado</th>
              <th>Situacao</th>
              <th>Visivel</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-gray-text)' }}>
                  {search ? 'Nenhum resultado para a busca.' : 'Nenhum presente cadastrado.'}
                </td>
              </tr>
            ) : (
              filtered.map((gift) => {
                const imgUrl = getImageUrl(gift.image_path);
                return (
                  <tr key={gift.id}>
                    <td>
                      {imgUrl ? (
                        <img src={imgUrl} alt={gift.name}
                          style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-beige)' }} />
                      ) : (
                        <div style={{ width: '56px', height: '40px', background: 'var(--color-beige-light)', borderRadius: 'var(--radius-sm)' }} />
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{gift.name}</div>
                      {gift.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-text)', marginTop: '2px' }}>
                          {gift.description.slice(0, 60)}{gift.description.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td>
                      {gift.quantity_mode === 'unlimited' ? (
                        <span className="badge badge-unlimited">Ilimitado</span>
                      ) : (
                        <span>{gift.required_quantity}</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: gift.reserved_quantity > 0 ? 'var(--color-marsala)' : 'var(--color-gray-text)' }}>
                        {gift.reserved_quantity ?? 0}
                      </span>
                    </td>
                    <td>
                      {gift.inventory_status === 'owned' ? (
                        <span className="badge badge-owned">Ja temos</span>
                      ) : gift.is_guaranteed ? (
                        <span className="badge badge-guaranteed"><Check size={10} /> Garantido</span>
                      ) : (
                        <span className="badge badge-needed">Precisamos</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: gift.is_visible ? 'var(--color-olive)' : 'var(--color-gray-text)' }}>
                        {gift.is_visible ? 'Sim' : 'Oculto'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingGift(gift)}
                          aria-label={`Editar ${gift.name}`}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggleVisibility(gift)}
                          aria-label={gift.is_visible ? `Ocultar ${gift.name}` : `Tornar ${gift.name} visivel`}
                          title={gift.is_visible ? 'Ocultar' : 'Mostrar'}
                        >
                          {gift.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(gift)}
                          disabled={deletingId === gift.id}
                          aria-label={`Excluir ${gift.name}`}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {(editingGift !== false) && (
        <GiftForm
          initial={editingGift}
          onSave={handleSave}
          onCancel={() => { setEditingGift(false); setSaveError(null); }}
          saving={saving}
          error={saveError}
        />
      )}

      {toast && (
        <div className="toast success" role="status" aria-live="polite">{toast}</div>
      )}
    </>
  );
}
