import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Menu, 
  Scan, 
  Bell,
  LogOut,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { formatTanggalWaktuLengkap } from '../utils/formatters';
import { UserProfile } from '../types';
import { LogoBadung } from './logos/LogoBadung';
import { LogoPuskesmas } from './logos/LogoPuskesmas';

interface Props {
  currentUser: UserProfile;
  criticalStockCount: number;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'not_configured' | 'error';
  lastSyncTime?: string;
  onOpenCloudSync: () => void;
  onOpenScanModal: () => void;
  onOpenWhatsAppModal: () => void;
  onToggleMobileSidebar: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<Props> = ({
  currentUser,
  criticalStockCount,
  cloudSyncStatus,
  lastSyncTime,
  onOpenCloudSync,
  onOpenScanModal,
  onOpenWhatsAppModal,
  onToggleMobileSidebar,
  onLogout
}) => {
  const [timeText, setTimeText] = useState<string>(formatTanggalWaktuLengkap(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeText(formatTanggalWaktuLengkap(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isKapusk = currentUser.role === 'kapusk';

  return (
    <header className="sticky top-0 z-30 bg-white/98 backdrop-blur-md border-b border-slate-200/90 shadow-sm no-print">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700"></div>

      <div className="px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Mobile Toggle & Official Header Branding (UPTD Puskesmas Petang I Selalu Terlihat Jelas) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition-colors shrink-0"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Dual Official Logos (Badung & Puskesmas) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs hover:scale-105 transition-transform">
              <LogoBadung className="w-full h-full object-contain" />
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs hover:scale-105 transition-transform">
              <LogoPuskesmas className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Program Title & Subtitle: DIJAMIN TIDAK KEPOTONG */}
          <div className="min-w-0 flex flex-col justify-center">
            {/* Baris 1: SIM-BHP dan UPTD Puskesmas Petang I berdampingan di awal agar tidak kepotong */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-black text-slate-950 tracking-tight shrink-0">
                SIM-BHP
              </h1>
              <span className="text-slate-300 font-normal hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-lg shadow-2xs whitespace-nowrap">
                UPTD Puskesmas Petang I
              </span>
            </div>

            {/* Baris 2: Deskripsi Sistem Informasi */}
            <p className="text-[11px] sm:text-xs font-semibold text-slate-600 tracking-tight mt-0.5 whitespace-nowrap truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
              Sistem Informasi Persediaan Barang Habis Pakai ( BHP )
            </p>
          </div>
        </div>

        {/* Right Controls: Cloud Sync, Scan HP, Notif WA, Profil Admin + Waktu, & Tombol Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Cloud Sync Status Indicator & Shortcut */}
          <button
            onClick={onOpenCloudSync}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
              cloudSyncStatus === 'syncing'
                ? 'bg-blue-50 border-blue-300 text-blue-700 animate-pulse'
                : cloudSyncStatus === 'synced'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : cloudSyncStatus === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 ring-2 ring-amber-300/60 animate-bounce sm:animate-none'
            }`}
            title={
              cloudSyncStatus === 'synced'
                ? `Terhubung ke Google Spreadsheet (Terakhir sinkron: ${lastSyncTime || 'Baru saja'})`
                : cloudSyncStatus === 'syncing'
                ? 'Sedang menyinkronkan data ke Google Drive Spreadsheet...'
                : cloudSyncStatus === 'error'
                ? 'Gagal menyinkronkan data ke Google Sheets. Klik untuk cek URL Webhook.'
                : 'Google Spreadsheet belum terhubung di HP ini. Klik untuk hubungkan!'
            }
          >
            {cloudSyncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            ) : cloudSyncStatus === 'synced' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : cloudSyncStatus === 'error' ? (
              <CloudOff className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span className="hidden sm:inline text-[11px]">
              {cloudSyncStatus === 'syncing'
                ? 'Menyimpan ke Sheets...'
                : cloudSyncStatus === 'synced'
                ? 'Google Sheets Aktif'
                : cloudSyncStatus === 'error'
                ? 'Sheets Eror'
                : 'Hubungkan Sheets'}
            </span>
            {cloudSyncStatus === 'not_configured' && (
              <span className="sm:hidden text-[10px] font-black text-amber-900 bg-amber-200/80 px-1 rounded">
                Sheets
              </span>
            )}
          </button>

          {/* Scan Shortcut Button */}
          {!isKapusk && (
            <button
              onClick={onOpenScanModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Scan Barcode Kamera HP"
            >
              <Scan className="w-4 h-4 text-emerald-700" />
              <span className="hidden md:inline">Scan Barcode HP</span>
            </button>
          )}

          {/* WA Notification Bell with Counter */}
          <button
            onClick={onOpenWhatsAppModal}
            className={`relative p-2 rounded-xl border transition-all ${
              criticalStockCount > 0
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title="Peringatan WhatsApp Stok Minimum"
          >
            <Bell className="w-4 h-4" />
            {criticalStockCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                {criticalStockCount}
              </span>
            )}
          </button>

          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

          {/* User profile capsule with Hari, Tanggal, Jam tepat di pojok kanan bawah nama admin */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
              {currentUser.role.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="hidden sm:block text-right leading-tight">
              {/* Baris Atas: Nama Admin & Badge Role */}
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs font-black text-slate-900 whitespace-nowrap">
                  {currentUser.nama}
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {currentUser.role}
                </span>
              </div>
              
              {/* Pojok Kanan Bawah Admin: Hari, Tanggal, dan Jam */}
              <div className="text-[10.5px] font-semibold text-slate-600 flex items-center justify-end gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="font-mono-code text-[10.5px] font-bold text-emerald-950">
                  {timeText}
                </span>
              </div>
            </div>

            {/* Tombol Logout Merah Jelas dengan Tulisan Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all border border-red-500 shrink-0 cursor-pointer"
              title="Keluar dari Sistem (Logout)"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[11px] font-bold">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
