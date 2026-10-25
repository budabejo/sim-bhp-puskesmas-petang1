import React, { useState } from 'react';
import { 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ArrowUpToLine, 
  ArrowDownToLine, 
  X, 
  Sparkles,
  Smartphone,
  Save,
  Link2
} from 'lucide-react';
import { 
  SPREADSHEET_URL, 
  SPREADSHEET_ID, 
  getEffectiveWebhookUrl, 
  isGoogleSheetsConnected,
  sendToGoogleAppsScriptWebhook,
  pullDataFromGoogleSheets,
  generateShareableLink
} from '../utils/googleSheetsSync';
import { Barang, PenerimaanBarang, PengeluaranBarang } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listBarang: Barang[];
  listPenerimaan: PenerimaanBarang[];
  listPengeluaran: PengeluaranBarang[];
  onUpdateAllData: (
    newBarang: Barang[],
    newPenerimaan: PenerimaanBarang[],
    newPengeluaran: PengeluaranBarang[]
  ) => void;
  onSyncSuccess?: () => void;
}

export const CloudSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  listBarang,
  listPenerimaan,
  listPengeluaran,
  onUpdateAllData,
  onSyncSuccess
}) => {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return getEffectiveWebhookUrl();
  });
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isConnected = isGoogleSheetsConnected();

  if (!isOpen) return null;

  const handleSaveAndSync = async () => {
    const cleanUrl = webhookUrl.trim();
    if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      setStatusMsg({
        type: 'error',
        text: 'URL Webhook harus diawali dengan "https://script.google.com/macros/s/..."'
      });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      localStorage.setItem('sim_bhp_gas_webhook', cleanUrl);
      const res = await sendToGoogleAppsScriptWebhook(
        cleanUrl,
        listBarang,
        listPenerimaan,
        listPengeluaran
      );

      setIsLoading(false);
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: '✅ Berhasil terhubung! Seluruh data saat ini telah otomatis tersimpan ke Google Drive Spreadsheet Anda.'
        });
        if (onSyncSuccess) onSyncSuccess();
      } else {
        setStatusMsg({
          type: 'error',
          text: res.message
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      setStatusMsg({
        type: 'error',
        text: `Koneksi gagal: ${err?.message || 'Cek koneksi internet Anda'}`
      });
    }
  };

  const handlePullData = async () => {
    const cleanUrl = webhookUrl.trim() || getEffectiveWebhookUrl();
    if (!cleanUrl) {
      setStatusMsg({
        type: 'error',
        text: 'Harap masukkan URL Webhook terlebih dahulu.'
      });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await pullDataFromGoogleSheets(cleanUrl);
      setIsLoading(false);
      if (res.success && res.data) {
        onUpdateAllData(res.data.barang, res.data.penerimaan, res.data.pengeluaran);
        setStatusMsg({
          type: 'success',
          text: `✅ Sinkronisasi berhasil! Memuat ${res.data.barang.length} barang dari Google Sheets.`
        });
        if (onSyncSuccess) onSyncSuccess();
      } else {
        setStatusMsg({
          type: 'error',
          text: res.message
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      setStatusMsg({
        type: 'error',
        text: `Gagal menarik data: ${err?.message || 'Pastikan izin web app adalah Anyone/Siapa Saja.'}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-b border-emerald-500/30 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Koneksi Google Spreadsheet</h2>
              <p className="text-[11px] text-emerald-200/80">UPTD Puskesmas Petang I</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-slate-200 text-xs flex-1">
          
          {/* Status Badge */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
            isConnected
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div>
                <p className="font-bold text-xs">
                  {isConnected ? 'Terhubung ke Google Drive' : 'Belum Terhubung di HP Ini'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isConnected 
                    ? 'Setiap transaksi baru di HP ini otomatis masuk ke Google Spreadsheet.' 
                    : 'Data yang diinput masih tersimpan di memori lokal HP Anda.'}
                </p>
              </div>
            </div>
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white shrink-0"
              title="Buka Spreadsheet di Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Feedback Message */}
          {statusMsg && (
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                : 'bg-red-500/20 border-red-400/50 text-red-200'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-semibold text-xs">{statusMsg.text}</span>
            </div>
          )}

          {/* Input Webhook URL */}
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>URL Webhook Google Apps Script:</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Tempelkan URL Webhook yang didapat saat Deploy Apps Script di Spreadsheet Anda:
            </p>
            <input 
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white placeholder-slate-500 font-mono focus:border-emerald-500 focus:outline-none"
            />
            
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSaveAndSync}
                disabled={isLoading}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Menghubungkan...' : 'Simpan ke Sheets'}</span>
              </button>
              <button
                onClick={handlePullData}
                disabled={isLoading}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Tarik Data Terbaru</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Kosongkan semua data di aplikasi preview (0 barang, 0 penerimaan, 0 pengeluaran)?')) {
                    onUpdateAllData([], [], []);
                    localStorage.setItem('sim_bhp_barang_v1', '[]');
                    localStorage.setItem('sim_bhp_penerimaan_v1', '[]');
                    localStorage.setItem('sim_bhp_pengeluaran_v1', '[]');
                    setStatusMsg({
                      type: 'success',
                      text: 'Seluruh data preview telah dikosongkan (0 data). Siap input dari awal.'
                    });
                  }
                }}
                disabled={isLoading}
                className="py-2.5 px-3 bg-red-600/80 hover:bg-red-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                title="Hapus data preview agar bersih untuk input dari awal"
              >
                <span>Kosongkan Preview</span>
              </button>
            </div>

            {/* Tombol Bagikan Link Siap Pakai Otomatis */}
            <div className="p-3 bg-gradient-to-r from-emerald-950 to-teal-950 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-emerald-300 block truncate">
                  Bagikan ke HP / Komputer Penguji Lain
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Langsung terhubung otomatis ke spreadsheet tanpa setting ulang
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const shareUrl = generateShareableLink(webhookUrl);
                  navigator.clipboard.writeText(shareUrl);
                  alert('✅ Link web siap pakai berhasil disalin!\n\nKirim link ini ke WhatsApp untuk dibuka di HP atau laptop penguji. Sistem langsung otomatis menampilkan data terbaru tanpa perlu setting atau copy script lagi!');
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg shadow shrink-0 active:scale-95 transition-all cursor-pointer"
              >
                Salin Link Siap Pakai
              </button>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              <span>Mengapa di HP belum masuk ke Google Spreadsheet?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Browser HP memiliki penyimpanan memori terpisah dari laptop. Cukup tempelkan URL Webhook sekali di kotak atas lalu tekan <strong>"Simpan & Kirim Data ke Sheets"</strong>. Setelah itu, setiap transaksi baru yang Anda simpan di HP akan otomatis masuk ke Google Drive Spreadsheet!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Spreadsheet: {SPREADSHEET_ID.substring(0, 12)}...
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
