import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import type { ListingShort } from '../../lib/types';
import { ConditionBadge } from '../ui/Badge';
import { hapticSelection } from '../../lib/telegram';
import { getCatalogLabel, getCityDisplayName } from '../../lib/catalog';

interface ListingCardProps {
  listing: ListingShort;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  onClick?: () => void;
  index?: number;
}

const fallbackImage = 'https://images.pexels.com/photos/164829/pexels-photo-164829.jpeg?w=700';
const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`;

const timeAgo = (date: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return 'сейчас';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} д назад`;
};

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite = false,
  onFavoriteClick,
  onClick,
  index = 0,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const primaryImage = listing.cover_photo?.url || fallbackImage;
  const catalogLabel = getCatalogLabel(listing);

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    hapticSelection();
    onFavoriteClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      className="group flex min-h-[98px] cursor-pointer gap-3 rounded-lg border border-separator bg-white p-3 transition-colors hover:border-[var(--border-strong)] active:bg-secondary"
      style={{ animationDelay: `${index * 0.03}s` }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="relative h-[74px] w-[74px] flex-shrink-0 overflow-hidden rounded-md bg-secondary">
        {!imageLoaded && <div className="absolute inset-0 animate-shimmer" />}
        <img
          src={primaryImage}
          alt={listing.title}
          className={`h-full w-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{listing.title}</h3>
            <p className="mt-1 truncate text-[10px] tracking-[0.04em] text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
              {getCityDisplayName(listing.city)} · {timeAgo(listing.created_at)}
            </p>
            {catalogLabel && (
              <p className="mt-1 truncate text-[10px] text-muted">{catalogLabel}</p>
            )}
          </div>
          {onFavoriteClick && (
            <button
              onClick={handleFavoriteClick}
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-separator bg-secondary ${
                isFavorite ? 'text-red-500' : 'text-secondary'
              }`}
              aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
            {formatPrice(listing.price)}
          </span>
          <ConditionBadge condition={listing.condition} />
        </div>
      </div>
    </article>
  );
};

interface ListingListItemProps {
  listing: ListingShort;
  onClick?: () => void;
  index?: number;
  statusLabel?: string;
}

export const ListingListItem: React.FC<ListingListItemProps> = ({
  listing,
  onClick,
  index = 0,
  statusLabel = 'Активно',
}) => {
  const primaryImage = listing.cover_photo?.url || fallbackImage;

  return (
    <article
      className="flex cursor-pointer items-center gap-2.5 border-b border-separator py-3 last:border-b-0 active:bg-secondary"
      style={{ animationDelay: `${index * 0.03}s` }}
      onClick={onClick}
    >
      <img src={primaryImage} alt={listing.title} className="h-[52px] w-[52px] flex-shrink-0 rounded-md bg-secondary object-cover" loading="lazy" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[13px] font-medium">{listing.title}</h3>
        <p className="mt-1 truncate text-[10px] text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
          {listing.category?.name || 'Музыкальное оборудование'}
        </p>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span className="text-[13px] font-semibold text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(listing.price)}</span>
        <span className="rounded border border-[#fdba74] bg-accent-soft px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em] text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
          {statusLabel}
        </span>
      </div>
    </article>
  );
};
