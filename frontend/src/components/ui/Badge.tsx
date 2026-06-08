import React from 'react';

interface BadgeProps {
  condition: 'new' | 'like_new' | 'good' | 'fair';
  size?: 'sm' | 'md';
}

const conditionConfig = {
  new: { label: 'Новое', className: 'border-sky-200 bg-sky-50 text-sky-700' },
  like_new: { label: 'Как новое', className: 'border-[#fdba74] bg-accent-soft text-accent' },
  good: { label: 'Хорошее', className: 'border-[#fdba74] bg-accent-soft text-accent' },
  fair: { label: 'Б/у', className: 'border-orange-200 bg-orange-50 text-orange-700' },
};

export const ConditionBadge: React.FC<BadgeProps> = ({ condition, size = 'sm' }) => {
  const config = conditionConfig[condition];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-[8px]' : 'px-2.5 py-1.5 text-[9px]';

  return (
    <span className={`${sizeClasses} inline-flex rounded border font-medium uppercase tracking-[0.08em] ${config.className}`} style={{ fontFamily: 'var(--font-mono)' }}>
      {config.label}
    </span>
  );
};

interface CategoryBadgeProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  label,
  active = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`filter-chip ${active ? 'filter-chip-active' : ''}`}
    >
      {label}
    </button>
  );
};

interface TagBadgeProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ label, removable = false, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
      #{label}
      {removable && (
        <button onClick={onRemove} className="flex h-4 w-4 items-center justify-center">
          x
        </button>
      )}
    </span>
  );
};

interface UnreadBadgeProps {
  count: number;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'active' | 'sold' | 'draft' | 'pending';
}

const statusConfig = {
  active: { label: 'Активно', className: 'bg-accent-soft text-accent' },
  sold: { label: 'Продано', className: 'bg-gray-100 text-gray-700' },
  draft: { label: 'Черновик', className: 'bg-amber-50 text-amber-700' },
  pending: { label: 'Проверка', className: 'bg-blue-50 text-blue-700' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};
