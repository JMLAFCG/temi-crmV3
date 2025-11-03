import type { FC } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

export const Logo: FC<LogoProps> = ({ size = 'md', variant = 'full', className = '' }) => {
  const sizes = {
    sm: { height: 35 },
    md: { height: 60 },
    lg: { height: 110 },
    xl: { height: 161 },
    '2xl': { height: 180 },
  };

  const currentSize = sizes[size];

  const LogoImage = () => (
    <img
      src="/TEMILOGOJML_Plan de travail 1.png"
      alt="TEMI-Construction"
      style={{ height: `${currentSize.height}px` }}
      className="object-contain"
    />
  );

  const TextLogo = () => (
    <div className="flex items-center space-x-2">
      <span className="font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
        TEMI
      </span>
      <span className="text-white">-</span>
      <span className="font-semibold text-secondary-700">
        <span className="font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Construction
        </span>
      </span>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={className}>
        <LogoImage />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={className}>
        <TextLogo />
      </div>
    );
  }

  return (
    <div className={className}>
      <LogoImage />
    </div>
  );
};
