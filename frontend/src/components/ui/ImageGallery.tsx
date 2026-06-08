import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: { url: string }[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    scrollLeft.current = currentIndex;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const x = e.touches[0].clientX;
    const walk = (startX.current - x) / window.innerWidth;

    if (Math.abs(walk) > 0.1) {
      const newIndex = Math.max(0, Math.min(images.length - 1, Math.round(scrollLeft.current + walk)));
      setCurrentIndex(newIndex);
      isDragging.current = false;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = currentIndex;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const x = e.clientX;
    const walk = (startX.current - x) / window.innerWidth;

    if (Math.abs(walk) > 0.1) {
      const newIndex = Math.max(0, Math.min(images.length - 1, Math.round(scrollLeft.current + walk)));
      setCurrentIndex(newIndex);
      isDragging.current = false;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[16/10] max-h-[380px] w-full items-center justify-center bg-secondary">
        <div className="text-center">
          <img
            src="https://images.pexels.com/photos/164829/pexels-photo-164829.jpeg?w=600"
            alt="No image"
            className="h-full w-full object-contain opacity-50"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-secondary">
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ touchAction: 'pan-y pinch-zoom' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="relative w-full flex-shrink-0">
              <div className="flex aspect-[16/10] max-h-[380px] w-full items-center justify-center overflow-hidden bg-secondary">
                <img
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 rounded border border-white/80 bg-white/90 px-2 py-1 backdrop-blur-sm">
          <span className="text-[9px] font-medium text-gray-700" style={{ fontFamily: 'var(--font-mono)' }}>
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border border-white/80 bg-white/90 active:scale-95 sm:flex"
              onClick={() => setCurrentIndex(prev => prev - 1)}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border border-white/80 bg-white/90 active:scale-95 sm:flex"
              onClick={() => setCurrentIndex(prev => prev + 1)}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          )}

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`rounded-full transition-all ${
                  index === currentIndex
                    ? 'h-1.5 w-4 bg-[var(--accent)]'
                    : 'h-1.5 w-1.5 bg-white/70'
                }`}
                aria-label={`Show image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface ThumbnailGalleryProps {
  images: { url: string }[];
  currentIndex: number;
  onSelect: (index: number) => void;
  size?: 'sm' | 'md';
}

export const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
  images,
  currentIndex,
  onSelect,
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'w-16 h-16' : 'w-20 h-20';

  if (!images || images.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`${sizeClasses} rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
            index === currentIndex
              ? 'ring-2 ring-blue-500 ring-offset-2'
              : 'opacity-60 hover:opacity-80'
          }`}
        >
          <img
            src={image.url}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};
