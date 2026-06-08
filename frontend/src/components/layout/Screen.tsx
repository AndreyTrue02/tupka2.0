interface ScreenProps {
  children: React.ReactNode;
  withTabBar?: boolean;
  className?: string;
}

export const Screen: React.FC<ScreenProps> = ({ children, withTabBar = false, className = '' }) => {
  return (
    <div
      className={`h-full overflow-y-auto bg-app scrollbar-hide ${
        withTabBar ? 'pb-20' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
