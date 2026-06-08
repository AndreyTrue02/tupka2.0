import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../layout';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'var(--app-bg)' }}
    >
      <div className="mt-8 animate-fadeInUp text-center" style={{ animationDelay: '0.25s' }}>
        <div className="scale-150"><BrandLogo /></div>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-secondary">
          Барахолка для музыкантов
        </p>
      </div>

      <div className="absolute bottom-16 flex gap-1.5 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: '0.15s' }} />
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
};
