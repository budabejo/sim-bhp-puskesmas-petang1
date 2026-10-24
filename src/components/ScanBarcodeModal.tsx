import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Keyboard, 
  RefreshCw, 
  MinusCircle, 
  Send,
  Building2,
  UserCheck
} from 'lucide-react';
import { Barang, KopPuskesmas, PengeluaranBarang, UserProfile } from '../types';
import { formatRupiah } from '../utils/formatters';
import { DAFTAR_RUANGAN } from '../data/initialData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listBarang: Barang[];
  onSelectBarangForPengeluaran: (barang: Barang) => void;
  onAddPengeluaran?: (item: PengeluaranBarang) => void;
  currentUser?: UserProfile;
  kop?: KopPuskesmas;
  onOpenWhatsAppModal?: () => void;
}

export const ScanBarcodeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  listBarang,
  onSelectBarangForPengeluaran,
  onAddPengeluaran,
  currentUser,
  kop,
  onOpenWhatsAppModal
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<Barang | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('');

  // Instant direct checkout states
  const [jumlahKeluar, setJumlahKeluar] = useState<number>(1);
  const [tujuanRuangan, setTujuanRuangan] = useState<string>(DAFTAR_RUANGAN[0] || 'Poli Umum');
  const [penerima, setPenerima] = useState<string>('Petugas Poli');
  const [directSuccessMessage, setDirectSuccessMessage] = useState<string>('');
  const [showCriticalAlert, setShowCriticalAlert] = useState<boolean>(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-barcode-reader';

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz beep
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio not supported or blocked
    }
  };

  const handleBarcodeDetected = (decodedText: string) => {
    const cleanText = decodedText.trim().toUpperCase();
    playBeep();

    // Match by code or ID or partial
    const matched = listBarang.find(
      b => b.kode.toUpperCase() === cleanText || b.id.toUpperCase() === cleanText
    );

    if (matched) {
      setScannedResult(matched);
      setJumlahKeluar(1);
      setDirectSuccessMessage('');
      setShowCriticalAlert(matched.stokSaatIni <= (matched.stokMinimum || 5));
      setScanMessage(`Barcode ditemukan: ${matched.nama} (Sisa Stok: ${matched.stokSaatIni} ${matched.satuan})`);
    } else {
      setScannedResult(null);
      setScanMessage(`Barcode "${decodedText}" tidak terdaftar dalam data barang BHP.`);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setScanMessage('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Back camera on mobile
        {
          fps: 15,
          qrbox: { width: 280, height: 160 }
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera failed:', err);
      setCameraError('Kamera tidak dapat diakses atau diblokir izinnya. Anda dapat menggunakan opsi Input Kode Manual / Scanner USB.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeDetected(manualCode);
  };

  const handleProceedToPengeluaran = () => {
    if (!scannedResult) return;
    stopScanner();
    onSelectBarangForPengeluaran(scannedResult);
    onClose();
  };

  // Instant 1-Click Direct Pengeluaran
  const handleDirectPengeluaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedResult || !onAddPengeluaran) return;

    if (jumlahKeluar <= 0) {
      alert('Jumlah pengeluaran minimal 1.');
      return;
    }

    if (jumlahKeluar > scannedResult.stokSaatIni) {
      alert(`Stok tidak mencukupi! Sisa stok saat ini hanya ${scannedResult.stokSaatIni} ${scannedResult.satuan}.`);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const sisa = scannedResult.stokSaatIni - jumlahKeluar;
    const newPengeluaran: PengeluaranBarang = {
      id: `OUT-${Date.now()}`,
      noBukti: `BK-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      tanggal: todayStr,
      barangId: scannedResult.id,
      namaBarang: scannedResult.nama,
      kategori: scannedResult.kategori,
      satuan: scannedResult.satuan,
      hargaSatuan: scannedResult.hargaSatuan,
      stokAwal: scannedResult.stokSaatIni,
      jumlahKeluar: jumlahKeluar,
      sisaStok: sisa,
      totalHarga: jumlahKeluar * scannedResult.hargaSatuan,
      tujuanRuangan: tujuanRuangan,
      penerima: penerima || 'Petugas Ruangan',
      keterangan: `Pengeluaran Cepat via Scan Barcode HP (Petugas: ${currentUser?.nama || 'Petugas BHP'})`
    };

    onAddPengeluaran(newPengeluaran);
    playBeep();

    // Update scannedResult locally so user sees immediate deduction
    const updatedBarang = { ...scannedResult, stokSaatIni: sisa };
    setScannedResult(updatedBarang);

    setDirectSuccessMessage(
      `Berhasil dikeluarkan ${jumlahKeluar} ${scannedResult.satuan} ke ${tujuanRuangan}. Stok otomatis berkurang menjadi ${sisa} ${scannedResult.satuan}.`
    );

    if (sisa <= (scannedResult.stokMinimum || 5)) {
      setShowCriticalAlert(true);
    }
  };

  // Trigger WhatsApp send directly for critical item
  const handleSendWAAlert = () => {
    if (!scannedResult) return;
    const cleanPhone = (kop?.nomorWhatsAppList?.[0] || kop?.nomorWhatsAppNotif || '6281234567890').replace(/\D/g, '');
    const text = encodeURIComponent(
      `🚨 *PERINGATAN STOK MINIMUM OTOMATIS (SCAN HP)* 🚨\n` +
      `*${(kop?.namaPuskesmas || 'UPTD PUSKESMAS PETANG I').toUpperCase()}*\n\n` +
      `Barang Habis Pakai berikut baru saja dikeluarkan dan telah mencapai batas minimum:\n\n` +
      `📦 *Nama Barang:* ${scannedResult.nama}\n` +
      `🏷️ *Kode Barcode:* ${scannedResult.kode}\n` +
      `📊 *Sisa Stok Terkini:* ${scannedResult.stokSaatIni} ${scannedResult.satuan} (Ambang Batas: ${scannedResult.stokMinimum || 5} ${scannedResult.satuan})\n` +
      `🏥 *Tujuan Distribusi:* ${tujuanRuangan}\n\n` +
      `Mohon segera diproses pengadaan persediaan berikutnya melalui BLUD Puskesmas. Terima kasih.\n` +
      `_SIM-BHP Puskesmas Petang I_`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-800/30">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
              <Camera className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                Scan Barcode Pengeluaran HP
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  Otomatis
                </span>
              </h3>
              <p className="text-xs text-emerald-300/90">
                Pindai barcode kamera HP, stok dan kartu stok otomatis berkurang
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => {
              setActiveTab('camera');
              setScannedResult(null);
              setDirectSuccessMessage('');
            }}
            className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Kamera HP (Live Scan)</span>
          </button>
          <button
            onClick={() => {
              stopScanner();
              setActiveTab('manual');
              setScannedResult(null);
              setDirectSuccessMessage('');
            }}
            className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Ketik Kode / Scanner USB</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'camera' ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border-2 border-emerald-600/40 shadow-inner">
                <div id={scannerContainerId} className="w-full h-full"></div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                    <p className="text-xs text-white font-medium mb-3">{cameraError}</p>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                    >
                      Beralih ke Input Manual / USB
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Arahkan kamera HP ke garis barcode label barang</span>
                <button
                  onClick={() => {
                    stopScanner();
                    startScanner();
                  }}
                  className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart Kamera</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSearch} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ketik Kode Barcode atau Tembak Scanner USB
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Contoh: BHP-ATK-001..."
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-mono-code font-bold"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    Cari
                  </button>
                </div>
              </div>

              {/* Sample barcode chips to click directly */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-medium">Uji Coba Cepat (Klik Contoh Barcode):</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {listBarang.slice(0, 5).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setManualCode(b.kode);
                        handleBarcodeDetected(b.kode);
                      }}
                      className="text-[11px] font-mono-code px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 cursor-pointer"
                    >
                      {b.kode}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Success Banner when stock deducted */}
          {directSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{directSuccessMessage}</span>
            </div>
          )}

          {/* Scanned Result Card & Instant Pengeluaran */}
          {scannedResult ? (
            <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-2xl space-y-3.5 animate-in fade-in zoom-in-95">
              
              {/* Item Info Header */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-emerald-800 px-2.5 py-0.5 bg-white rounded-lg border border-emerald-300 shadow-2xs">
                      {scannedResult.kode}
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      scannedResult.stokSaatIni <= 0 
                        ? 'bg-red-100 text-red-800 border border-red-300' 
                        : scannedResult.stokSaatIni <= (scannedResult.stokMinimum || 5)
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      Sisa Stok: {scannedResult.stokSaatIni} {scannedResult.satuan}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm mt-1.5">{scannedResult.nama}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Kategori: <strong>{scannedResult.kategori}</strong> • Lokasi: <strong>{scannedResult.lokasiRak || '-'}</strong>
                  </p>
                  <p className="text-xs text-emerald-900 font-semibold mt-0.5">
                    Harga: {formatRupiah(scannedResult.hargaSatuan)} / {scannedResult.satuan}
                  </p>
                </div>
              </div>

              {/* Critical Stock WhatsApp Alert Banner if stock <= 5 */}
              {showCriticalAlert && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Peringatan Stok Minimum: Sisa persediaan ≤ 5 {scannedResult.satuan}!</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendWAAlert}
                    className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Alert WhatsApp ke No. Pejabat / Pengurus</span>
                  </button>
                </div>
              )}

              {/* Instant Pengeluaran Form inside Modal */}
              {onAddPengeluaran && scannedResult.stokSaatIni > 0 && (
                <form onSubmit={handleDirectPengeluaran} className="p-3 bg-white rounded-xl border border-emerald-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Keluarkan Langsung Sekarang (Stok Otomatis Berkurang):</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Jumlah Keluar ({scannedResult.satuan})
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={scannedResult.stokSaatIni}
                        value={jumlahKeluar}
                        onChange={(e) => setJumlahKeluar(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Tujuan Ruangan / Poli
                      </label>
                      <select
                        value={tujuanRuangan}
                        onChange={(e) => setTujuanRuangan(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:border-emerald-600"
                      >
                        {DAFTAR_RUANGAN.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Simpan & Kurangi Stok Otomatis</span>
                  </button>
                </form>
              )}

              {/* Option to Open Full Form */}
              <button
                type="button"
                onClick={handleProceedToPengeluaran}
                className="w-full py-2 px-3 text-slate-600 hover:text-emerald-800 hover:bg-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-dashed border-slate-300"
              >
                <span>Buka di Halaman Form Pengeluaran Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          ) : scanMessage ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{scanMessage}</span>
            </div>
          ) : null}

        </div>

      </div>
    </div>
  );
};
