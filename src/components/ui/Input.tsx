import React, { useState } from 'react';
import { forwardRef, memo } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export const Input = memo(forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, leftIcon, rightIcon, onRightIconClick, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    const baseStyles =
      'rounded-2xl border bg-white px-4 py-3 text-sm placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-50';
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300';

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const effectiveRightIcon = isPasswordField ? (
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    ) : rightIcon;

    const rightIconClickable = isPasswordField || onRightIconClick;

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
            type={inputType}
            className={`${baseStyles} ${widthClass} ${errorClass} ${leftIcon ? 'pl-10' : ''} ${effectiveRightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {effectiveRightIcon && (
            <div className={`absolute inset-y-0 right-0 pr-3 flex items-center ${rightIconClickable ? '' : 'pointer-events-none'}`}>
              {effectiveRightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
));

Input.displayName = 'Input';
