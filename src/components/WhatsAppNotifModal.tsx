import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  AlertTriangle, 
  ShieldAlert, 
  PhoneCall,
  Users,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Barang, KopPuskesmas } from '../types';
import { formatTanggalIndo } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listBarang: Barang[];
  kop: KopPuskesmas;
  onUpdateKop: (newKop: KopPuskesmas) => void;
}

export const WhatsAppNotifModal: React.FC<Props> = ({
  isOpen,
  onClose,
  listBarang,
  kop,
  onUpdateKop
}) => {
  const [copied, setCopied] = useState(false);
  
  // Available 5 numbers from kop
  const phoneList: { label: string; number: string }[] = [
    { label: '1. Pengurus Barang (Admin)', number: kop.nomorWhatsAppList?.[0] || kop.nomorWhatsAppNotif || '6281234567890' },
    { label: '2. Kepala Puskesmas (KAPUSK)', number: kop.nomorWhatsAppList?.[1] || '6281398765432' },
    { label: '3. Pegawai Logistik Gudang', number: kop.nomorWhatsAppList?.[2] || '6285712345678' },
    { label: '4. Nomor Cadangan 1', number: kop.nomorWhatsAppList?.[3] || '' },
    { label: '5. Nomor Cadangan 2', number: kop.nomorWhatsAppList?.[4] || '' }
  ].filter(p => p.number.trim().length > 0);

  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(0);

  if (!isOpen) return null;

  const currentTargetNumber = phoneList[selectedPhoneIndex]?.number || kop.nomorWhatsAppNotif || '6281234567890';

  // Filter items whose current stock <= 5
  const criticalItems = listBarang.filter(b => b.stokSaatIni <= (b.stokMinimum || 5));

  const formatSingleMessage = (b: Barang) => {
    return encodeURIComponent(
`🚨 *PERINGATAN STOK KRITIS BHP* 🚨
*${(kop.namaPuskesmas || 'UPTD PUSKESMAS PETANG I').toUpperCase()}*

Yth. Tim Pengelola BHP / Pimpinan,
Mohon perhatian, stok barang berikut telah mencapai batas minimum:

📦 *Nama Barang:* ${b.nama}
🏷️ *Kode / Barcode:* ${b.kode}
📂 *Kategori:* ${b.kategori}
📊 *Sisa Stok Saat Ini:* ${b.stokSaatIni} ${b.satuan} (Ambang Batas: ${b.stokMinimum || 5} ${b.satuan})
📍 *Lokasi Penyimpanan:* ${b.lokasiRak || '-'}

Harap segera direncanakan pengadaan persediaan berikutnya melalui anggaran BLUD Puskesmas. Terima kasih.
_Sistem Informasi Manajemen Persediaan BHP Puskesmas Petang I_`
    );
  };

  const getBroadcastMessageText = () => {
    const today = formatTanggalIndo(new Date().toISOString().split('T')[0]);
    const itemsList = criticalItems
      .map((b, idx) => `${idx + 1}. *${b.nama}* [${b.kategori}] - Sisa: *${b.stokSaatIni} ${b.satuan}* (Min: ${b.stokMinimum || 5})`)
      .join('\n');

    return (
`🚨 *LAPORAN PERINGATAN STOK MINIMUM BHP (≤ 5 UNIT)* 🚨
*${(kop.namaPuskesmas || 'UPTD PUSKESMAS PETANG I').toUpperCase()}*
*Tanggal:* ${today}

Yth. Kepala UPTD Puskesmas & Tim Pengelola Barang BHP,
Berdasarkan sistem pemantauan real-time persediaan Barang Habis Pakai (BHP), terdapat *${criticalItems.length} item barang* yang telah mencapai ambang batas minimum (≤ 5 Pcs/Unit) atau habis:

${itemsList}

Mohon segera dilakukan verifikasi dan proses pengadaan belanja bahan habis pakai demi kelancaran operasional pelayanan kesehatan masyarakat.

Terima kasih.
_SIM-BHP Puskesmas Petang I_`
    );
  };

  const handleSendSingleWA = (b: Barang, customPhone?: string) => {
    const text = formatSingleMessage(b);
    const cleanPhone = (customPhone || currentTargetNumber).replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleSendBroadcastWA = (targetPhone?: string) => {
    const text = encodeURIComponent(getBroadcastMessageText());
    const cleanPhone = (targetPhone || currentTargetNumber).replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getBroadcastMessageText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-800/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl">
              <MessageSquare className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                Notifikasi WhatsApp Stok Minimum
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-600 text-white">
                  {criticalItems.length} Kritis
                </span>
              </h3>
              <p className="text-xs text-emerald-300">
                Peringatan otomatis ketersediaan barang ≤ 5 unit langsung ke WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Target Selector (5 Registered Numbers) */}
        <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <PhoneCall className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold text-emerald-950">Kirim Notif Ke:</span>
            <select
              value={selectedPhoneIndex}
              onChange={(e) => setSelectedPhoneIndex(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-bold text-emerald-900 text-xs shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {phoneList.map((item, idx) => (
                <option key={idx} value={idx}>
                  {item.label} (+{item.number})
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-[11px] text-emerald-800 font-medium">
            (Kelola 5 nomor ini di menu <strong>Pengaturan</strong>)
          </div>
        </div>

        {/* List of critical items */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {criticalItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <Check className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base">Semua Stok Barang Aman!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tidak ada barang dengan stok ≤ 5. Seluruh persediaan BHP saat ini berada di atas ambang batas minimum.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Daftar barang dengan stok ≤ 5 buah (Perlu Pengadaan Ulang Segera):</span>
                <span className="font-semibold text-amber-700">Ambang Batas: 0 - 5 Buah</span>
              </div>

              {criticalItems.map((b) => {
                const isHabis = b.stokSaatIni <= 0;
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                      isHabis 
                        ? 'bg-red-50/80 border-red-200 hover:border-red-300' 
                        : 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isHabis ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {isHabis ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code text-[11px] font-bold text-slate-600">
                            {b.kode}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-white rounded-full border border-slate-200 text-slate-600">
                            {b.kategori}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
                          {b.nama}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>Lokasi: {b.lokasiRak || '-'}</span>
                          <span>•</span>
                          <span className={`font-bold ${isHabis ? 'text-red-700' : 'text-amber-700'}`}>
                            Sisa Stok: {b.stokSaatIni} {b.satuan}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (Min: {b.stokMinimum || 5})
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendSingleWA(b)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim WA</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Preview text box */}
          {criticalItems.length > 0 && (
            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">Preview Pesan WhatsApp Resmi:</span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-slate-600 text-[11px] bg-white p-3 rounded-lg border border-slate-200 max-h-36 overflow-y-auto">
                {getBroadcastMessageText()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {criticalItems.length > 0 && (
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500">
              Notifikasi siap dikirimkan ke <strong>{phoneList[selectedPhoneIndex]?.label}</strong>.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Teks</span>
              </button>
              <button
                onClick={() => handleSendBroadcastWA()}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Semua ke WhatsApp (+{currentTargetNumber})</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
