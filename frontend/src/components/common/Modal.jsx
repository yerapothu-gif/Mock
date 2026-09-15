import { useEffect } from 'react';
import { X } from 'lucide-react';

// `size` ('md' | 'lg') picks one of two preset widths for VLE-side callers;
// `maxWidth` (an explicit px string) lets Volunteer-side callers dial in a
// precise width per modal. `maxWidth`, when given, wins.
export function Modal({ isOpen, onClose, title, children, footer, size = 'md', maxWidth, className = '' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedMaxWidth = maxWidth || (size === 'lg' ? 720 : 580);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className={`modal-content ${className}`} style={{ maxWidth: resolvedMaxWidth }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
