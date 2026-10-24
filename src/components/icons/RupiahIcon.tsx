import React from 'react';

interface RupiahIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Ikon Lambang Mata Uang Rupiah (Rp) Resmi Indonesia
 * Didesain presisi dalam format koin/emblem lingkaran standar Lucide/Heroicons
 */
export const RupiahIcon: React.FC<RupiahIconProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Lingkaran Koin Luar */}
      <circle cx="12" cy="12" r="9.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Teks Lambang Rp */}
      <text 
        x="12" 
        y="15.4" 
        textAnchor="middle" 
        fill="currentColor" 
        stroke="none" 
        fontSize="8.8" 
        fontWeight="900" 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="-0.4px"
      >
        Rp
      </text>
    </svg>
  );
};
