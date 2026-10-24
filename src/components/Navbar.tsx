import React, { useState } from 'react';
import { 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard, 
  FileText, 
  Scan, 
  Bell, 
  Database, 
  LayoutDashboard, 
  Shield, 
  UserCheck, 
  ChevronDown,
  Menu,
  X,
  Building2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface Props {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  criticalStockCount: number;
  onOpenScanModal: () => void;
  onOpenWhatsAppModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  setCurrentView,
  currentUser,
  setCurrentUser,
  allUsers,
  criticalStockCount,
  onOpenScanModal,
  onOpenWhatsAppModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Check roles
  const isAdmin = currentUser.role === 'admin';
  const isPetugas = currentUser.role === 'petugas';
  const isKapusk = currentUser.role === 'kapusk';

  const handleNavClick = (viewId: string) => {
    // Permission guard
    if (isPetugas && (viewId === 'laporan' || viewId === 'pengaturan')) {
      alert('Akses Dibatasi: Petugas Logistik tidak diizinkan membuka menu Laporan Resmi dan Pengaturan Sistem. Akses ini hanya untuk KAPUSK / KTU dan Admin.');
      return;
    }
    if (isKapusk && (viewId === 'barang' || viewId === 'penerimaan' || viewId === 'pengeluaran')) {
      alert('Akses Dibatasi: Kepala Puskesmas / KTU bertindak sebagai Verifikator dan Pengawas Laporan. Menu penginputan barang dikhususkan untuk Petugas Logistik dan Admin.');
      return;
    }
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl border-b border-emerald-800/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => handleNavClick(isKapusk ? 'laporan' : 'dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none py-1"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-emerald-950/90 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center">
                  SIM-BHP
                  <span className="ml-1 text-xs uppercase px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 font-semibold border border-emerald-500/30">
                    BLUD
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium tracking-wide">
                UPTD Puskesmas Persediaan Barang Habis Pakai
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {/* Dashboard: Admin & Petugas can view */}
            {!isKapusk && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-800 text-white shadow-md border border-emerald-600/60'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Dashboard</span>
              </button>
            )}

            {/* Master Data Barang (Admin & Petugas) */}
            {!isKapusk && (
              <button
                onClick={() => handleNavClick('barang')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentView === 'barang'
                    ? 'bg-emerald-800 text-white shadow-md border border-emerald-600/60'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Data Barang</span>
              </button>
            )}

            {/* Penerimaan Barang (Admin & Petugas) */}
            {!isKapusk && (
              <button
                onClick={() => handleNavClick('penerimaan')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentView === 'penerimaan'
                    ? 'bg-emerald-800 text-white shadow-md border border-emerald-600/60'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-teal-400" />
                <span>Penerimaan</span>
              </button>
            )}

            {/* Pengeluaran Barang (Admin & Petugas) */}
            {!isKapusk && (
              <button
                onClick={() => handleNavClick('pengeluaran')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentView === 'pengeluaran'
                    ? 'bg-emerald-800 text-white shadow-md border border-emerald-600/60'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>Pengeluaran</span>
              </button>
            )}

            {/* Kartu Stok (All roles can view mutasi kartu stok) */}
            <button
              onClick={() => handleNavClick('kartustok')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'kartustok'
                  ? 'bg-emerald-800 text-white shadow-md border border-emerald-600/60'
                  : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Kartu Stok</span>
            </button>

            {/* Laporan BHP (Admin & KAPUSK/KTU; Petugas is restricted) */}
            {(isAdmin || isKapusk) && (
              <button
                onClick={() => handleNavClick('laporan')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentView === 'laporan'
                    ? 'bg-emerald-700 text-white shadow-md border border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>Laporan BHP</span>
                {isKapusk && (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded ml-1">
                    KAPUSK
                  </span>
                )}
              </button>
            )}

            {/* XAMPP / Laravel / Niagahoster Export (Admin only) */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('niagahoster')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'niagahoster'
                    ? 'bg-emerald-800 text-white shadow-md border border-emerald-600/60'
                    : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                }`}
                title="Panduan XAMPP & Niagahoster MySQL"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>XAMPP / SQL</span>
              </button>
            )}
          </nav>

          {/* Action buttons & User Role Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Scan Barcode Button (Petugas & Admin) */}
            {!isKapusk && (
              <button
                onClick={onOpenScanModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold transition-all shadow border border-emerald-500/50 hover:shadow-emerald-500/20 active:scale-95"
                title="Scan Barcode Barang dengan Kamera HP / Laptop"
              >
                <Scan className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span className="hidden sm:inline">Scan Barcode HP</span>
              </button>
            )}

            {/* Notifikasi Stok Minimum WhatsApp Button */}
            <button
              onClick={onOpenWhatsAppModal}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow border ${
                criticalStockCount > 0 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 animate-pulse'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border-emerald-700'
              }`}
              title="Notifikasi WhatsApp Stok Minimum (≤ 5 Pcs)"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="hidden md:inline">Notif WA</span>
              {criticalStockCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold bg-red-600 text-white rounded-full shadow border border-white/60">
                  {criticalStockCount}
                </span>
              )}
            </button>

            {/* Role Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-700/70 hover:border-emerald-500 text-left transition-all"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow ${
                  isAdmin 
                    ? 'bg-emerald-600 text-white' 
                    : isKapusk 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-teal-600 text-white'
                }`}>
                  {currentUser.role.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                    <span>{currentUser.nama.split(',')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-emerald-300" />
                  </div>
                  <div className="text-[10px] text-emerald-300 capitalize font-medium">
                    {currentUser.role === 'admin' 
                      ? 'Administrator' 
                      : currentUser.role === 'petugas' 
                      ? 'Petugas Logistik' 
                      : 'KAPUSK / KTU'}
                  </div>
                </div>
              </button>

              {/* User Dropdown Selector */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Simulasi Hak Akses Pengguna</p>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                      Pilih role di bawah untuk menguji pembatasan hak akses sesuai aturan:
                    </p>
                  </div>

                  <div className="py-1">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u);
                            setUserDropdownOpen(false);
                            // If switching to Kapusk, redirect directly to Laporan
                            if (u.role === 'kapusk') {
                              setCurrentView('laporan');
                            } else if (currentView === 'laporan' && u.role === 'petugas') {
                              setCurrentView('dashboard');
                            }
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                            isSelected ? 'bg-emerald-50/80 font-semibold' : ''
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              {u.nama}
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {u.jabatan}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : u.role === 'kapusk'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
                    <p><strong>Admin:</strong> Akses Penuh ke semua menu.</p>
                    <p><strong>Petugas:</strong> Input Masuk, Keluar, Kartu Stok, Scan Barcode, Notif WA.</p>
                    <p><strong>KAPUSK/KTU:</strong> Melihat Laporan BHP & Kartu Stok saja.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-emerald-950 text-emerald-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-emerald-950 border-t border-emerald-800 px-4 pt-3 pb-6 space-y-2">
          {!isKapusk && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800"
            >
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
              <span>Dashboard Utama</span>
            </button>
          )}

          {!isKapusk && (
            <button
              onClick={() => handleNavClick('barang')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800"
            >
              <Boxes className="w-5 h-5 text-emerald-400" />
              <span>Data Master Barang BHP</span>
            </button>
          )}

          {!isKapusk && (
            <button
              onClick={() => handleNavClick('penerimaan')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800"
            >
              <ArrowDownLeft className="w-5 h-5 text-teal-400" />
              <span>Data Penerimaan Barang (BLUD)</span>
            </button>
          )}

          {!isKapusk && (
            <button
              onClick={() => handleNavClick('pengeluaran')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800"
            >
              <ArrowUpRight className="w-5 h-5 text-amber-400" />
              <span>Data Pengeluaran Barang</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('kartustok')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800"
          >
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Kartu Stok Mutasi Barang</span>
          </button>

          {(isAdmin || isKapusk) && (
            <button
              onClick={() => handleNavClick('laporan')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-800/80 hover:bg-emerald-700"
            >
              <FileText className="w-5 h-5 text-emerald-300" />
              <span>Laporan Rekapitulasi BHP Resmi</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => handleNavClick('niagahoster')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-200 hover:bg-emerald-800"
            >
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Panduan XAMPP & Niagahoster MySQL</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
