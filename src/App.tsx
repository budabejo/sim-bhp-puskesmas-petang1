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
import { sendToGoogleAppsScriptWebhook } from './utils/googleSheetsSync';

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
  // Persistent State
  const [listBarang, setListBarang] = useState<Barang[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BARANG);
      return saved ? JSON.parse(saved) : INITIAL_BARANG;
    } catch {
      return INITIAL_BARANG;
    }
  });

  const [listPenerimaan, setListPenerimaan] = useState<PenerimaanBarang[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PENERIMAAN);
      return saved ? JSON.parse(saved) : INITIAL_PENERIMAAN;
    } catch {
      return INITIAL_PENERIMAAN;
    }
  });

  const [listPengeluaran, setListPengeluaran] = useState<PengeluaranBarang[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PENGELUARAN);
      return saved ? JSON.parse(saved) : INITIAL_PENGELUARAN;
    } catch {
      return INITIAL_PENGELUARAN;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KOP, JSON.stringify(kop));
  }, [kop]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Critical stock count (<= 5)
  const criticalStockCount = listBarang.filter(b => b.stokSaatIni <= (b.stokMinimum || 5)).length;

  // Sinkronisasi otomatis: setiap perubahan data lokal langsung dikirim ke Google Sheets
  const syncCurrentDataToSheets = (
    barang: Barang[],
    penerimaan: PenerimaanBarang[],
    pengeluaran: PengeluaranBarang[]
  ) => {
    const webhookUrl = localStorage.getItem('sim_bhp_gas_webhook')?.trim();
    if (!webhookUrl) return;

    // Jangan mengganggu proses simpan UI jika internet/Sheets sedang tidak tersedia.
    void sendToGoogleAppsScriptWebhook(webhookUrl, barang, penerimaan, pengeluaran)
      .then(result => {
        if (!result.success) console.warn('[SIM-BHP] Sinkronisasi Google Sheets gagal:', result.message);
      })
      .catch(error => console.warn('[SIM-BHP] Sinkronisasi Google Sheets gagal:', error));
  };

  // Handlers
  const handleAddBarang = (barang: Barang) => {
    const nextBarang = [barang, ...listBarang];
    setListBarang(nextBarang);
    syncCurrentDataToSheets(nextBarang, listPenerimaan, listPengeluaran);
  };

  const handleUpdateBarang = (barang: Barang) => {
    const nextBarang = listBarang.map(b => b.id === barang.id ? barang : b);
    setListBarang(nextBarang);
    syncCurrentDataToSheets(nextBarang, listPenerimaan, listPengeluaran);
  };

  const handleDeleteBarang = (id: string) => {
    const nextBarang = listBarang.filter(b => b.id !== id);
    const nextPenerimaan = listPenerimaan.filter(p => p.barangId !== id);
    const nextPengeluaran = listPengeluaran.filter(q => q.barangId !== id);
    setListBarang(nextBarang);
    setListPenerimaan(nextPenerimaan);
    setListPengeluaran(nextPengeluaran);
    syncCurrentDataToSheets(nextBarang, nextPenerimaan, nextPengeluaran);
  };

  const handleAddPenerimaan = (item: PenerimaanBarang) => {
    const nextPenerimaan = [item, ...listPenerimaan];
    const nextBarang = listBarang.map(b => b.id === item.barangId ? {
      ...b,
      stokSaatIni: b.stokSaatIni + item.jumlahMasuk,
      hargaSatuan: item.hargaSatuan || b.hargaSatuan
    } : b);
    setListPenerimaan(nextPenerimaan);
    setListBarang(nextBarang);
    syncCurrentDataToSheets(nextBarang, nextPenerimaan, listPengeluaran);
  };

  const handleUpdatePenerimaan = (item: PenerimaanBarang, oldQty: number) => {
    const diff = item.jumlahMasuk - oldQty;
    const nextPenerimaan = listPenerimaan.map(p => p.id === item.id ? item : p);
    const nextBarang = listBarang.map(b => b.id === item.barangId ? { ...b, stokSaatIni: b.stokSaatIni + diff } : b);
    setListPenerimaan(nextPenerimaan);
    setListBarang(nextBarang);
    syncCurrentDataToSheets(nextBarang, nextPenerimaan, listPengeluaran);
  };

  const handleDeletePenerimaan = (id: string, qty: number, barangId: string) => {
    const nextPenerimaan = listPenerimaan.filter(p => p.id !== id);
    const nextBarang = listBarang.map(b => b.id === barangId ? { ...b, stokSaatIni: Math.max(0, b.stokSaatIni - qty) } : b);
    setListPenerimaan(nextPenerimaan);
    setListBarang(nextBarang);
    syncCurrentDataToSheets(nextBarang, nextPenerimaan, listPengeluaran);
  };

  const handleAddPengeluaran = (item: PengeluaranBarang) => {
    const nextPengeluaran = [item, ...listPengeluaran];
    const nextBarang = listBarang.map(b => b.id === item.barangId ? { ...b, stokSaatIni: Math.max(0, b.stokSaatIni - item.jumlahKeluar) } : b);
    setListPengeluaran(nextPengeluaran);
    setListBarang(nextBarang);
    syncCurrentDataToSheets(nextBarang, listPenerimaan, nextPengeluaran);
  };

  const handleUpdatePengeluaran = (item: PengeluaranBarang, oldQty: number) => {
    const diff = item.jumlahKeluar - oldQty;
    const nextPengeluaran = listPengeluaran.map(q => q.id === item.id ? item : q);
    const nextBarang = listBarang.map(b => b.id === item.barangId ? { ...b, stokSaatIni: Math.max(0, b.stokSaatIni - diff) } : b);
    setListPengeluaran(nextPengeluaran);
    setListBarang(nextBarang);
    syncCurrentDataToSheets(nextBarang, listPenerimaan, nextPengeluaran);
  };

  const handleDeletePengeluaran = (id: string, qty: number, barangId: string) => {
    const nextPengeluaran = listPengeluaran.filter(q => q.id !== id);
    const nextBarang = listBarang.map(b => b.id === barangId ? { ...b, stokSaatIni: b.stokSaatIni + qty } : b);
    setListPengeluaran(nextPengeluaran);
    setListBarang(nextBarang);
    syncCurrentDataToSheets(nextBarang, listPenerimaan, nextPengeluaran);
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
      import('./utils/googleSheetsSync').then(({ pullDataFromGoogleSheets }) => {
        pullDataFromGoogleSheets(webhookUrl).then((res) => {
          if (res.success && res.data) {
            handleUpdateAllDataFromSheets(res.data.barang, res.data.penerimaan, res.data.pengeluaran);
          }
        }).catch((err) => {
          console.warn('Auto-sync sheets on startup error:', err);
        });
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
          onOpenScanModal={() => setIsScanModalOpen(true)}
          onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onLogout={handleLogout}
        />

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

    </div>
  );
}
