import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 safe-area-top ${transparent ? '' : 'border-b border-separator bg-white/95 backdrop-blur-xl'}`}
    >
      <div
        className="content-wrap flex h-[52px] items-center justify-between px-4 sm:px-5"
      >
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="-ml-2 flex h-9 w-9 items-center justify-center text-secondary active:text-primary"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            {title && (
              <h1 className="text-[11px] font-medium uppercase leading-tight tracking-[0.1em] text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>{title}</h1>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[10px] text-muted">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
};

interface HeaderActionProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const HeaderAction: React.FC<HeaderActionProps> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="icon-button -mr-1 h-9 w-9"
  >
    {children}
  </button>
);

export const HeaderMenu: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <HeaderAction onClick={onClick}>
    <MoreVertical className="w-5 h-5" />
  </HeaderAction>
);
