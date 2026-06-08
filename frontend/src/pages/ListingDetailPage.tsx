import React, { useEffect, useState } from 'react';
import { ExternalLink, Heart, Star } from 'lucide-react';
import { Header } from '../components/layout';
import { ConditionBadge, ImageGallery, Skeleton } from '../components/ui';
import { useListing, useToggleFavorite } from '../hooks';
import { hapticNotification, hapticSelection } from '../lib/telegram';
import { getCatalogLabel, getCategoryDisplayName, getCityDisplayName } from '../lib/catalog';

interface ListingDetailPageProps {
  listingId: number | null;
  onBack: () => void;
}

const fallbackImage = 'https://images.pexels.com/photos/164829/pexels-photo-164829.jpeg?w=900';
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

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ listingId, onBack }) => {
  const { listing, loading, error, setListing } = useListing(listingId);
  const { addFavorite, removeFavorite, loading: favoriteLoading } = useToggleFavorite();
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(Boolean(listing?.is_favorite));
  }, [listing?.is_favorite]);

  const handleFavoriteToggle = async () => {
    if (!listing || favoriteLoading) return;
    hapticSelection();
    const nextFavorite = !favorite;
    setFavorite(nextFavorite);
    setListing((current) => current ? { ...current, is_favorite: nextFavorite } : current);
    try {
      if (nextFavorite) await addFavorite(listing.id);
      else await removeFavorite(listing.id);
    } catch {
      setFavorite(!nextFavorite);
      setListing((current) => current ? { ...current, is_favorite: !nextFavorite } : current);
      hapticNotification('error');
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-app">
        <Header showBack onBack={onBack} title="Объявление" />
        <div className="mx-auto max-w-[760px] bg-white">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 p-5"><Skeleton className="h-7 w-2/3" /><Skeleton className="h-20 w-full" /></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex h-full flex-col bg-app">
        <Header showBack onBack={onBack} title="Объявление" />
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <div><h2 className="mb-2 text-xl font-semibold">Объявление не найдено</h2><p className="text-sm text-secondary">{error}</p></div>
        </div>
      </div>
    );
  }

  const images = listing.photos.length
    ? listing.photos.map((photo) => ({ url: photo.url }))
    : [{ url: listing.cover_photo?.url || fallbackImage }];
  const sellerName = listing.seller.first_name || listing.seller.username || 'Продавец';
  const telegramUrl = listing.seller.username ? `https://t.me/${listing.seller.username}` : null;
  const catalogLabel = getCatalogLabel(listing);
  const brandName = listing.equipment_model?.brand?.name || listing.brand?.name || 'Не указан';
  const modelName = listing.equipment_model?.name || listing.model_name || 'Не указана';

  return (
    <div className="flex h-full flex-col bg-app">
      <Header showBack onBack={onBack} title={getCategoryDisplayName(listing.category.name)} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <main className="mx-auto min-h-full w-full max-w-[760px] border-x border-separator bg-white">
          <ImageGallery images={images} />

          <div className="p-5 pb-8">
            <p className="section-label mb-1.5">{catalogLabel || getCategoryDisplayName(listing.category.name)}</p>
            <h1 className="text-xl font-semibold tracking-[-0.02em]">{listing.title}</h1>
            <p className="mt-1 text-[13px] text-secondary">{brandName} · {modelName}</p>

            <div className="my-5 flex items-center justify-between gap-3 border-b border-separator pb-5">
              <div>
                <div className="text-[26px] font-semibold text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(listing.price)}</div>
                <p className="mt-1 text-[10px] text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{getCityDisplayName(listing.city)} · {timeAgo(listing.created_at)}</p>
              </div>
              <ConditionBadge condition={listing.condition} size="md" />
            </div>

            <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-lg border border-separator">
              {[
                ['Город', getCityDisplayName(listing.city)],
                ['Добавлено', timeAgo(listing.created_at)],
                ['Бренд', brandName],
                ['Модель', modelName],
              ].map(([label, value], index) => (
                <div key={label} className={`bg-white p-3.5 ${index % 2 === 0 ? 'border-r border-separator' : ''} ${index < 2 ? 'border-b border-separator' : ''}`}>
                  <span className="section-label mb-1.5 block">{label}</span>
                  <span className="line-clamp-1 text-[13px] font-medium">{value}</span>
                </div>
              ))}
            </div>

            <section className="mb-5">
              <h2 className="section-label mb-2.5">Описание</h2>
              <p className="whitespace-pre-wrap text-[13px] leading-6 text-secondary">{listing.description || 'Описание не добавлено.'}</p>
            </section>

            {listing.tags.length > 0 && (
              <section className="mb-5">
                <h2 className="section-label mb-2.5">Теги</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => <span key={tag.id} className="filter-chip cursor-default">#{tag.name}</span>)}
                </div>
              </section>
            )}

            <section className="flex items-center gap-3 rounded-lg border border-separator bg-white p-3.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-[12px] font-semibold text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
                {sellerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[13px] font-medium">{sellerName}</h2>
                <p className="mt-1 text-[10px] text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                  @{listing.seller.username || 'пользователь'} · {listing.seller.deals_count} сделок
                </p>
              </div>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
                <Star className="h-3 w-3 fill-current" />{listing.seller.rating.toFixed(1)}
              </span>
            </section>
          </div>
        </main>
      </div>

      <div className="border-t border-separator bg-white/95 px-4 py-3 backdrop-blur-xl" style={{ paddingBottom: 'calc(var(--safe-area-inset-bottom) + 12px)' }}>
        <div className="mx-auto flex max-w-[760px] gap-2.5">
          {telegramUrl ? (
            <a href={telegramUrl} target="_blank" rel="noreferrer" className="btn-primary flex flex-1 items-center justify-center gap-2">
              <ExternalLink className="h-4 w-4" />Написать продавцу
            </a>
          ) : (
            <button className="btn-primary flex-1 opacity-50" disabled>Нет Telegram username</button>
          )}
          <button onClick={handleFavoriteToggle} className="icon-button h-[46px] w-[46px]" aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}>
            <Heart className={`h-[18px] w-[18px] ${favorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
