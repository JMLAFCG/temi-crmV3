import React from 'react';
import { forwardRef, memo } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = memo(forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const baseStyles =
      'rounded-2xl border bg-white px-4 py-3 text-sm placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-50';
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300';

    return (
      <div className={`${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-neutral-900 mb-1">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${baseStyles} ${widthClass} ${errorClass} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
));

Input.displayName = 'Input';
