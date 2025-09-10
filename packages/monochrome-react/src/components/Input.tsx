import React, { forwardRef, useEffect, useRef, ChangeEvent, FocusEvent } from 'react';
import { Input as CoreInput, InputConfig } from '@monochrome-edge/core';

export interface InputProps extends Omit<InputConfig, 'onChange' | 'onBlur' | 'onFocus'> {
  onChange?: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, onBlur, onFocus, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const coreInputRef = useRef<CoreInput | null>(null);

    useEffect(() => {
      if (!inputRef.current) return;

      // Create core input instance
      coreInputRef.current = new CoreInput(inputRef.current, {
        ...props,
        onChange: (value: string) => {
          if (onChange) {
            onChange(value);
          }
        },
        onBlur: onBlur as any,
        onFocus: onFocus as any
      });

      return () => {
        // Cleanup
        coreInputRef.current?.destroy();
      };
    }, []);

    // Update props
    useEffect(() => {
      if (coreInputRef.current) {
        coreInputRef.current.update(props);
      }
    }, [props]);

    // Handle ref
    useEffect(() => {
      if (ref && inputRef.current) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value, e);
      }
    };

    return (
      <input
        ref={inputRef}
        type={props.type}
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        readOnly={props.readOnly}
        required={props.required}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    );
  }
);

Input.displayName = 'Input';
