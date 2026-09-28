import { Fragment } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-[90vw]',
  };

  const content = (
    <Fragment>
      <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined} aria-describedby={description ? 'modal-description' : undefined}>
        <div className={`modal-content ${sizes[size]} w-full`}>
          {(title || showClose) && (
            <div className="modal-header">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold text-navy-900 dark:text-white">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  );

  return createPortal(content, document.body);
};

export default Modal;