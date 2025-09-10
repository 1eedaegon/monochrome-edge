import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Modal as CoreModal, ModalConfig } from '@monochrome-edge/core';

export interface ModalProps extends Omit<ModalConfig, 'content' | 'footer'> {
  children?: ReactNode;
  footer?: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export function Modal({
  children,
  footer,
  isOpen = false,
  onClose,
  onOpen,
  ...props
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<CoreModal | null>(null);

  useEffect(() => {
    // Create container
    containerRef.current = document.createElement('div');
    containerRef.current.className = 'modal';
    document.body.appendChild(containerRef.current);

    // Create modal instance
    modalRef.current = new CoreModal(containerRef.current, {
      ...props,
      onClose,
      onOpen
    });

    return () => {
      // Cleanup
      modalRef.current?.destroy();
      containerRef.current?.remove();
    };
  }, []);

  // Handle open/close
  useEffect(() => {
    if (modalRef.current) {
      if (isOpen) {
        modalRef.current.open();
      } else {
        modalRef.current.close();
      }
    }
  }, [isOpen]);

  // Update content
  useEffect(() => {
    if (modalRef.current && children) {
      const contentDiv = document.createElement('div');
      modalRef.current.setContent(contentDiv);
    }
  }, [children]);

  // Update footer
  useEffect(() => {
    if (modalRef.current && footer) {
      const footerDiv = document.createElement('div');
      modalRef.current.setFooter(footerDiv);
    }
  }, [footer]);

  if (!containerRef.current || !isOpen) {
    return null;
  }

  // Portal render content and footer
  return createPortal(
    <>
      {children && (
        <div className="modal-content-react" style={{ display: 'none' }}>
          {children}
        </div>
      )}
      {footer && (
        <div className="modal-footer-react" style={{ display: 'none' }}>
          {footer}
        </div>
      )}
    </>,
    containerRef.current
  );
}

// Hook for programmatic modal control
export function useModal(config?: Partial<ModalConfig>) {
  const modalRef = useRef<CoreModal | null>(null);

  const open = (content?: ReactNode) => {
    if (!modalRef.current) {
      modalRef.current = CoreModal.create(config);
    }

    if (content) {
      const contentDiv = document.createElement('div');
      // Would need ReactDOM.render or createRoot here for content
      modalRef.current.setContent(contentDiv);
    }

    modalRef.current.open();
  };

  const close = () => {
    modalRef.current?.close();
  };

  const destroy = () => {
    modalRef.current?.destroy();
    modalRef.current = null;
  };

  useEffect(() => {
    return () => {
      destroy();
    };
  }, []);

  return { open, close, destroy };
}
