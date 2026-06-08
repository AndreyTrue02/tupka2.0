import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => (
  <div className="brand-logo" aria-label="НОТА MKT">
    <span className={compact ? 'text-sm font-semibold' : 'brand-logo-main'}>НОТА</span>
    <span className="brand-logo-dot" />
    <span className={compact ? 'text-sm font-normal text-secondary' : 'brand-logo-muted'}>MKT</span>
  </div>
);
