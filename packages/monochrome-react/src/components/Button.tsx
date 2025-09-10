import React, { forwardRef, useEffect, useRef, MouseEvent } from 'react';
import { Button as CoreButton, ButtonConfig } from '@monochrome-edge/core';

export interface ButtonProps extends Omit<ButtonConfig, 'onClick'> {
  children?: React.ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick, text, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const coreButtonRef = useRef<CoreButton | null>(null);

    useEffect(() => {
      if (!buttonRef.current) return;

      // Create core button instance
      coreButtonRef.current = new CoreButton(buttonRef.current, {
        ...props,
        text: text || (typeof children === 'string' ? children : undefined),
        onClick: onClick as any
      });

      return () => {
        // Cleanup
        coreButtonRef.current?.destroy();
      };
    }, []);

    // Update props
    useEffect(() => {
      if (coreButtonRef.current) {
        coreButtonRef.current.update(props);
      }
    }, [props]);

    // Handle ref
    useEffect(() => {
      if (ref && buttonRef.current) {
        if (typeof ref === 'function') {
          ref(buttonRef.current);
        } else {
          ref.current = buttonRef.current;
        }
      }
    }, [ref]);

    return (
      <button ref={buttonRef} onClick={onClick}>
        {children || text}
      </button>
    );
  }
);

Button.displayName = 'Button';
