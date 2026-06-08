import React, { useState } from 'react';
import { Bell, RefreshCw, Search } from 'lucide-react';
import { BrandLogo } from '../components/layout';
import { CategoryFilter, ListingCard } from '../components/marketplace';
import { EmptyListings, GridSkeleton } from '../components/ui';
import { useCategories, useListings, useToggleFavorite } from '../hooks';

interface FeedPageProps {
  onListingClick: (listingId: number) => void;
  onSearchClick: () => void;
  refreshKey?: number;
}

export const FeedPage: React.FC<FeedPageProps> = ({ onListingClick, onSearchClick, refreshKey = 0 }) => {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const { categories } = useCategories();
  const { listings, loading, error, refetch } = useListings(
    {
      category_id: activeCategory || undefined,
      size: 50,
    },
    refreshKey,
  );
  const { addFavorite, removeFavorite } = useToggleFavorite();

  const handleFavorite = async (listingId: number, isFavorite: boolean) => {
    if (isFavorite) {
      await removeFavorite(listingId);
    } else {
      await addFavorite(listingId);
    }
    refetch();
  };

  const renderCards = (items: typeof listings, startIndex = 0) => (
    <div className="grid grid-cols-1 gap-2 min-[620px]:grid-cols-2 min-[1000px]:grid-cols-3">
      {items.map((listing, index) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          index={startIndex + index}
          isFavorite={listing.is_favorite}
          onFavoriteClick={() => handleFavorite(listing.id, listing.is_favorite)}
          onClick={() => onListingClick(listing.id)}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="section-divider mb-3"><span className="section-label">Свежие</span></div>
          <div className="grid grid-cols-1 gap-2 min-[620px]:grid-cols-2 min-[1000px]:grid-cols-3">
            <GridSkeleton count={6} />
          </div>
        </>
      );
    }

    if (error) {
      return (
        <div className="flex min-h-64 items-center justify-center px-4 text-center">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Не удалось загрузить объявления</h3>
            <p className="mb-4 text-sm text-secondary">{error}</p>
            <button onClick={refetch} className="btn-secondary inline-flex w-auto items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Повторить
            </button>
          </div>
        </div>
      );
    }

    if (listings.length === 0) return <EmptyListings />;

    const fresh = listings.slice(0, Math.min(6, listings.length));
    const recommended = listings.slice(fresh.length);

    return (
      <>
        <div className="section-divider mb-3">
          <span className="section-label">Свежие</span>
        </div>
        {renderCards(fresh)}

        {recommended.length > 0 && (
          <>
            <div className="section-divider mb-3 mt-5">
              <span className="section-label">Рекомендуем</span>
            </div>
            {renderCards(recommended, fresh.length)}
          </>
        )}
      </>
    );
  };

  return (
    <div className="flex h-full flex-col bg-app">
      <div className="border-b border-separator bg-white safe-area-top">
        <div className="content-wrap flex h-[68px] items-center justify-between px-5">
          <BrandLogo />
          <div className="flex gap-2.5">
            <button onClick={onSearchClick} className="icon-button" aria-label="Открыть поиск">
              <Search className="h-[17px] w-[17px]" />
            </button>
            <button className="icon-button" aria-label="Уведомления">
              <Bell className="h-[17px] w-[17px]" />
            </button>
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="content-wrap px-3 pb-22 pt-3 sm:px-5 sm:pt-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
