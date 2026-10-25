import React, { useState, useEffect } from 'react';
import { LOGO_BADUNG_BASE64 } from '../../assets/logoData';

interface LogoProps {
  className?: string;
  size?: number;
}

export const LogoBadung: React.FC<LogoProps> = ({ className = 'w-12 h-12', size }) => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('sim_bhp_custom_logo_badung') : null;
    } catch {
      return null;
    }
  });

  const [imgSrc, setImgSrc] = useState<string>(customLogo || LOGO_BADUNG_BASE64);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkCustomLogo = () => {
      try {
        const saved = localStorage.getItem('sim_bhp_custom_logo_badung');
        if (saved && saved !== customLogo) {
          setCustomLogo(saved);
          setImgSrc(saved);
          setHasError(false);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', checkCustomLogo);
    return () => window.removeEventListener('storage', checkCustomLogo);
  }, [customLogo]);

  const handleError = () => {
    if (imgSrc === customLogo) {
      setImgSrc(LOGO_BADUNG_BASE64);
    } else if (imgSrc === LOGO_BADUNG_BASE64) {
      setImgSrc('./assets/logo-badung.png');
    } else if (imgSrc === './assets/logo-badung.png') {
      setImgSrc('/assets/logo-badung.png');
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    // Official vector representation of Lambang Kabupaten Badung - Segi Lima Biru, Meru Tumpang 11, Keris Luk Tiga, Padi & Kapas, Çūra Dharma Rakşaka
    return (
      <svg 
        viewBox="0 0 320 360" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={size ? { width: size, height: size } : undefined}
      >
        <title>Lambang Resmi Pemerintah Kabupaten Badung - Çūra Dharma Rakşaka</title>
        {/* Perisai Segi Lima Biru Laut dengan Lis Emas */}
        <polygon 
          points="160,10 305,108 250,314 70,314 15,108" 
          fill="#004c99" 
          stroke="#D4AF37" 
          strokeWidth="8" 
          strokeLinejoin="round" 
        />
        <polygon 
          points="160,22 290,112 240,300 80,300 30,112" 
          fill="#0055A5" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />
        {/* Meru Tumpang 11 (Tingkat Alam Tertinggi - Suci Putih Lis Hitam) */}
        <g fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.2">
          <polygon points="160,38 149,49 171,49" />
          <polygon points="160,48 143,61 177,61" />
          <polygon points="160,59 137,74 183,74" />
          <polygon points="160,72 131,89 189,89" />
          <polygon points="160,86 125,106 195,106" />
          <polygon points="160,103 119,125 201,125" />
          <polygon points="160,121 113,146 207,146" />
          <polygon points="160,142 107,169 213,169" />
          <polygon points="160,165 101,194 219,194" />
          <polygon points="160,189 95,221 225,221" />
          <polygon points="160,215 89,249 231,249" />
        </g>
        {/* Keris Pusaka Luk Tiga (Hitam Kesatriaan Puputan Badung) */}
        <path 
          d="M160,85 Q168,135 160,170 Q152,205 160,240 L160,265" 
          stroke="#0F172A" 
          strokeWidth="7" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M160,85 Q168,135 160,170 Q152,205 160,240 L160,265" 
          stroke="#94A3B8" 
          strokeWidth="2" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Gagang Keris Kuning Emas */}
        <circle cx="160" cy="270" r="7.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
        {/* Padi Kuning Emas di Kiri */}
        <path d="M72,225 Q98,260 145,263" stroke="#F59E0B" strokeWidth="5.5" fill="none" strokeDasharray="3 2" />
        {/* Kapas Putih Daun Hijau di Kanan */}
        <path d="M248,225 Q222,260 175,263" stroke="#10B981" strokeWidth="5.5" fill="none" strokeDasharray="3 2" />
        {/* Pita Lambang ÇŪRA DHARMA RAKŞAKA */}
        <path 
          d="M 45,318 Q 160,334 275,318 L 270,348 Q 160,358 50,348 Z" 
          fill="#DC2626" 
          stroke="#FFFFFF" 
          strokeWidth="2" 
        />
        <text 
          x="160" 
          y="341" 
          textAnchor="middle" 
          fill="#FFFFFF" 
          fontSize="9.5" 
          fontWeight="900"
          letterSpacing="0.8"
        >
          ÇŪRA DHARMA RAKŞAKA
        </text>
      </svg>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt="Lambang Resmi Pemerintah Kabupaten Badung" 
      className={`${className} object-contain`}
      style={size ? { width: size, height: size } : undefined}
      onError={handleError}
      loading="eager"
    />
  );
};
