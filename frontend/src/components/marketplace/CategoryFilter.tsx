import React from 'react';
import type { Category, ListingCondition, ListingFilters } from '../../lib/types';
import { CategoryBadge } from '../ui/Badge';
import { flattenCategories, getCategoryDisplayName } from '../../lib/catalog';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: number | null;
  onSelect: (categoryId: number | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelect,
}) => {
  const categoryItems = categories;

  return (
    <div className="border-b border-separator bg-white">
      <div className="content-wrap flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide">
        <CategoryBadge
          label="All"
          active={activeCategory === null}
          onClick={() => onSelect(null)}
        />
        {categoryItems.map((category) => (
          <CategoryBadge
            key={category.id}
            label={getCategoryDisplayName(category.name)}
            active={activeCategory === category.id}
            onClick={() => onSelect(category.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Pick<ListingFilters, 'min_price' | 'max_price' | 'condition' | 'city'>;
  categories?: Category[];
  activeCategory?: number | null;
  conditions: Array<{ value: ListingCondition | ''; label: string }>;
  onApply: (filters: Pick<ListingFilters, 'min_price' | 'max_price' | 'condition' | 'city'>) => void;
  onCategoryChange?: (categoryId: number | null) => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  filters,
  categories = [],
  activeCategory = null,
  conditions,
  onApply,
  onCategoryChange,
}) => {
  const [priceMin, setPriceMin] = React.useState(filters.min_price?.toString() || '');
  const [priceMax, setPriceMax] = React.useState(filters.max_price?.toString() || '');
  const [condition, setCondition] = React.useState<ListingCondition | ''>(filters.condition || '');
  const [city, setCity] = React.useState(filters.city || '');
  const [categoryId, setCategoryId] = React.useState<number | null>(activeCategory);
  const categoryItems = React.useMemo(() => flattenCategories(categories), [categories]);

  React.useEffect(() => {
    setPriceMin(filters.min_price?.toString() || '');
    setPriceMax(filters.max_price?.toString() || '');
    setCondition(filters.condition || '');
    setCity(filters.city || '');
    setCategoryId(activeCategory);
  }, [activeCategory, filters]);

  const handleApply = () => {
    onApply({
      min_price: priceMin ? Number(priceMin) : undefined,
      max_price: priceMax ? Number(priceMax) : undefined,
      condition: condition || undefined,
      city: city.trim() || undefined,
    });
    onCategoryChange?.(categoryId);
    onClose();
  };

  const handleClear = () => {
    setPriceMin('');
    setPriceMax('');
    setCondition('');
    setCity('');
    setCategoryId(null);
    onApply({});
    onCategoryChange?.(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close filters"
      />
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl border border-b-0 border-separator bg-white shadow-2xl"
        style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-[var(--border-strong)]" />
        </div>

        <div className="overflow-y-auto px-4 pb-5 scrollbar-hide sm:px-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <span className="section-label">Search settings</span>
              <h3 className="mt-1 text-xl font-bold tracking-[-0.03em]">Filters</h3>
            </div>
            <button onClick={handleClear} className="text-xs font-semibold text-accent">
              Clear all
            </button>
          </div>

          {categoryItems.length > 0 && (
            <div className="mb-5">
              <label className="section-label mb-2.5 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryId(null)}
                  className={`filter-chip ${categoryId === null ? 'filter-chip-active' : ''}`}
                >
                  All
                </button>
                {categoryItems.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setCategoryId(category.id)}
                    className={`filter-chip ${categoryId === category.id ? 'filter-chip-active' : ''}`}
                  >
                    {category.depth > 0 ? category.path : category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="section-label mb-2.5 block">Price range, RUB</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(event) => setPriceMin(event.target.value)}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(event) => setPriceMax(event.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="section-label mb-2.5 block">City</label>
            <input
              type="text"
              placeholder="Any city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="input-field"
            />
          </div>

          <div className="mb-6">
            <label className="section-label mb-2.5 block">Condition</label>
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
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary w-auto flex-shrink-0">
              Cancel
            </button>
            <button onClick={handleApply} className="btn-primary flex-1">
              Show results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
