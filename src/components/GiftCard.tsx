import { Gift, Check, Infinity as InfinityIcon } from 'lucide-react';
import type { Gift as GiftType } from '../types';
import { getImageUrl } from '../utils';

interface GiftCardProps {
  gift: GiftType;
  onReserve: (gift: GiftType) => void;
}

export function GiftCard({ gift, onReserve }: GiftCardProps) {
  const imageUrl = getImageUrl(gift.image_path);
  const isOwned = gift.inventory_status === 'owned';
  const isGuaranteed = gift.is_guaranteed && !isOwned;
  const isUnlimited = gift.quantity_mode === 'unlimited';

  let cardClass = 'gift-card';
  if (isGuaranteed) cardClass += ' guaranteed';
  if (isOwned) cardClass += ' owned';

  const renderAvailability = () => {
    if (isOwned) return null;
    if (isGuaranteed) {
      return (
        <div className="gift-card__availability none" aria-label="Presente garantido, sem vagas disponíveis">
          <Check size={13} strokeWidth={2.5} />
          Todas as vagas preenchidas
        </div>
      );
    }
    if (isUnlimited) {
      return (
        <div className="gift-card__availability available" aria-label="Presentes ilimitados disponíveis">
          <InfinityIcon size={13} strokeWidth={2} />
          Ilimitado &mdash; sempre bem-vindo!
        </div>
      );
    }
    if (gift.available_quantity !== null) {
      const availClass = gift.available_quantity <= 1 ? 'scarce' : 'available';
      return (
        <div
          className={`gift-card__availability ${availClass}`}
          aria-label={`${gift.available_quantity} de ${gift.required_quantity} disponíveis`}
        >
          <Gift size={13} strokeWidth={2} />
          {gift.available_quantity} de {gift.required_quantity} disponível(is)
        </div>
      );
    }
    return null;
  };

  const renderBadge = () => {
    if (isOwned) {
      return (
        <span className="badge badge-owned" aria-label="O casal já possui este item">
          Já temos
        </span>
      );
    }
    if (isGuaranteed) {
      return (
        <span className="badge badge-guaranteed" aria-label="Presente garantido">
          <Check size={10} strokeWidth={2.5} />
          Garantido
        </span>
      );
    }
    if (isUnlimited) {
      return (
        <span className="badge badge-unlimited" aria-label="Quantidade ilimitada">
          <InfinityIcon size={10} strokeWidth={2} />
          Ilimitado
        </span>
      );
    }
    return null;
  };

  return (
    <article
      className={cardClass}
      aria-label={`Presente: ${gift.name}${isGuaranteed ? ' — garantido' : ''}${isOwned ? ' — já temos' : ''}`}
    >
      <div className="gift-card__image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={gift.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="image-placeholder" aria-hidden="true">
            <Gift size={40} strokeWidth={1} />
          </div>
        )}
        <div className="gift-card__badge">{renderBadge()}</div>
      </div>

      <div className="gift-card__body">
        <h3 className="gift-card__name">{gift.name}</h3>
        {gift.description && (
          <p className="gift-card__desc">{gift.description}</p>
        )}
        {renderAvailability()}
      </div>

      <div className="gift-card__footer">
        {!isOwned && !isGuaranteed ? (
          <button
            className="btn btn-primary w-full"
            onClick={() => onReserve(gift)}
            aria-label={`Quero presentear com ${gift.name}`}
          >
            <Gift size={15} strokeWidth={2} />
            Quero presentear
          </button>
        ) : isGuaranteed ? (
          <div
            className="btn btn-ghost w-full"
            style={{ cursor: 'default', opacity: 0.6 }}
            aria-disabled="true"
            role="status"
          >
            <Check size={15} strokeWidth={2} />
            Presente garantido
          </div>
        ) : (
          <div
            className="btn w-full"
            style={{
              cursor: 'default',
              color: 'var(--color-olive)',
              background: 'rgba(109,114,80,0.07)',
              border: '1.5px solid rgba(109,114,80,0.2)',
            }}
            aria-label="O casal já possui este item"
            role="status"
          >
            O casal ja possui este item
          </div>
        )}
      </div>
    </article>
  );
}
