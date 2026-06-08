import React from 'react';
import { LayoutGrid, Search, Settings2, UserRound } from 'lucide-react';

interface TabItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface TabBarProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onChange }) => {
  const tabs: TabItem[] = [
    { id: 'feed', icon: <LayoutGrid className="h-[19px] w-[19px]" />, label: 'Лента' },
    { id: 'search', icon: <Search className="h-[19px] w-[19px]" />, label: 'Поиск' },
    { id: 'create', icon: <Settings2 className="h-[19px] w-[19px]" />, label: 'Продать' },
    { id: 'profile', icon: <UserRound className="h-[19px] w-[19px]" />, label: 'Профиль' },
  ];

  return (
    <nav className="tab-bar safe-area-bottom">
      <div className="content-wrap flex h-[64px] items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 active:scale-95"
              aria-label={tab.id === 'create' ? 'Создать объявление' : tab.label}
            >
              <div className={active ? 'text-accent' : 'text-secondary'}>{tab.icon}</div>
              <span
                className={`text-[9px] font-medium tracking-[0.04em] ${
                  active ? 'text-accent' : 'text-secondary'
                }`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
