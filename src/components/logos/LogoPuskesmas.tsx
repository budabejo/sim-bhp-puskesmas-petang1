import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const LogoPuskesmas: React.FC<LogoProps> = ({ className = 'w-12 h-12', size }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <svg 
        viewBox="0 0 500 560" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={size ? { width: size, height: size } : undefined}
      >
        <title>Logo Resmi Puskesmas Kemenkes RI</title>
        <polygon 
          points="250,15 475,145 475,415 250,545 25,415 25,145" 
          stroke="#005A1E" 
          strokeWidth="28" 
          strokeLinejoin="round" 
          fill="none" 
        />
        <g fill="#005A1E">
          <path d="M 185 105 H 315 V 215 H 425 V 345 H 315 V 455 H 185 V 345 H 75 V 215 H 185 Z" />
        </g>
        <circle cx="280" cy="298" r="32" stroke="#FFFFFF" strokeWidth="12" fill="none" />
        <circle cx="320" cy="298" r="32" stroke="#FFFFFF" strokeWidth="12" fill="none" />
      </svg>
    );
  }

  return (
    <img 
      src="/assets/logo-puskesmas.png" 
      alt="Logo Resmi Puskesmas" 
      className={`${className} object-contain`}
      style={size ? { width: size, height: size } : undefined}
      onError={() => setHasError(true)}
      loading="eager"
    />
  );
};
