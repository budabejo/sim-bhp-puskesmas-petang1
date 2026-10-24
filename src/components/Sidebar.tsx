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
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  LogOut,
  Settings
} from 'lucide-react';
import { UserProfile } from '../types';
import { LogoBadung } from './logos/LogoBadung';
import { LogoPuskesmas } from './logos/LogoPuskesmas';

interface Props {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  criticalStockCount: number;
  onOpenScanModal: () => void;
  onOpenWhatsAppModal: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentView,
  setCurrentView,
  currentUser,
  setCurrentUser,
  allUsers,
  criticalStockCount,
  onOpenScanModal,
  onOpenWhatsAppModal,
  isCollapsed,
  setIsCollapsed,
  onLogout
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin';
  const isPetugas = currentUser.role === 'petugas';
  const isKapusk = currentUser.role === 'kapusk';

  const handleNav = (viewId: string) => {
    if (isPetugas && (viewId === 'laporan' || viewId === 'pengaturan')) {
      alert('Akses Dibatasi: Petugas Logistik tidak dapat membuka menu Laporan Resmi & Pengaturan Sistem.');
      return;
    }
    if (isKapusk && (viewId === 'barang' || viewId === 'penerimaan' || viewId === 'pengeluaran' || viewId === 'pengaturan')) {
      alert('Akses Dibatasi: Menu Pengaturan khusus Administrator.');
      return;
    }
    setCurrentView(viewId);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      gradient: 'from-indigo-500 via-purple-500 to-indigo-700 shadow-indigo-500/40',
      hidden: isKapusk,
      badge: null
    },
    {
      id: 'barang',
      label: 'Data Barang',
      icon: Boxes,
      gradient: 'from-rose-500 via-pink-500 to-rose-700 shadow-rose-500/40',
      hidden: isKapusk,
      badge: null
    },
    {
      id: 'penerimaan',
      label: 'Penerimaan',
      icon: ArrowDownLeft,
      gradient: 'from-teal-500 via-cyan-500 to-emerald-700 shadow-teal-500/40',
      hidden: isKapusk,
      badge: null
    },
    {
      id: 'pengeluaran',
      label: 'Pengeluaran',
      icon: ArrowUpRight,
      gradient: 'from-amber-500 via-orange-500 to-yellow-600 shadow-amber-500/40',
      hidden: isKapusk,
      badge: null
    },
    {
      id: 'kartustok',
      label: 'Kartu Stok',
      icon: CreditCard,
      gradient: 'from-blue-500 via-sky-500 to-indigo-700 shadow-blue-500/40',
      hidden: false,
      badge: null
    },
    {
      id: 'laporan',
      label: 'Laporan BHP',
      icon: FileText,
      gradient: 'from-emerald-500 via-green-500 to-teal-700 shadow-emerald-500/40',
      hidden: !isAdmin && !isKapusk,
      badge: isKapusk ? 'KAPUSK' : null
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Settings,
      gradient: 'from-slate-600 via-emerald-800 to-slate-900 shadow-emerald-950/40',
      hidden: !isAdmin,
      badge: 'ADMIN'
    }
  ];

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-40 bg-gradient-to-b from-[#062017] via-[#092c20] to-[#041610] text-slate-200 border-r border-emerald-900/60 transition-all duration-300 flex flex-col justify-between shadow-2xl no-print select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className={`border-b border-emerald-900/50 transition-all ${isCollapsed ? 'py-3 px-2 text-center' : 'p-4'}`}>
          <div 
            onClick={() => handleNav(isKapusk ? 'laporan' : 'dashboard')}
            className="cursor-pointer group flex flex-col items-center text-center"
          >
            {/* Row 1: Logo & SIM-BHP with collapse button */}
            <div className="w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 shrink-0 bg-[#041610] p-1.5 rounded-xl border border-emerald-800/60 shadow-md">
                  <LogoBadung className="w-6 h-6 object-contain" />
                  <LogoPuskesmas className="w-6 h-6 object-contain" />
                </div>
                {!isCollapsed && (
                  <span className="font-black text-lg tracking-tight text-white drop-shadow-sm">
                    SIM-BHP
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(!isCollapsed);
                }}
                className="hidden md:flex p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-800/60 transition-colors"
                title={isCollapsed ? 'Perlebar Sidebar' : 'Kecilkan Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Row 2: Penulisan UPTD Puskesmas Petang I DI BAWAH LOGO agar terbaca utuh dan tidak terpotong */}
            {!isCollapsed && (
              <div className="w-full mt-2 pt-2 border-t border-emerald-900/40 text-left">
                <p className="text-[11px] font-extrabold text-emerald-300 tracking-wide uppercase leading-tight">
                  UPTD Puskesmas Petang I
                </p>
                <p className="text-[9.5px] text-slate-400 leading-tight mt-0.5 font-medium">
                  Dinas Kesehatan Kab. Badung
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List with 3D Digital Icon Badges */}
        <nav className="p-3 space-y-1.5">
          {navItems.filter(item => !item.hidden).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-emerald-800/90 text-white shadow-lg shadow-emerald-950/60 border border-emerald-500/60'
                    : 'text-slate-300 hover:bg-emerald-900/50 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* 3D Digital Gradient Icon Badge */}
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-110 group-active:scale-95 border border-white/20`}>
                  <Icon className="w-4 h-4 stroke-[2.3]" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="tracking-tight text-[13px]">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-700/80 text-emerald-100 border border-emerald-500/40">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section: License budabejo2026 & Clean Logout */}
      <div className="p-3 border-t border-emerald-900/50 bg-[#041610]/95 space-y-2">
        {onLogout && (
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/60 border border-rose-900/40 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Keluar Sistem (Logout)"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            {!isCollapsed && <span>Keluar Sistem</span>}
          </button>
        )}

        {/* License Footer budabejo2026 */}
        <div className={`text-center transition-opacity ${isCollapsed ? 'px-0' : 'px-1'}`}>
          {!isCollapsed ? (
            <div className="py-1 border-t border-emerald-900/40">
              <p className="text-[10px] font-bold text-emerald-400 tracking-wider">
                &copy; Licensi budabejo2026
              </p>
              <p className="text-[9px] text-slate-500 leading-tight">
                SIM-BHP UPTD Puskesmas Petang I
              </p>
            </div>
          ) : (
            <p className="text-[9px] font-extrabold text-emerald-500 py-1" title="Licensi budabejo2026">
              &copy;26
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
