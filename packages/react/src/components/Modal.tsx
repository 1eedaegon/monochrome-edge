import React, { FC, ReactNode, useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlay?: boolean;
}

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlay = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = () => {
    if (closeOnOverlay) {
      onClose();
    }
  };

  const sizeClass = size === 'small' ? 'modal-small' : size === 'large' ? 'modal-large' : '';

  return (
    <div className={`modal ${isOpen ? 'is-open' : ''}`}>
      <div className="modal-backdrop" onClick={handleBackdropClick} />
      <div className={`modal-content ${sizeClass}`}>
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export const ModalBody: FC<ModalBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`modal-body ${className}`.trim()}>
      {children}
    </div>
  );
};

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export const ModalFooter: FC<ModalFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`modal-footer ${className}`.trim()}>
      {children}
    </div>
  );
};