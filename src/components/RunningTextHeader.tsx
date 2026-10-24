import React, { useEffect, useState } from 'react';
import { Clock, Calendar, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { formatTanggalWaktuLengkap } from '../utils/formatters';

interface Props {
  criticalCount: number;
}

export const RunningTextHeader: React.FC<Props> = ({ criticalCount }) => {
  const [timeText, setTimeText] = useState<string>(formatTanggalWaktuLengkap(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeText(formatTanggalWaktuLengkap(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-emerald-950 text-white text-xs font-medium py-2 px-4 border-b border-emerald-800 shadow-inner flex flex-wrap items-center justify-between gap-3 overflow-hidden">
      {/* Live Date & Time */}
      <div className="flex items-center gap-2 bg-emerald-900/80 px-3 py-1 rounded-md border border-emerald-700/60 shrink-0">
        <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-mono-code font-bold text-emerald-100 tracking-wide">
          {timeText}
        </span>
      </div>

      {/* Marquee / Running Text */}
      <div className="flex-1 overflow-hidden relative min-w-[280px]">
        <div className="inline-flex whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] items-center gap-8">
          <span className="flex items-center gap-1.5 text-emerald-200">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>SISTEM INFORMASI MANAJEMEN PERSEDIAAN BARANG HABIS PAKAI (SIM-BHP) BLUD PUSKESMAS</span>
          </span>
          <span className="text-emerald-500">•</span>
          <span className="flex items-center gap-1.5 text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>STANDAR PENGELOLAAN KEUANGAN BLUD DINAS KESEHATAN RI</span>
          </span>
          <span className="text-emerald-500">•</span>
          {criticalCount > 0 ? (
            <span className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>PERINGATAN: Terdapat {criticalCount} Barang BHP Mencapai Stok Minimum (≤ 5 Pcs). Segera Input Pengadaan BLUD!</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Status Persediaan: Seluruh Stok Barang BHP Dalam Batas Aman</span>
            </span>
          )}
          <span className="text-emerald-500">•</span>
          <span className="text-emerald-300">
            Gunakan Fitur Scan Barcode Kamera Handphone Untuk Pengeluaran Cepat ke Seluruh Poli & Ruangan Pelayanan
          </span>
        </div>
      </div>

      {/* BLUD Status Badge */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] text-emerald-300 shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-semibold tracking-wider uppercase text-emerald-200">Server Online | Niagahoster Ready</span>
      </div>
    </div>
  );
};
