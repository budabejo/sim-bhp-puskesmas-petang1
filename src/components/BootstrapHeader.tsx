import React from 'react';
import { LogoBadung } from './logos/LogoBadung';
import { LogoPuskesmas } from './logos/LogoPuskesmas';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';

interface Props {
  className?: string;
  showBadges?: boolean;
}

export const BootstrapHeader: React.FC<Props> = ({ className = '', showBadges = true }) => {
  return (
    <header className={`bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {/* Top accent bar (Tri-Datu / Badung Green accent) */}
      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-emerald-600 to-amber-500"></div>

      <div className="px-5 py-4 sm:px-7 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand with Both Logos & Requested Exact Text */}
        <div className="flex items-center gap-3.5 sm:gap-4.5 text-center md:text-left">
          
          {/* Logo Pemda Badung */}
          <div className="shrink-0 p-1 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs hover:scale-105 transition-transform">
            <LogoBadung className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
          </div>

          {/* Logo Puskesmas Kemenkes */}
          <div className="shrink-0 p-1 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs hover:scale-105 transition-transform">
            <LogoPuskesmas className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
          </div>

          {/* Title & Subtitle - Exact user wording with NO BLUD */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                SIM-BHP
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                Pemerintah Kabupaten Badung
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1 leading-snug">
              Sistem Informasi Persediaan Barang Habis Pakai ( BHP ) UPTD Puskesmas Petang I
            </p>
            
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Dinas Kesehatan Kabupaten Badung • Kecamatan Petang, Bali</span>
            </p>
          </div>
        </div>

        {/* Right side government badges / info */}
        {showBadges && (
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden lg:flex flex-col text-right leading-tight pr-3 border-r border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Instansi Resmi</span>
              <span className="text-xs font-black text-slate-800">Dinas Kesehatan Kab. Badung</span>
              <span className="text-[10px] font-medium text-emerald-700">Wilayah Kerja Kec. Petang</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sistem Terverifikasi</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
