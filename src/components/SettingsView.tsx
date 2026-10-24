import React, { useState } from 'react';
import { 
  Settings, 
  KeyRound, 
  Database, 
  Users, 
  Building2, 
  ShieldCheck, 
  Check, 
  Copy, 
  Download, 
  Save, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Phone,
  Lock,
  MessageCircle,
  ExternalLink,
  Cloud,
  RefreshCw,
  FileCode,
  Globe,
  Server,
  UploadCloud,
  CheckCircle2,
  ArrowDownToLine,
  ArrowUpToLine,
  Trash2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Barang, KopPuskesmas, PenerimaanBarang, PengeluaranBarang, UserProfile } from '../types';
import { generateMySQLDump } from '../utils/sqlExporter';
import { 
  SPREADSHEET_ID, 
  SPREADSHEET_URL, 
  downloadForGoogleSheets, 
  GOOGLE_APPS_SCRIPT_CODE, 
  sendToGoogleAppsScriptWebhook,
  pullDataFromGoogleSheets
} from '../utils/googleSheetsSync';

interface Props {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  kop: KopPuskesmas;
  onUpdateKop: (kop: KopPuskesmas) => void;
  listBarang: Barang[];
  listPenerimaan: PenerimaanBarang[];
  listPengeluaran: PengeluaranBarang[];
  onUpdateAllData?: (
    barang: Barang[],
    penerimaan: PenerimaanBarang[],
    pengeluaran: PengeluaranBarang[]
  ) => void;
}

export const SettingsView: React.FC<Props> = ({
  currentUser,
  allUsers,
  onUpdateUsers,
  kop,
  onUpdateKop,
  listBarang,
  listPenerimaan,
  listPengeluaran,
  onUpdateAllData
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'kop' | 'password' | 'database' | 'users'>('whatsapp');
  
  // Filter allUsers to only Admin and Pegawai (user) as requested
  const allowedUsers = allUsers.filter(u => u.username === 'admin' || u.username === 'user');

  // Password State
  const [targetUsername, setTargetUsername] = useState<string>('admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Kop State (Including 5 WhatsApp numbers)
  const initialWhatsAppList: string[] = [
    kop.nomorWhatsAppList?.[0] || kop.nomorWhatsAppNotif || '6281234567890',
    kop.nomorWhatsAppList?.[1] || '6281398765432',
    kop.nomorWhatsAppList?.[2] || '6285712345678',
    kop.nomorWhatsAppList?.[3] || '',
    kop.nomorWhatsAppList?.[4] || ''
  ];

  const [kopForm, setKopForm] = useState<KopPuskesmas>({
    ...kop,
    namaPemerintah: kop.namaPemerintah || 'PEMERINTAH KABUPATEN BADUNG',
    namaDinas: kop.namaDinas || 'DINAS KESEHATAN',
    namaPuskesmas: kop.namaPuskesmas || 'UPTD PUSKESMAS PETANG I',
    alamat: kop.alamat || 'Jl. Jahuripan-Petang, Desa Petang, Kecamatan Petang, Kabupaten Badung',
    telepon: kop.telepon || '0361 813379',
    email: kop.email || 'petang1_dikesbadung@yahoo.com',
    website: kop.website || 'https://puskesmaspetang1.badungkab.go.id/',
    namaKapusk: kop.namaKapusk || 'dr. I Ketut Dwipayana, M.Kes.',
    nipKapusk: kop.nipKapusk || '19783112 200712 1 004',
    namaPengurusBarang: kop.namaPengurusBarang || 'I Ketut Buda Antara',
    nipPengurusBarang: kop.nipPengurusBarang || '19930920 201802 1 003',
    nomorWhatsAppList: initialWhatsAppList
  });

  const [whatsAppList, setWhatsAppList] = useState<string[]>(initialWhatsAppList);
  const [kopSaved, setKopSaved] = useState(false);
  const [whatsAppSaved, setWhatsAppSaved] = useState(false);

  // Google Sheets Webhook State
  const [gasWebhookUrl, setGasWebhookUrl] = useState<string>(() => {
    const saved = localStorage.getItem('sim_bhp_gas_webhook');
    const configured = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';
    return saved || configured;
  });
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isPullingSheets, setIsPullingSheets] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [autoSyncOnLoad, setAutoSyncOnLoad] = useState<boolean>(() => {
    return localStorage.getItem('sim_bhp_auto_sync_sheets') === 'true';
  });
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGasScript, setShowGasScript] = useState(false);

  // SQL Exporter State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toggle Auto Sync on load
  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncOnLoad(enabled);
    localStorage.setItem('sim_bhp_auto_sync_sheets', enabled ? 'true' : 'false');
  };

  // Handle Save Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword.trim()) {
      setPasswordError('Kata sandi baru tidak boleh kosong.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok. Mohon ulangi.');
      return;
    }

    if (newPassword.length < 3) {
      setPasswordError('Kata sandi minimal 3 karakter.');
      return;
    }

    const updated = allowedUsers.map(u => {
      if (u.username === targetUsername) {
        return { ...u, password: newPassword.trim() };
      }
      return u;
    });

    onUpdateUsers(updated);
    setPasswordSuccess(`Kata sandi untuk pengguna "${targetUsername}" berhasil diperbarui!`);
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setPasswordSuccess('');
    }, 4000);
  };

  // Handle Save 5 WhatsApp Numbers
  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanList = whatsAppList.map(n => n.trim().replace(/[^0-9]/g, ''));
    const primaryNumber = cleanList.find(n => n.length > 0) || '6281234567890';
    
    const updatedKop: KopPuskesmas = {
      ...kopForm,
      nomorWhatsAppNotif: primaryNumber,
      nomorWhatsAppList: cleanList
    };

    setKopForm(updatedKop);
    onUpdateKop(updatedKop);
    setWhatsAppSaved(true);
    setTimeout(() => setWhatsAppSaved(false), 3000);
  };

  // Handle Save Kop & Signatures
  const handleSaveKop = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedKop: KopPuskesmas = {
      ...kopForm,
      nomorWhatsAppList: whatsAppList
    };
    onUpdateKop(updatedKop);
    setKopSaved(true);
    setTimeout(() => setKopSaved(false), 3000);
  };

  // Test WhatsApp Send to specific number
  const handleTestWhatsApp = (phone: string, label: string) => {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert(`Nomor WhatsApp ${label} belum diisi.`);
      return;
    }
    const text = encodeURIComponent(
      `*TES NOTIFIKASI SIM-BHP PUSKESMAS PETANG I*\n\n` +
      `Halo Bapak/Ibu,\nIni adalah pesan uji coba integrasi notifikasi WhatsApp otomatis dari Sistem Informasi Manajemen BHP UPTD Puskesmas Petang I.\n\n` +
      `Sistem siap memberikan notifikasi otomatis apabila stok barang mencapai batas minimum (<= 5 unit).\n\n` +
      `_Waktu Uji Coba: ${new Date().toLocaleString('id-ID')}_`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // SQL Dump Download
  const sqlContent = generateMySQLDump(listBarang, listPenerimaan, listPengeluaran);
  const handleDownloadSQL = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'db_sim_bhp_puskesmas.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Google Sheets Webhook Handlers
  const handleSaveWebhookUrl = (url: string) => {
    setGasWebhookUrl(url);
    localStorage.setItem('sim_bhp_gas_webhook', url.trim());
    setSyncStatusMsg({
      type: 'success',
      text: 'URL Webhook Google Apps Script berhasil disimpan di browser.'
    });
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  const handleSyncToSheets = async () => {
    if (!gasWebhookUrl.trim()) {
      setSyncStatusMsg({
        type: 'error',
        text: 'Masukkan URL Webhook Google Apps Script Anda terlebih dahulu (lihat panduan langkah di bawah).'
      });
      return;
    }

    setIsSyncingSheets(true);
    setSyncStatusMsg(null);

    const result = await sendToGoogleAppsScriptWebhook(
      gasWebhookUrl.trim(),
      listBarang,
      listPenerimaan,
      listPengeluaran
    );

    setIsSyncingSheets(false);
    setSyncStatusMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });

    if (result.success) {
      setTimeout(() => setSyncStatusMsg(null), 8000);
    }
  };

  const handlePullFromSheets = async () => {
    if (!gasWebhookUrl.trim()) {
      setSyncStatusMsg({
        type: 'error',
        text: 'Masukkan URL Webhook Google Apps Script Anda terlebih dahulu.'
      });
      return;
    }

    setIsPullingSheets(true);
    setSyncStatusMsg(null);
    setShowPullConfirm(false);

    const result = await pullDataFromGoogleSheets(gasWebhookUrl.trim());

    setIsPullingSheets(false);
    setSyncStatusMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });

    if (result.success && result.data && onUpdateAllData) {
      onUpdateAllData(result.data.barang, result.data.penerimaan, result.data.pengeluaran);
      setTimeout(() => setSyncStatusMsg(null), 8000);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleEnv = `APP_NAME="SIM-BHP Puskesmas Petang I"
APP_ENV=production
APP_KEY=base64:your_app_key_here
APP_DEBUG=false
APP_URL=https://puskesmaspetang1.badungkab.go.id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_sim_bhp
DB_USERNAME=root
DB_PASSWORD=`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hak Akses Administrator Sistem • UPTD Puskesmas Petang I</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-emerald-400" />
              <span>Pusat Pengaturan Sistem (Settings)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Kelola nomor WhatsApp notifikasi otomatis (hingga 5 nomor), kop laporan resmi Pemkab Badung, 
              kata sandi pengguna (Admin & Pegawai), serta ekspor database MySQL / XAMPP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer no-underline"
              title="Buka Spreadsheet Database di Google Drive"
            >
              <ExternalLink className="w-4 h-4 text-emerald-200" />
              <span>Buka Google Sheets</span>
            </a>
            <button
              onClick={() => downloadForGoogleSheets(listBarang, listPenerimaan, listPengeluaran)}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              title="Ekspor format CSV untuk Google Spreadsheet"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV Sheets</span>
            </button>
            <button
              onClick={handleDownloadSQL}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-slate-700"
            >
              <Database className="w-4 h-4 text-slate-300" />
              <span>Ekspor db_sim_bhp.sql</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-emerald-900/60 pt-4">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>5 Nomor WhatsApp Notif</span>
          </button>

          <button
            onClick={() => setActiveTab('kop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kop'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Kop Laporan & Pejabat</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'password'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Ganti Kata Sandi</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Google Sheets, XAMPP & Hosting</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Akun Pengguna</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 5 NOMOR WHATSAPP PENERIMA NOTIFIKASI STOK */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>Pengaturan 5 Nomor WhatsApp Penerima Notifikasi Stok Minimum</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Setiap kali pengeluaran barang menyebabkan stok mencapai batas minimum (≤ 5 unit), 
                pesan notifikasi peringatan dapat dikirimkan ke 5 nomor WhatsApp berikut.
              </p>
            </div>
            {whatsAppSaved && (
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>5 Nomor WA Berhasil Disimpan!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveWhatsApp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nomor 1: Pengurus Barang / Admin */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center">1</span>
                    <span>Nomor WA Pengurus Barang / Admin</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTestWhatsApp(whatsAppList[0], 'Pengurus Barang')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <span>Uji WA</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={whatsAppList[0] || ''}
                  onChange={(e) => {
                    const next = [...whatsAppList];
                    next[0] = e.target.value;
                    setWhatsAppList(next);
                  }}
                  placeholder="Contoh: 6281234567890 (I Ketut Buda Antara)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-[10px] text-slate-500">Penerima utama alert stok kritis gudang</p>
              </div>

              {/* Nomor 2: Kepala Puskesmas */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-black flex items-center justify-center">2</span>
                    <span>Nomor WA Kepala UPTD Puskesmas</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTestWhatsApp(whatsAppList[1], 'Kepala Puskesmas')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <span>Uji WA</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={whatsAppList[1] || ''}
                  onChange={(e) => {
                    const next = [...whatsAppList];
                    next[1] = e.target.value;
                    setWhatsAppList(next);
                  }}
                  placeholder="Contoh: 6281398765432 (dr. I Ketut Dwipayana, M.Kes.)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-[10px] text-slate-500">Untuk laporan pengawasan ketersediaan BHP</p>
              </div>

              {/* Nomor 3: Pegawai Logistik */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] font-black flex items-center justify-center">3</span>
                    <span>Nomor WA Pegawai Logistik Gudang</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTestWhatsApp(whatsAppList[2], 'Pegawai Logistik')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <span>Uji WA</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={whatsAppList[2] || ''}
                  onChange={(e) => {
                    const next = [...whatsAppList];
                    next[2] = e.target.value;
                    setWhatsAppList(next);
                  }}
                  placeholder="Contoh: 6285712345678 (Pegawai Logistik)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-[10px] text-slate-500">Petugas operasional yang menyiapkan amprahan barang</p>
              </div>

              {/* Nomor 4: Nomor Tambahan 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-600 text-white text-[10px] font-black flex items-center justify-center">4</span>
                    <span>Nomor WA Tambahan 1 (Opsional)</span>
                  </label>
                  {whatsAppList[3] && (
                    <button
                      type="button"
                      onClick={() => handleTestWhatsApp(whatsAppList[3], 'Nomor 4')}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Uji WA</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={whatsAppList[3] || ''}
                  onChange={(e) => {
                    const next = [...whatsAppList];
                    next[3] = e.target.value;
                    setWhatsAppList(next);
                  }}
                  placeholder="Contoh: 6281299887766 (Pejabat Pengadaan / Pustu)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-[10px] text-slate-500">Dapat diisi kontak PPK / Pejabat Pengadaan Puskesmas</p>
              </div>

              {/* Nomor 5: Nomor Tambahan 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-600 text-white text-[10px] font-black flex items-center justify-center">5</span>
                    <span>Nomor WA Tambahan 2 (Opsional)</span>
                  </label>
                  {whatsAppList[4] && (
                    <button
                      type="button"
                      onClick={() => handleTestWhatsApp(whatsAppList[4], 'Nomor 5')}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Uji WA</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={whatsAppList[4] || ''}
                  onChange={(e) => {
                    const next = [...whatsAppList];
                    next[4] = e.target.value;
                    setWhatsAppList(next);
                  }}
                  placeholder="Contoh: 6281987654321 (Koordinator Layanan / Farmasi)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-[10px] text-slate-500">Format internasional: gunakan awalan 62 (contoh: 6281234567890)</p>
              </div>

            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan 5 Nomor WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: KOP RESMI LAPORAN & PEJABAT PENANDATANGAN */}
      {activeTab === 'kop' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Pengaturan Kop Laporan Resmi & Pejabat Penandatangan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Format kop dinas Pemkab Badung dan pejabat penandatangan resmi laporan pertanggungjawaban BHP.
              </p>
            </div>
            {kopSaved && (
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kop Laporan Berhasil Disimpan!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveKop} className="space-y-4">
            
            {/* 5-Baris Kop Laporan */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Struktur 5 Baris Kop Dokumen Resmi:
              </div>

              {/* Baris 1: Pemerintah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Baris 1: Nama Pemerintah Daerah
                </label>
                <input
                  type="text"
                  value={kopForm.namaPemerintah}
                  onChange={(e) => setKopForm({ ...kopForm, namaPemerintah: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                  required
                />
              </div>

              {/* Baris 2: Dinas Kesehatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Baris 2: Nama Dinas
                </label>
                <input
                  type="text"
                  value={kopForm.namaDinas}
                  onChange={(e) => setKopForm({ ...kopForm, namaDinas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                  required
                />
              </div>

              {/* Baris 3: UPTD Puskesmas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Baris 3: Nama UPTD Puskesmas
                </label>
                <input
                  type="text"
                  value={kopForm.namaPuskesmas}
                  onChange={(e) => setKopForm({ ...kopForm, namaPuskesmas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                  required
                />
              </div>

              {/* Baris 4: Alamat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Baris 4: Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={kopForm.alamat}
                  onChange={(e) => setKopForm({ ...kopForm, alamat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                  required
                />
              </div>

              {/* Baris 5: Kontak & Web */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={kopForm.telepon}
                    onChange={(e) => setKopForm({ ...kopForm, telepon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={kopForm.email}
                    onChange={(e) => setKopForm({ ...kopForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Website Resmi
                  </label>
                  <input
                    type="text"
                    value={kopForm.website || ''}
                    onChange={(e) => setKopForm({ ...kopForm, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pejabat Penandatangan Resmi */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
              <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Pejabat Penandatangan Resmi (Sesuai SK / Penugasan):
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kepala Puskesmas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">1. Kepala UPTD Puskesmas Petang I</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nama & Gelar Lengkap</label>
                    <input
                      type="text"
                      value={kopForm.namaKapusk}
                      onChange={(e) => setKopForm({ ...kopForm, namaKapusk: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">NIP Kepala Puskesmas</label>
                    <input
                      type="text"
                      value={kopForm.nipKapusk}
                      onChange={(e) => setKopForm({ ...kopForm, nipKapusk: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                      required
                    />
                  </div>
                </div>

                {/* Pengurus Barang */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">2. Pengurus Barang Pembantu BHP</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nama & Gelar Pengurus Barang</label>
                    <input
                      type="text"
                      value={kopForm.namaPengurusBarang}
                      onChange={(e) => setKopForm({ ...kopForm, namaPengurusBarang: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">NIP Pengurus Barang</label>
                    <input
                      type="text"
                      value={kopForm.nipPengurusBarang}
                      onChange={(e) => setKopForm({ ...kopForm, nipPengurusBarang: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kop & Pejabat Laporan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: GANTI KATA SANDI (HANYA ADMIN & PEGAWAI) */}
      {activeTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Ganti Password */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Ubah Kata Sandi (Password) Akun</h3>
                <p className="text-xs text-slate-500">Khusus hak akses Administrator (admin) dan Pegawai (user)</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Akun yang Ingin Diubah
                </label>
                <select
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {allowedUsers.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username.toUpperCase()} - {u.nama} ({u.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>

          {/* Kartu Ringkasan Akun & Sandi Aktif */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Status Akun & Kredensial Resmi</span>
            </h3>

            <div className="space-y-3">
              {allowedUsers.map((u) => (
                <div 
                  key={u.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    targetUsername === u.username
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900">{u.nama}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Username: <strong className="text-emerald-800 font-mono">{u.username}</strong></p>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role === 'admin' ? 'ADMIN' : 'PEGAWAI'}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-600 flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                    <span>Sandi: <span className="font-mono font-bold text-slate-800">{u.password || u.username}</span></span>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetUsername(u.username);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      Pilih & Ganti
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Info Login:</strong> Akses masuk sistem hanya diperuntukkan bagi <strong>Admin</strong> (Pengurus Barang) dan <strong>Pegawai</strong> (Petugas Logistik Gudang).
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: DATABASE GOOGLE SHEETS, XAMPP & HOSTING */}
      {activeTab === 'database' && (
        <div className="space-y-6">

          {/* 1. SEKSI GOOGLE DRIVE SPREADSHEET (DATABASE CLOUD) */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/30 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Database Cloud Google Drive Aktif</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight mt-1">Google Drive Spreadsheet Sinkronisasi</h3>
                  <p className="text-xs text-slate-300">
                    ID Spreadsheet: <code className="bg-slate-800/80 text-emerald-300 px-1.5 py-0.5 rounded font-mono">{SPREADSHEET_ID}</code>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={SPREADSHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer no-underline"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-200" />
                  <span>Buka Google Sheets Anda</span>
                </a>
                <button
                  onClick={() => downloadForGoogleSheets(listBarang, listPenerimaan, listPengeluaran)}
                  className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor CSV Google Sheets</span>
                </button>
              </div>
            </div>

            {/* Sync Feedback Alert */}
            {syncStatusMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                syncStatusMsg.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-200'
                  : 'bg-red-500/20 border border-red-400/50 text-red-200'
              }`}>
                {syncStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{syncStatusMsg.text}</span>
              </div>
            )}

            {/* Webhook Configuration Box (Sinkronisasi 2-Arah) */}
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-emerald-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-200">
                    URL Webhook Google Apps Script (Sinkronisasi 2-Arah Cloud):
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hubungkan spreadsheet agar data dapat dikirim ke spreadsheet dan ditarik kembali ke aplikasi.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    2-Way Sync (Kirim & Tarik)
                  </span>
                </div>
              </div>

              {/* Input URL & Save */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={gasWebhookUrl}
                  onChange={(e) => setGasWebhookUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 font-mono focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSaveWebhookUrl(gasWebhookUrl)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  Simpan URL
                </button>
              </div>

              {/* Dua Tombol Aksi Sinkronisasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Tombol 1: Kirim ke Google Sheets */}
                <button
                  onClick={handleSyncToSheets}
                  disabled={isSyncingSheets || isPullingSheets}
                  className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white rounded-xl shadow-lg border border-emerald-400/30 flex items-center gap-3 transition-all cursor-pointer disabled:opacity-50 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
                    <ArrowUpToLine className={`w-5 h-5 text-emerald-200 ${isSyncingSheets ? 'animate-bounce' : ''}`} />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-wide">
                      {isSyncingSheets ? 'Sedang Mengirim...' : '1. Kirim Data ke Google Sheets'}
                    </div>
                    <div className="text-[10px] text-emerald-100 font-normal leading-tight mt-0.5">
                      Upload data Master BHP, Penerimaan, & Pengeluaran dari web ke Spreadsheet.
                    </div>
                  </div>
                </button>

                {/* Tombol 2: Tarik Data dari Google Sheets */}
                <button
                  onClick={() => setShowPullConfirm(true)}
                  disabled={isSyncingSheets || isPullingSheets}
                  className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white rounded-xl shadow-lg border border-blue-400/30 flex items-center gap-3 transition-all cursor-pointer disabled:opacity-50 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
                    <ArrowDownToLine className={`w-5 h-5 text-blue-200 ${isPullingSheets ? 'animate-bounce' : ''}`} />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-wide">
                      {isPullingSheets ? 'Sedang Membaca...' : '2. Tarik Data dari Google Sheets'}
                    </div>
                    <div className="text-[10px] text-blue-100 font-normal leading-tight mt-0.5">
                      Ambil data terkini. Jika ada baris dihapus di Sheets, di web otomatis ikut terhapus!
                    </div>
                  </div>
                </button>
              </div>

              {/* Opsi Auto-Sync saat aplikasi dibuka */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={autoSyncOnLoad}
                    onChange={(e) => handleToggleAutoSync(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
                  />
                  <span>Otomatis Tarik Data dari Google Sheets setiap kali aplikasi web dibuka di browser</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">
                  {autoSyncOnLoad ? '✓ Otomatis Aktif' : 'Non-aktif (Manual)'}
                </span>
              </div>

              {/* Edukasi Tanya Jawab: Jika data di Spreadsheet dihapus */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-black text-amber-300">
                  <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Apakah data di aplikasi web ikut terhapus jika baris di Google Sheets dihapus?</span>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-relaxed pl-6">
                  <strong>JAWABAN: YA!</strong> Saat Anda menghapus baris barang atau transaksi di Google Spreadsheet, data di web tidak otomatis hilang seketika tanpa dibaca ulang. Cukup klik tombol <strong>"Tarik Data dari Google Sheets"</strong> di atas (atau aktifkan centang otomatis). Sistem akan segera membaca lembar spreadsheet Anda dan <strong>menghapus barang tersebut dari Master BHP, riwayat transaksi, kartu stok, dan laporan resmi</strong> secara bersamaan!
                </p>
              </div>

              {/* Toggle Apps Script Code */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGasScript(!showGasScript)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCode className="w-4 h-4" />
                  <span>{showGasScript ? 'Tutup Kode Google Apps Script' : 'Lihat / Salin Kode Apps Script Versi 2-Arah (doPost & doGet)'}</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  Perlu update skrip di Spreadsheet jika baru pertama kali pakai fitur Tarik Data
                </span>
              </div>

              {/* Expandable Apps Script Code Box */}
              {showGasScript && (
                <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      Langkah Pembaruan: Buka Google Sheets &gt; Ekstensi &gt; Apps Script &gt; Timpa seluruh kode lama dengan ini &gt; Klik Terapkan &gt; Penerapan Baru:
                    </span>
                    <button
                      onClick={() => copyToClipboard(GOOGLE_APPS_SCRIPT_CODE, 'gas_code')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-extrabold rounded-lg flex items-center gap-1.5 cursor-pointer shadow shrink-0"
                    >
                      {copiedKey === 'gas_code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'gas_code' ? 'Kode Tersalin!' : 'Salin Seluruh Kode'}</span>
                    </button>
                  </div>
                  <pre className="max-h-60 overflow-y-auto p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-lg border border-slate-800 leading-relaxed">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Konfirmasi Tarik Data dari Sheets */}
            {showPullConfirm && (
              <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <ArrowDownToLine className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Tarik & Sinkronkan Data dari Google Sheets?
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Sistem akan mengunduh data terkini dari lembar spreadsheet Anda. 
                      <strong className="text-amber-800 block mt-1.5 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        ⚠️ Perhatian: Jika ada data barang atau riwayat yang telah Anda hapus langsung di Google Sheets, maka data tersebut juga akan ikut terhapus dari aplikasi web ini.
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowPullConfirm(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handlePullFromSheets}
                      className="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ya, Tarik & Perbarui Sekarang</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. PANDUAN DEPLOYMENT KE NIAGAHOSTER (CPANEL) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                  <Server className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Hosting ke Niagahoster (cPanel)</h3>
                  <p className="text-xs text-slate-500">
                    Upload file siap pakai ke folder <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">public_html</code> agar web dapat diakses dengan domain permanen.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/SIM_BHP_DIST_HOSTING.zip"
                  download="SIM_BHP_DIST_HOSTING.zip"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer no-underline"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Paket Hosting (.ZIP)</span>
                </a>
                <a
                  href="/SIM_BHP_DIST_HOSTING.tar.gz"
                  download="SIM_BHP_DIST_HOSTING.tar.gz"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer no-underline"
                >
                  <Download className="w-4 h-4 text-slate-300" />
                  <span>Unduh (.tar.gz)</span>
                </a>
              </div>
            </div>

            {/* Langkah Detail Niagahoster */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="text-xs font-black text-slate-900">Unduh Paket ZIP</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Klik tombol <strong>"Unduh Paket Hosting (.ZIP)"</strong> di atas. File tersebut berisi seluruh program HTML, CSS, JavaScript, Barcode Scanner, dan file <code className="font-mono text-emerald-800 font-bold">.htaccess</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="text-xs font-black text-slate-900">Buka cPanel Niagahoster</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Login ke cPanel Niagahoster Anda, lalu buka menu <strong>File Manager</strong>. Masuk ke direktori utama website: <code className="font-mono text-emerald-800 font-bold">public_html</code> (atau subdomain yang Anda siapkan).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="text-xs font-black text-slate-900">Upload & Ekstrak</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Klik menu <strong>Upload</strong> di File Manager, pilih file <strong>SIM_BHP_DIST_HOSTING.zip</strong>. Setelah 100% selesai, klik kanan file zip tersebut dan pilih <strong>Extract</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  4
                </div>
                <h4 className="text-xs font-black text-slate-900">Web Siap Digunakan!</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Buka nama domain Anda di browser PC atau HP. File <code className="font-mono text-emerald-800 font-bold">.htaccess</code> yang sudah terpasang otomatis mencegah error 404 saat pengguna refresh halaman.
                </p>
              </div>
            </div>
          </div>

          {/* 3. PANDUAN HOSTING VIA GITHUB & VERCEL / GITHUB PAGES (GRATIS & PERMANEN) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Hosting Permanen Gratis via GitHub (sim-bhp-puskesmas-petang1)</h3>
                  <p className="text-xs text-slate-500">
                    Sangat direkomendasikan untuk skripsi: Online 24 jam nonstop, otomatis HTTPS SSL gratis, dan bebas biaya bulanan.
                  </p>
                </div>
              </div>

              <a
                href="/SIM_BHP_SOURCE_CODE.zip"
                download="SIM_BHP_SOURCE_CODE.zip"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer no-underline"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Unduh Source Code Lengkap (.ZIP)</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cara 1: Terminal Git */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Pilihan A: Push lewat Terminal / Git Bash</span>
                  <button
                    onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "SIM-BHP UPTD Puskesmas Petang I"\ngit branch -M main\ngit remote add origin https://github.com/USERNAME/sim-bhp-puskesmas-petang1.git\ngit push -u origin main`, 'git_cmd')}
                    className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'git_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'git_cmd' ? 'Tersalin' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ekstrak file zip, buka terminal di folder tersebut, lalu jalankan perintah berikut (ganti <strong>USERNAME</strong> dengan username GitHub Anda):
                </p>
                <pre className="p-2.5 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
{`git init
git add .
git commit -m "SIM-BHP UPTD Puskesmas Petang I"
git branch -M main
git remote add origin https://github.com/USERNAME/sim-bhp-puskesmas-petang1.git
git push -u origin main`}
                </pre>
              </div>

              {/* Cara Mengaktifkan GitHub Pages */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                <span className="text-xs font-black text-emerald-950">Cara Mengaktifkan Web agar Langsung Live di GitHub:</span>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Buka repository Anda di GitHub: <code className="font-mono font-bold text-emerald-900">sim-bhp-puskesmas-petang1</code>.</li>
                  <li>Buka menu <strong>Settings</strong> di bagian atas repository.</li>
                  <li>Di menu sebelah kiri, klik <strong>Pages</strong>.</li>
                  <li>Pada bagian <strong>Build and deployment &gt; Source</strong>:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-600">
                      <li>Pilih <strong>GitHub Actions</strong> (Alur kerja otomatis yang sudah kami siapkan di <code className="font-mono text-emerald-800">.github/workflows/deploy.yml</code> akan langsung membangun web Anda otomatis!).</li>
                    </ul>
                  </li>
                  <li>Tunggu 1-2 menit hingga proses build selesai. Web Anda akan aktif di alamat:
                    <div className="mt-1 p-2 rounded bg-white border border-emerald-300 font-mono text-[11px] font-bold text-emerald-800 break-all">
                      https://[username].github.io/sim-bhp-puskesmas-petang1/
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* 4. BASIS DATA MYSQL XAMPP (UNTUK KEPERLUAN DOSEN PENGUJI) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Database className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Database Engine MySQL &amp; XAMPP phpMyAdmin</h3>
                  <p className="text-xs text-slate-500">
                    Sesuai instruksi Dosen Penguji untuk laporan skripsi: Struktur relasional tabel `barang`, `penerimaan`, `pengeluaran`, dan `users`.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadSQL}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File db_sim_bhp.sql</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Langkah Import di XAMPP Lokal:</h4>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Buka <strong>XAMPP Control Panel</strong> dan aktifkan modul <em>Apache</em> serta <em>MySQL</em>.</li>
                  <li>Buka browser: <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-emerald-800 font-bold">http://localhost/phpmyadmin</code></li>
                  <li>Buat database baru dengan nama: <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-emerald-800 font-bold">db_sim_bhp</code>.</li>
                  <li>Buka tab <strong>Import</strong>, pilih file <strong>db_sim_bhp.sql</strong> yang Anda unduh, lalu klik <strong>Kirim / Go</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs text-amber-950 leading-relaxed">
                <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Jawaban Terbaik Saat Sidang Skripsi:</span>
                </h4>
                <p>
                  "Sistem Informasi Persediaan BHP UPTD Puskesmas Petang I mengimplementasikan konsep <em>Hybrid Architecture</em>:
                  Data transaksional dapat disimpan secara relasional menggunakan <strong>MySQL (XAMPP / cPanel)</strong> untuk integritas data ACID, 
                  sekaligus terintegrasi dengan <strong>Google Drive Spreadsheet</strong> melalui Cloud Webhook agar manajemen Puskesmas dapat memonitor stok obat dan BHP secara <em>real-time</em> dari perangkat mobile tanpa harus berada di jaringan lokal."
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: DAFTAR AKUN PENGGUNA (HANYA ADMIN & PEGAWAI) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Daftar Akun Pengguna Terdaftar (Admin & Pegawai)</h3>
              <p className="text-xs text-slate-500">Sistem hanya mengaktifkan 2 hak akses resmi: Administrator dan Pegawai Logistik</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Kata Sandi</th>
                  <th className="py-2.5 px-3">NIP</th>
                  <th className="py-2.5 px-3">Jabatan</th>
                  <th className="py-2.5 px-3">Hak Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allowedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{u.nama}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-800">{u.username}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{u.password || u.username}</td>
                    <td className="py-3 px-3 text-slate-500">{u.nip}</td>
                    <td className="py-3 px-3 text-slate-600">{u.jabatan}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role === 'admin' ? 'ADMIN' : 'PEGAWAI'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
