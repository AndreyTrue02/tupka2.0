import React, { useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { ListingCard } from '../components/marketplace';
import { EmptySearch, GridSkeleton } from '../components/ui';
import { useCategories, useListings } from '../hooks';
import { getCategoryDisplayName } from '../lib/catalog';
import type { ListingCondition } from '../lib/types';

interface SearchPageProps {
  onListingClick: (listingId: number) => void;
}

type SortOption = 'date' | 'price-asc' | 'price-desc';

const conditions: Array<{ value: ListingCondition | ''; label: string }> = [
  { value: '', label: 'Любое' },
  { value: 'new', label: 'Новое' },
  { value: 'like_new', label: 'Как новое' },
  { value: 'good', label: 'Хорошее' },
  { value: 'fair', label: 'Б/у' },
];

const cityOptions = [
  { label: 'Москва', value: 'Moscow' },
  { label: 'Санкт-Петербург', value: 'Saint Petersburg' },
  { label: 'Казань', value: 'Kazan' },
  { label: 'Вся Россия', value: '' },
];

export const SearchPage: React.FC<SearchPageProps> = ({ onListingClick }) => {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [condition, setCondition] = useState<ListingCondition | ''>('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState<SortOption>('date');
  const [showResults, setShowResults] = useState(false);
  const { categories } = useCategories();
  const categoryItems = categories;
  const { listings, loading, error, refetch } = useListings({
    search: search.trim() || undefined,
    category_id: categoryId || undefined,
    condition: condition || undefined,
    min_price: priceMin ? Number(priceMin) : undefined,
    max_price: priceMax ? Number(priceMax) : undefined,
    city: city || undefined,
    size: 50,
  });

  const sortedListings = useMemo(() => {
    const next = [...listings];
    if (sort === 'price-asc') next.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') next.sort((a, b) => b.price - a.price);
    return next;
  }, [listings, sort]);

  const clearFilters = () => {
    setCategoryId(null);
    setCondition('');
    setPriceMin('');
    setPriceMax('');
    setCity('');
    setSort('date');
    setShowResults(false);
  };

  return (
    <div className="flex h-full flex-col bg-app">
      <div className="border-b border-separator bg-white px-4 py-3 safe-area-top">
        <div className="content-wrap">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setShowResults(false)}
              className="input-field h-11 pl-10"
              placeholder="Синтезатор, гитара, педаль..."
              autoFocus={false}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="content-wrap px-4 pb-24 pt-5 sm:px-5">
          {!showResults ? (
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="section-label">Поиск и фильтры</span>
                <button onClick={clearFilters} className="section-label text-accent">Сбросить</button>
              </div>

              <section className="mb-6">
                <h2 className="section-label mb-3">Категория</h2>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setCategoryId(null)} className={`filter-chip ${categoryId === null ? 'filter-chip-active' : ''}`}>Все</button>
                  {categoryItems.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setCategoryId(category.id)}
                      className={`filter-chip ${categoryId === category.id ? 'filter-chip-active' : ''}`}
                    >
                      {getCategoryDisplayName(category.name)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mb-6">
                <h2 className="section-label mb-3">Состояние</h2>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((item) => (
                    <button
                      key={item.value || 'any'}
                      onClick={() => setCondition(item.value)}
                      className={`filter-chip ${condition === item.value ? 'filter-chip-active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mb-6">
                <h2 className="section-label mb-3">Цена</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={priceMin} onChange={(event) => setPriceMin(event.target.value)} className="input-field" placeholder="От, ₽" />
                  <input type="number" value={priceMax} onChange={(event) => setPriceMax(event.target.value)} className="input-field" placeholder="До, ₽" />
                </div>
              </section>

              <section className="mb-6">
                <h2 className="section-label mb-3">Город</h2>
                <div className="mb-3 flex flex-wrap gap-2">
                  {cityOptions.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setCity(item.value)}
                      className={`filter-chip ${city === item.value ? 'filter-chip-active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <input value={city} onChange={(event) => setCity(event.target.value)} className="input-field" placeholder="Другой город" />
              </section>

              <section className="mb-7">
                <h2 className="section-label mb-3">Сортировка</h2>
                <div className="grid grid-cols-3 overflow-hidden rounded-md border border-separator bg-white">
                  {([
                    ['date', 'Дата'],
                    ['price-asc', 'Цена ↑'],
                    ['price-desc', 'Цена ↓'],
                  ] as Array<[SortOption, string]>).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setSort(value)}
                      className={`border-r border-separator px-2 py-2.5 text-[10px] font-medium tracking-[0.04em] last:border-r-0 ${
                        sort === value ? 'bg-accent-soft text-accent' : 'text-secondary'
                      }`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              <div className="sticky bottom-0 -mx-1 bg-app/95 px-1 pb-1 pt-3 backdrop-blur-sm">
                <button onClick={() => setShowResults(true)} className="btn-primary">
                  Показать результаты · {listings.length}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="section-divider mb-4">
                <span className="section-label">Результаты · {sortedListings.length}</span>
              </div>
              <button onClick={() => setShowResults(false)} className="mb-4 text-[10px] font-medium uppercase tracking-[0.1em] text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
                ← Изменить фильтры
              </button>
              {loading ? (
                <div className="grid grid-cols-1 gap-2 min-[620px]:grid-cols-2 min-[1000px]:grid-cols-3"><GridSkeleton count={6} /></div>
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="mb-4 text-sm text-secondary">{error}</p>
                  <button onClick={refetch} className="btn-secondary inline-flex w-auto items-center gap-2">
                    <RefreshCw className="h-4 w-4" />Повторить
                  </button>
                </div>
              ) : sortedListings.length === 0 ? (
                <EmptySearch query={search} />
              ) : (
                <div className="grid grid-cols-1 gap-2 min-[620px]:grid-cols-2 min-[1000px]:grid-cols-3">
                  {sortedListings.map((listing, index) => (
                    <ListingCard key={listing.id} listing={listing} index={index} onClick={() => onListingClick(listing.id)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
