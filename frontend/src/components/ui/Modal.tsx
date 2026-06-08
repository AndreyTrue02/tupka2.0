import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { hideBackButton, setBackButton } from '../../lib/telegram';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  fullScreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, fullScreen = false }) => {
  useEffect(() => {
    if (isOpen && !fullScreen) {
      setBackButton(onClose);
      return () => hideBackButton();
    }
  }, [isOpen, onClose, fullScreen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={fullScreen ? undefined : onClose}
      />
      <div
        className={`absolute inset-0 bg-section animate-slideUp ${
          fullScreen ? '' : 'inset-x-0 bottom-0 top-auto rounded-t-3xl'
        }`}
        style={{
          paddingBottom: fullScreen ? 'var(--safe-area-inset-bottom)' : undefined,
          paddingTop: fullScreen ? 'var(--safe-area-inset-top)' : undefined,
        }}
      >
        {!fullScreen && (
          <div className="flex items-center justify-between p-4 border-b border-separator">
            <div className="w-10" />
            <div className="w-12 h-1 rounded-full bg-secondary" />
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {title && !fullScreen && (
          <h2 className="text-lg font-semibold px-4 pt-2 pb-4">{title}</h2>
        )}
        <div className={`${fullScreen ? '' : 'max-h-[80vh]'} overflow-y-auto scrollbar-hide`}>
          {children}
        </div>
      </div>
    </div>
  );
};

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      setBackButton(onClose);
      return () => hideBackButton();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="absolute inset-0 bg-black/40 animate-fadeIn" onClick={onClose} />
      <div
        className="relative bg-section rounded-t-3xl animate-slideUp"
        style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-center py-3">
          <div className="w-12 h-1 rounded-full bg-secondary" />
        </div>
        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};
