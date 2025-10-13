import React, { memo } from 'react';
import type { ButtonHTMLAttributes, ReactNode, FC } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button: FC<ButtonProps> = memo(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-md';

  const variants = {
    primary:
      'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus-visible:ring-primary-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200',
    secondary:
      'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 focus-visible:ring-secondary-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200',
    outline:
      'border-2 border-primary-500 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-500 text-primary-600 hover:text-primary-700 transition-all duration-200',
    danger:
      'bg-gradient-to-r from-error-500 to-warning-500 text-white hover:from-error-600 hover:to-warning-600 focus-visible:ring-error-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6',
    lg: 'h-14 px-8 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
