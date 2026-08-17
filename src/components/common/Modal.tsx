import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, id = 'modal' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      id={`${id}-overlay`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
    >
      <div
        ref={modalRef}
        id={id}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl transition-all border"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text-primary)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--theme-border)]">
          <h2 id={`${id}-title`} className="text-xl font-bold tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar janela modal"
            className="p-2 rounded-lg hover:bg-black/5 focus:outline-none transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4">{children}</div>
      </div>
    </div>
  );
};
