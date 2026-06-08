import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-shimmer rounded-lg ${className}`} />
);

export const ListingCardSkeleton: React.FC = () => (
  <div className="card p-3">
    <div className="flex gap-3">
      <Skeleton className="h-[74px] w-[74px] flex-shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="mb-2 flex items-start justify-between gap-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-7 w-7" />
          </div>
          <Skeleton className="h-2.5 w-1/2" />
        </div>
        <div className="flex items-end justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="bg-section rounded-2xl p-6 mb-4">
    <div className="flex items-center gap-4 mb-6">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="flex justify-around">
      <div className="text-center">
        <Skeleton className="h-8 w-12 mx-auto mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="text-center">
        <Skeleton className="h-8 w-12 mx-auto mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="text-center">
        <Skeleton className="h-8 w-12 mx-auto mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="bg-section rounded-xl p-4 mb-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
  </div>
);

export const MessageSkeleton: React.FC = () => (
  <div className="flex gap-2 mb-3">
    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-16 max-w-[70%]" />
    </div>
  </div>
);

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <ListingCardSkeleton key={i} />
    ))}
  </>
);
