import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const LogoBadung: React.FC<LogoProps> = ({ className = 'w-12 h-12', size }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <svg 
        viewBox="0 0 260 270" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={size ? { width: size, height: size } : undefined}
      >
        <title>Lambang Kabupaten Badung - Çūra Dharma Rakşaka</title>
        <polygon 
          points="130,10 250,96 205,255 55,255 10,96" 
          fill="#0052FF" 
          stroke="#111111" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />
        <polygon points="130,50 115,70 145,70" fill="#fff" />
        <polygon points="130,82 105,106 155,106" fill="#fff" />
        <polygon points="130,118 95,142 165,142" fill="#fff" />
        <rect x="90" y="195" width="80" height="15" fill="#f8fafc" />
        <text 
          x="130" 
          y="254" 
          textAnchor="middle" 
          fill="#DC2626" 
          fontSize="9" 
          fontWeight="bold"
        >
          ÇŪRA DHARMA RAKŞAKA
        </text>
      </svg>
    );
  }

  return (
    <img 
      src={`${import.meta.env.BASE_URL}assets/logo-badung.png`} 
      alt="Lambang Kabupaten Badung" 
      className={`${className} object-contain`}
      style={size ? { width: size, height: size } : undefined}
      onError={() => setHasError(true)}
      loading="eager"
    />
  );
};
