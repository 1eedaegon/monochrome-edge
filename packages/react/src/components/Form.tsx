import React, { 
  FC, 
  InputHTMLAttributes, 
  TextareaHTMLAttributes, 
  SelectHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  ChangeEvent
} from 'react';

export interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export const FormGroup: FC<FormGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {children}
    </div>
  );
};

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: ReactNode;
}

export const Label: FC<LabelProps> = ({ required, children, className = '', ...props }) => {
  return (
    <label className={`label ${className}`.trim()} {...props}>
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

export const Input: FC<InputProps> = ({ 
  error = false, 
  helperText, 
  className = '', 
  ...props 
}) => {
  return (
    <>
      <input 
        className={`input ${error ? 'is-error' : ''} ${className}`.trim()} 
        {...props} 
      />
      {helperText && (
        <span className={`helper-text ${error ? 'error' : ''}`}>
          {helperText}
        </span>
      )}
    </>
  );
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
}

export const Textarea: FC<TextareaProps> = ({ 
  error = false, 
  helperText, 
  className = '', 
  ...props 
}) => {
  return (
    <>
      <textarea 
        className={`textarea ${error ? 'is-error' : ''} ${className}`.trim()} 
        {...props} 
      />
      {helperText && (
        <span className={`helper-text ${error ? 'error' : ''}`}>
          {helperText}
        </span>
      )}
    </>
  );
};

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: FC<SelectProps> = ({ 
  error = false, 
  helperText, 
  options,
  className = '', 
  ...props 
}) => {
  return (
    <>
      <select 
        className={`select ${error ? 'is-error' : ''} ${className}`.trim()} 
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <span className={`helper-text ${error ? 'error' : ''}`}>
          {helperText}
        </span>
      )}
    </>
  );
};

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  return (
    <label className={`checkbox ${className}`.trim()}>
      <input type="checkbox" {...props} />
      <span className="checkbox-mark" />
      {label}
    </label>
  );
};

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio: FC<RadioProps> = ({ label, className = '', ...props }) => {
  return (
    <label className={`radio ${className}`.trim()}>
      <input type="radio" {...props} />
      <span className="radio-mark" />
      {label}
    </label>
  );
};