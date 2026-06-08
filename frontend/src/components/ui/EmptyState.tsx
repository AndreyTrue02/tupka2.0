import React from 'react';
import { Heart, MessageSquare, Music, Package, Search, ShoppingCart } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-secondary">
      {icon || <Package className="h-8 w-8 text-secondary" />}
    </div>
    <h3 className="mb-2 text-lg font-bold">{title}</h3>
    {description && <p className="mb-6 max-w-sm text-sm text-secondary">{description}</p>}
    {action}
  </div>
);

export const EmptyListings: React.FC<{ onCreateNew?: () => void }> = ({ onCreateNew }) => (
  <EmptyState
    icon={<Music className="h-8 w-8 text-blue-600" />}
    title="Объявлений пока нет"
    description="Опубликуйте первое музыкальное оборудование."
    action={
      onCreateNew && (
        <button onClick={onCreateNew} className="btn-primary">
          Создать объявление
        </button>
      )
    }
  />
);

export const EmptySearch: React.FC<{ query: string }> = ({ query }) => (
  <EmptyState
    icon={<Search className="h-8 w-8 text-blue-600" />}
    title="Ничего не найдено"
    description={`По запросу «${query}» нет объявлений. Попробуйте изменить фильтры.`}
  />
);

export const EmptyChats: React.FC = () => (
  <EmptyState
    icon={<MessageSquare className="h-8 w-8 text-blue-600" />}
    title="No messages yet"
    description="Community discussions will appear here."
  />
);

export const EmptyFavorites: React.FC = () => (
  <EmptyState
    icon={<Heart className="h-8 w-8 text-blue-600" />}
    title="В избранном пусто"
    description="Сохраняйте объявления кнопкой с сердцем."
  />
);

export const EmptyProfileListings: React.FC = () => (
  <EmptyState
    icon={<ShoppingCart className="h-8 w-8 text-blue-600" />}
    title="Объявлений пока нет"
    description="Создайте объявление, чтобы начать продавать оборудование."
  />
);

export const EmptyCart: React.FC = () => (
  <EmptyState
    icon={<ShoppingCart className="h-8 w-8 text-blue-600" />}
    title="Your cart is empty"
    description="Payments are outside the MVP for now."
  />
);

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center px-8 py-16">
    <div className="mb-4 h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
    <p className="text-sm text-secondary">{message}</p>
  </div>
);
