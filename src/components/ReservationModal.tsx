import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Gift, Heart, AlertCircle, Check, Minus, Plus } from 'lucide-react';
import type { Gift as GiftType, ReservationResult } from '../types';
import { reserveGift } from '../services/gifts';
import { getImageUrl, clamp } from '../utils';

interface ReservationModalProps {
  gift: GiftType | null;
  onClose: () => void;
  onSuccess: (result: ReservationResult) => void;
}

type ModalStep = 'form' | 'success' | 'unavailable';

export function ReservationModal({ gift, onClose, onSuccess }: ReservationModalProps) {
  const [step, setStep] = useState<ModalStep>('form');
  const [guestName, setGuestName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<ReservationResult | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const maxQuantity =
    gift?.quantity_mode === 'fixed'
      ? gift.available_quantity ?? 1
      : 100;

  useEffect(() => {
    if (gift) {
      setStep('form');
      setGuestName('');
      setQuantity(1);
      setError(null);
      setNameError(null);
      setLoading(false);
    }
  }, [gift]);

  useEffect(() => {
    if (gift) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [gift]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const validateName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'Por favor, informe seu nome.';
    if (trimmed.length < 2) return 'O nome deve ter pelo menos 2 caracteres.';
    if (trimmed.length > 100) return 'Nome muito longo. Máximo de 100 caracteres.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validateName(guestName);
    if (nameErr) { setNameError(nameErr); return; }
    setNameError(null);
    setError(null);

    if (!gift) return;

    setLoading(true);
    try {
      const result = await reserveGift(gift.id, guestName.trim(), quantity);
      if (result.success) {
        setSuccessResult(result);
        setStep('success');
        onSuccess(result);
      } else if (result.error === 'no_availability' || result.error === 'quantity_exceeds') {
        setStep('unavailable');
        setError(result.message || 'Este presente não está mais disponível.');
      } else {
        setError(result.message || 'Ocorreu um erro. Por favor, tente novamente.');
      }
    } catch {
      setError('Erro de conexao. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = getImageUrl(gift?.image_path ?? null);

  if (!gift) return null;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={step === 'success' ? 'Reserva confirmada' : `Reservar: ${gift.name}`}
    >
      <div className="modal-content animate-slide-up">
        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                background: 'rgba(112,47,59,0.08)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-lg)',
              }}
              aria-hidden="true"
            >
              <Heart size={32} strokeWidth={1.5} color="var(--color-marsala)" fill="rgba(112,47,59,0.15)" />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                color: 'var(--color-wine)',
                marginBottom: 'var(--spacing-lg)',
                lineHeight: 1.2,
              }}
            >
              Que alegria!
            </h2>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                lineHeight: '1.8',
                color: 'var(--color-gray-text)',
                marginBottom: 'var(--spacing-xl)',
              }}
            >
              <p style={{ marginBottom: '0.75rem' }}>
                Que alegria saber que voce quer fazer parte desse momento tao especial!
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                Muito obrigada pelo carinho e por nos ajudar a construir nosso novo lar.
                Receberemos seu presente com imensa gratidao.
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                Voce podera entrega-lo pessoalmente quando nos encontrarmos ou na recepcao do nosso casamento.
              </p>
              <p style={{ fontStyle: 'italic', color: 'var(--color-marsala)' }}>
                Com carinho, Nicole & Mateus.
              </p>
            </div>

            {successResult && (
              <div
                className="alert alert-info"
                style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'left' }}
              >
                <Check size={16} />
                <span>
                  <strong>{successResult.gift_name}</strong> reservado(a) por{' '}
                  <strong>{successResult.guest_name}</strong>
                  {successResult.quantity && successResult.quantity > 1
                    ? ` — ${successResult.quantity} unidades`
                    : ''}
                </span>
              </div>
            )}

            <button className="btn btn-primary w-full" onClick={onClose}>
              <Gift size={16} strokeWidth={2} />
              Voltar para a lista
            </button>
          </div>
        )}

        {/* ── UNAVAILABLE STEP ── */}
        {step === 'unavailable' && (
          <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                background: 'rgba(220,38,38,0.06)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-lg)',
              }}
              aria-hidden="true"
            >
              <AlertCircle size={32} strokeWidth={1.5} color="#dc2626" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-wine)', marginBottom: '1rem' }}>
              Presente nao disponivel
            </h2>
            <p style={{ color: 'var(--color-gray-text)', marginBottom: 'var(--spacing-xl)' }}>
              {error}
            </p>
            <p style={{ color: 'var(--color-gray-text)', fontSize: '0.875rem', marginBottom: 'var(--spacing-lg)' }}>
              A lista foi atualizada. Que tal escolher outro presente?
            </p>
            <button className="btn btn-primary w-full" onClick={onClose}>
              Ver outros presentes
            </button>
          </div>
        )}

        {/* ── FORM STEP ── */}
        {step === 'form' && (
          <>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
                {imageUrl && (
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--color-beige)',
                    }}
                    aria-hidden="true"
                  >
                    <img
                      src={imageUrl}
                      alt={gift.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div>
                  <h2
                    id="modal-title"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.375rem',
                      color: 'var(--color-wine)',
                      lineHeight: 1.2,
                    }}
                  >
                    {gift.name}
                  </h2>
                  {gift.description && (
                    <p style={{ fontSize: '0.875rem', marginTop: '0.375rem' }}>{gift.description}</p>
                  )}
                  {gift.quantity_mode === 'fixed' && gift.available_quantity !== null && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-olive)', marginTop: '0.25rem' }}>
                      {gift.available_quantity} de {gift.required_quantity} disponivel(is)
                    </p>
                  )}
                </div>
              </div>
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Fechar modal"
                type="button"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }} role="alert">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {/* Name field */}
                <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="form-label" htmlFor="guest-name">
                    Qual e o seu nome? <span aria-hidden="true" style={{ color: 'var(--color-marsala)' }}>*</span>
                  </label>
                  <input
                    id="guest-name"
                    ref={nameInputRef}
                    type="text"
                    className={`form-input${nameError ? ' error' : ''}`}
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (nameError) setNameError(validateName(e.target.value));
                    }}
                    placeholder="Seu nome, casal ou familia"
                    maxLength={100}
                    aria-required="true"
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? 'name-error' : 'name-hint'}
                  />
                  {nameError ? (
                    <span id="name-error" className="form-error" role="alert">{nameError}</span>
                  ) : (
                    <span id="name-hint" className="form-hint">
                      Assim saberemos quem esta preparando esse presente para nos.
                    </span>
                  )}
                </div>

                {/* Quantity field — only for fixed items */}
                {gift.quantity_mode === 'fixed' && (gift.available_quantity ?? 0) > 1 && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="reservation-quantity">
                      Quantas unidades?
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setQuantity((q) => clamp(q - 1, 1, maxQuantity))}
                        disabled={quantity <= 1}
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        id="reservation-quantity"
                        type="number"
                        className="form-input"
                        style={{ textAlign: 'center', width: '80px' }}
                        value={quantity}
                        min={1}
                        max={maxQuantity}
                        onChange={(e) => setQuantity(clamp(parseInt(e.target.value) || 1, 1, maxQuantity))}
                        aria-label={`Quantidade: ${quantity}`}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setQuantity((q) => clamp(q + 1, 1, maxQuantity))}
                        disabled={quantity >= maxQuantity}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={14} />
                      </button>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-text)' }}>
                        (max {maxQuantity})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.4)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          display: 'inline-block',
                        }}
                        aria-hidden="true"
                      />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <Heart size={15} strokeWidth={2} />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
