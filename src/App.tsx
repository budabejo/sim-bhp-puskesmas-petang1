import React, { useState, useEffect } from 'react';
import { 
  INITIAL_BARANG, 
  INITIAL_PENERIMAAN, 
  INITIAL_PENGELUARAN, 
  INITIAL_KOP, 
  INITIAL_USERS 
} from './data/initialData';
import { Barang, KopPuskesmas, PenerimaanBarang, PengeluaranBarang, UserProfile } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { MasterBarangView } from './components/MasterBarangView';
import { PenerimaanView } from './components/PenerimaanView';
import { PengeluaranView } from './components/PengeluaranView';
import { KartuStokView } from './components/KartuStokView';
import { LaporanView } from './components/LaporanView';
import { NiagahosterGuideView } from './components/NiagahosterGuideView';
import { ScanBarcodeModal } from './components/ScanBarcodeModal';
import { WhatsAppNotifModal } from './components/WhatsAppNotifModal';
import { PrintLabelModal } from './components/PrintLabelModal';
import { LoginView } from './components/LoginView';
import { SettingsView } from './components/SettingsView';
import { CloudSyncModal } from './components/CloudSyncModal';
import { isGoogleSheetsConnected, sendToGoogleAppsScriptWebhook, pullDataFromGoogleSheets } from './utils/googleSheetsSync';

const STORAGE_KEYS = {
  BARANG: 'sim_bhp_barang_v1',
  PENERIMAAN: 'sim_bhp_penerimaan_v1',
  PENGELUARAN: 'sim_bhp_pengeluaran_v1',
  KOP: 'sim_bhp_kop_v2',
  USER: 'sim_bhp_active_user_v2',
  ALL_USERS: 'sim_bhp_all_users_v2',
  AUTH: 'sim_bhp_is_logged_in_v2'
};

export default function App() {
  // Persistent State (Defaults to empty array for fresh start or pulls from Google Sheets)
  const [listBarang, setListBarang] = useState<Barang[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BARANG);
      return saved !== null ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [listPenerimaan, setListPenerimaan] = useState<PenerimaanBarang[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PENERIMAAN);
      return saved !== null ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [listPengeluaran, setListPengeluaran] = useState<PengeluaranBarang[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PENGELUARAN);
      return saved !== null ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [kop, setKop] = useState<KopPuskesmas>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KOP);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_KOP,
          ...parsed,
          namaPemerintah: parsed.namaPemerintah || INITIAL_KOP.namaPemerintah,
          namaDinas: parsed.namaDinas || INITIAL_KOP.namaDinas,
          namaPuskesmas: parsed.namaPuskesmas || INITIAL_KOP.namaPuskesmas,
          alamat: parsed.alamat || INITIAL_KOP.alamat,
          telepon: parsed.telepon || INITIAL_KOP.telepon,
          email: parsed.email || INITIAL_KOP.email,
          website: parsed.website || INITIAL_KOP.website,
          namaKapusk: parsed.namaKapusk && parsed.namaKapusk.includes('Dwipayana') ? parsed.namaKapusk : INITIAL_KOP.namaKapusk,
          nipKapusk: parsed.nipKapusk && parsed.nipKapusk.includes('1978') ? parsed.nipKapusk : INITIAL_KOP.nipKapusk,
          namaPengurusBarang: parsed.namaPengurusBarang || INITIAL_KOP.namaPengurusBarang,
          nipPengurusBarang: parsed.nipPengurusBarang || INITIAL_KOP.nipPengurusBarang,
          nomorWhatsAppList: parsed.nomorWhatsAppList || INITIAL_KOP.nomorWhatsAppList
        };
      }
      return INITIAL_KOP;
    } catch {
      return INITIAL_KOP;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username === 'admin' || parsed.username === 'user') return parsed;
      }
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  // User Accounts State (Only Admin & Pegawai with dynamic passwords)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((u: any) => u.username === 'admin' || u.username === 'user');
        if (filtered.length >= 2) return filtered;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
      return auth === 'true';
    } catch {
      return false;
    }
  });

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (user.role === 'kapusk') {
      setCurrentView('laporan');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  // Navigation & UI States
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [printLabelTarget, setPrintLabelTarget] = useState<Barang | null>(null);
  const [preSelectedBarangForPengeluaran, setPreSelectedBarangForPengeluaran] = useState<Barang | null>(null);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Cloud Sync Status State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'not_configured' | 'error'>(() => {
    return isGoogleSheetsConnected() ? 'synced' : 'not_configured';
  });
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const isDataMountedRef = React.useRef(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(listBarang));
  }, [listBarang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PENERIMAAN, JSON.stringify(listPenerimaan));
  }, [listPenerimaan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PENGELUARAN, JSON.stringify(listPengeluaran));
  }, [listPengeluaran]);

  // Otomatis Simpan (Auto-Sync) ke Google Drive Spreadsheet saat ada data baru/berubah
  useEffect(() => {
    if (!isDataMountedRef.current) {
      isDataMountedRef.current = true;
      return;
    }

    if (!isGoogleSheetsConnected()) {
      setCloudSyncStatus('not_configured');
      return;
    }

    setCloudSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        const res = await sendToGoogleAppsScriptWebhook('', listBarang, listPenerimaan, listPengeluaran);
        if (res.success) {
          setCloudSyncStatus('synced');
          const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          setLastSyncTime(time);
        } else {
          setCloudSyncStatus('error');
        }
      } catch {
        setCloudSyncStatus('error');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [listBarang, listPenerimaan, listPengeluaran]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KOP, JSON.stringify(kop));
  }, [kop]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Critical stock count (<= 5)
  const criticalStockCount = listBarang.filter(b => b.stokSaatIni <= (b.stokMinimum || 5)).length;

  // Handlers
  const handleAddBarang = (barang: Barang) => {
    setListBarang(prev => [barang, ...prev]);
  };

  const handleUpdateBarang = (barang: Barang) => {
    setListBarang(prev => prev.map(b => b.id === barang.id ? barang : b));
  };

  const handleDeleteBarang = (id: string) => {
    setListBarang(prev => prev.filter(b => b.id !== id));
    setListPenerimaan(prev => prev.filter(p => p.barangId !== id));
    setListPengeluaran(prev => prev.filter(q => q.barangId !== id));
  };

  const handleAddPenerimaan = (item: PenerimaanBarang) => {
    setListPenerimaan(prev => [item, ...prev]);
    setListBarang(prev => prev.map(b => {
      if (b.id === item.barangId) {
        return {
          ...b,
          stokSaatIni: b.stokSaatIni + item.jumlahMasuk,
          hargaSatuan: item.hargaSatuan || b.hargaSatuan
        };
      }
      return b;
    }));
  };

  const handleUpdatePenerimaan = (item: PenerimaanBarang, oldQty: number) => {
    const diff = item.jumlahMasuk - oldQty;
    setListPenerimaan(prev => prev.map(p => p.id === item.id ? item : p));
    setListBarang(prev => prev.map(b => {
      if (b.id === item.barangId) {
        return {
          ...b,
          stokSaatIni: b.stokSaatIni + diff
        };
      }
      return b;
    }));
  };

  const handleDeletePenerimaan = (id: string, qty: number, barangId: string) => {
    setListPenerimaan(prev => prev.filter(p => p.id !== id));
    setListBarang(prev => prev.map(b => {
      if (b.id === barangId) {
        return {
          ...b,
          stokSaatIni: Math.max(0, b.stokSaatIni - qty)
        };
      }
      return b;
    }));
  };

  const handleAddPengeluaran = (item: PengeluaranBarang) => {
    setListPengeluaran(prev => [item, ...prev]);
    setListBarang(prev => prev.map(b => {
      if (b.id === item.barangId) {
        return {
          ...b,
          stokSaatIni: Math.max(0, b.stokSaatIni - item.jumlahKeluar)
        };
      }
      return b;
    }));
  };

  const handleUpdatePengeluaran = (item: PengeluaranBarang, oldQty: number) => {
    const diff = item.jumlahKeluar - oldQty;
    setListPengeluaran(prev => prev.map(q => q.id === item.id ? item : q));
    setListBarang(prev => prev.map(b => {
      if (b.id === item.barangId) {
        return {
          ...b,
          stokSaatIni: Math.max(0, b.stokSaatIni - diff)
        };
      }
      return b;
    }));
  };

  const handleDeletePengeluaran = (id: string, qty: number, barangId: string) => {
    setListPengeluaran(prev => prev.filter(q => q.id !== id));
    setListBarang(prev => prev.map(b => {
      if (b.id === barangId) {
        return {
          ...b,
          stokSaatIni: b.stokSaatIni + qty
        };
      }
      return b;
    }));
  };

  // Callback to sync/overwrite all datasets when pulled from Google Sheets
  const handleUpdateAllDataFromSheets = (
    newBarang: Barang[],
    newPenerimaan: PenerimaanBarang[],
    newPengeluaran: PengeluaranBarang[]
  ) => {
    setListBarang(newBarang);
    setListPenerimaan(newPenerimaan);
    setListPengeluaran(newPengeluaran);
    localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(newBarang));
    localStorage.setItem(STORAGE_KEYS.PENERIMAAN, JSON.stringify(newPenerimaan));
    localStorage.setItem(STORAGE_KEYS.PENGELUARAN, JSON.stringify(newPengeluaran));
  };

  // Optional auto-sync on page load if user enabled it
  useEffect(() => {
    const isAutoSync = localStorage.getItem('sim_bhp_auto_sync_sheets') === 'true';
    const webhookUrl = localStorage.getItem('sim_bhp_gas_webhook');
    if (isAutoSync && webhookUrl && webhookUrl.startsWith('https://script.google.com/')) {
      pullDataFromGoogleSheets(webhookUrl).then((res) => {
        if (res.success && res.data) {
          handleUpdateAllDataFromSheets(res.data.barang, res.data.penerimaan, res.data.pengeluaran);
        }
      }).catch((err) => {
        console.warn('Auto-sync sheets on startup error:', err);
      });
    }
  }, []);

  const handleSelectBarangFromScan = (scannedBarang: Barang) => {
    setPreSelectedBarangForPengeluaran(scannedBarang);
    setCurrentView('pengeluaran');
  };

  if (!isLoggedIn) {
    return (
      <LoginView
        allUsers={allUsers}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased selection:bg-emerald-600 selection:text-white">
      
      {/* 1. Left Sidebar Navigation (Navbar dipinggir) */}
      <div className={`hidden lg:block ${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 shrink-0`}>
        <Sidebar
          currentView={currentView}
          setCurrentView={(v) => {
            setCurrentView(v);
            setMobileSidebarOpen(false);
          }}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          allUsers={allUsers}
          criticalStockCount={criticalStockCount}
          onOpenScanModal={() => setIsScanModalOpen(true)}
          onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-64 bg-[#062017] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              currentView={currentView}
              setCurrentView={(v) => {
                setCurrentView(v);
                setMobileSidebarOpen(false);
              }}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              allUsers={allUsers}
              criticalStockCount={criticalStockCount}
              onOpenScanModal={() => {
                setMobileSidebarOpen(false);
                setIsScanModalOpen(true);
              }}
              onOpenWhatsAppModal={() => {
                setMobileSidebarOpen(false);
                setIsWhatsAppModalOpen(true);
              }}
              isCollapsed={false}
              setIsCollapsed={() => setMobileSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Digital Bar */}
        <TopBar
          currentUser={currentUser}
          criticalStockCount={criticalStockCount}
          cloudSyncStatus={cloudSyncStatus}
          lastSyncTime={lastSyncTime}
          onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
          onOpenScanModal={() => setIsScanModalOpen(true)}
          onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Banner Alert jika HP belum terhubung ke Google Sheets */}
        {cloudSyncStatus === 'not_configured' && !isBannerDismissed && (
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 shadow-sm text-xs flex flex-wrap items-center justify-between gap-2 no-print border-b border-amber-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-black/20 shrink-0 text-sm">☁️</span>
              <span className="leading-snug">
                <strong>Google Drive Spreadsheet Belum Terhubung di HP Ini:</strong> Data yang baru saja Anda input tersimpan di memori HP. Hubungkan URL Webhook sekali agar otomatis tersinkron ke Google Spreadsheet.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsCloudSyncModalOpen(true)}
                className="px-3 py-1 bg-white text-amber-900 rounded-lg font-black text-xs hover:bg-amber-50 active:scale-95 shadow transition-all cursor-pointer"
              >
                Hubungkan Sekarang
              </button>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="text-white/80 hover:text-white px-2 py-1 text-xs cursor-pointer"
                title="Tutup Pesan"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              listBarang={listBarang}
              listPenerimaan={listPenerimaan}
              listPengeluaran={listPengeluaran}
              currentUser={currentUser}
              onNavigate={(view) => setCurrentView(view)}
              onOpenScanModal={() => setIsScanModalOpen(true)}
              onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
              onOpenPrintLabel={(b) => setPrintLabelTarget(b)}
            />
          )}

          {currentView === 'barang' && (
            <MasterBarangView
              listBarang={listBarang}
              currentUser={currentUser}
              onNavigateToPenerimaan={() => setCurrentView('penerimaan')}
              onAddBarang={handleAddBarang}
              onUpdateBarang={handleUpdateBarang}
              onDeleteBarang={handleDeleteBarang}
              onOpenPrintLabel={(b) => setPrintLabelTarget(b)}
            />
          )}

          {currentView === 'penerimaan' && (
            <PenerimaanView
              listPenerimaan={listPenerimaan}
              listBarang={listBarang}
              currentUser={currentUser}
              onAddBarang={handleAddBarang}
              onAddPenerimaan={handleAddPenerimaan}
              onUpdatePenerimaan={handleUpdatePenerimaan}
              onDeletePenerimaan={handleDeletePenerimaan}
              onOpenPrintLabel={(b) => setPrintLabelTarget(b)}
            />
          )}

          {currentView === 'pengeluaran' && (
            <PengeluaranView
              listPengeluaran={listPengeluaran}
              listBarang={listBarang}
              currentUser={currentUser}
              kop={kop}
              preSelectedBarangForPengeluaran={preSelectedBarangForPengeluaran}
              onClearPreSelectedBarang={() => setPreSelectedBarangForPengeluaran(null)}
              onAddPengeluaran={handleAddPengeluaran}
              onUpdatePengeluaran={handleUpdatePengeluaran}
              onDeletePengeluaran={handleDeletePengeluaran}
              onOpenScanModal={() => setIsScanModalOpen(true)}
              onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            />
          )}

          {currentView === 'kartustok' && (
            <KartuStokView
              listBarang={listBarang}
              listPenerimaan={listPenerimaan}
              listPengeluaran={listPengeluaran}
              kop={kop}
            />
          )}

          {currentView === 'laporan' && (
            <LaporanView
              listBarang={listBarang}
              listPenerimaan={listPenerimaan}
              listPengeluaran={listPengeluaran}
              kop={kop}
              currentUser={currentUser}
            />
          )}

          {(currentView === 'pengaturan' || currentView === 'niagahoster') && (
            <SettingsView
              currentUser={currentUser}
              allUsers={allUsers}
              onUpdateUsers={(updated) => {
                setAllUsers(updated);
                const updatedCurrent = updated.find(u => u.id === currentUser.id);
                if (updatedCurrent) setCurrentUser(updatedCurrent);
              }}
              kop={kop}
              onUpdateKop={setKop}
              listBarang={listBarang}
              listPenerimaan={listPenerimaan}
              listPengeluaran={listPengeluaran}
              onUpdateAllData={handleUpdateAllDataFromSheets}
            />
          )}
        </main>

        {/* Global Page Footer */}
        <footer className="mt-8 py-5 border-t border-slate-200/80 bg-white/60 backdrop-blur-xs no-print text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 tracking-wide">&copy; Licensi budabejo2026</span>
              <span>•</span>
              <span>Sistem Informasi Persediaan Barang Habis Pakai (BHP)</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://docs.google.com/spreadsheets/d/1EjRfRzHEA2ILgw0xO6cCtZ5j6yfygbwAq9V3zywUhD0/edit?gid=0#gid=0"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold transition-all text-[11px]"
              >
                <span>Database Google Sheets</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              </a>
              <span className="text-[11px] text-slate-400">UPTD Puskesmas Petang I Kabupaten Badung</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ScanBarcodeModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        listBarang={listBarang}
        onSelectBarangForPengeluaran={handleSelectBarangFromScan}
        onAddPengeluaran={handleAddPengeluaran}
        currentUser={currentUser}
        kop={kop}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
      />

      <WhatsAppNotifModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        listBarang={listBarang}
        kop={kop}
        onUpdateKop={setKop}
      />

      <PrintLabelModal
        isOpen={Boolean(printLabelTarget)}
        onClose={() => setPrintLabelTarget(null)}
        barang={printLabelTarget}
        allBarang={listBarang}
        kop={kop}
      />

      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        listBarang={listBarang}
        listPenerimaan={listPenerimaan}
        listPengeluaran={listPengeluaran}
        onUpdateAllData={handleUpdateAllDataFromSheets}
        onSyncSuccess={() => {
          setCloudSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }}
      />

    </div>
  );
}
