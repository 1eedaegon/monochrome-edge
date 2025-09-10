import React, { FC, HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'bordered';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: ReactNode;
}

export const Card: FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  children,
  className = '',
  ...props
}) => {
  const variantClass = variant === 'highlight' ? 'card-highlight' : variant === 'bordered' ? 'card-bordered' : '';
  const paddingClass = padding === 'none' ? 'p-0' : padding === 'small' ? 'p-2' : padding === 'large' ? 'p-6' : '';
  const classes = `card ${variantClass} ${paddingClass} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader: FC<CardHeaderProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardBody: FC<CardBodyProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter: FC<CardFooterProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};