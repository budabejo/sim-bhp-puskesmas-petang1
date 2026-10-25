import React, { useState } from 'react';
import { X, Printer, Check, Copy } from 'lucide-react';
import { Barang, KopPuskesmas } from '../types';
import { generateBarcodeSVG } from '../utils/barcode';
import { LogoBadung } from './logos/LogoBadung';
import { LogoPuskesmas } from './logos/LogoPuskesmas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  barang: Barang | null;
  allBarang?: Barang[];
  kop: KopPuskesmas;
}

export const PrintLabelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  barang,
  allBarang = [],
  kop
}) => {
  // Always strictly default to 1 label as requested: "bisa ga satu aja biar cetak barcode jadi rapi"
  const [printCount, setPrintCount] = useState<number>(1);
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');
  const [copied, setCopied] = useState(false);

  // Reset to strictly 1 label whenever modal opens or new item is added
  React.useEffect(() => {
    if (isOpen) {
      setPrintMode('single');
      setPrintCount(1);
    }
  }, [isOpen, barang?.id]);

  if (!isOpen) return null;

  // Single mode: exactly 1 barcode (or chosen count for this specific item)
  const targetBarangList = (printMode === 'single')
    ? (barang ? Array.from({ length: printCount }, () => barang) : [])
    : (allBarang.length > 0 ? allBarang : (barang ? [barang] : []));

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    if (barang?.kode) {
      navigator.clipboard.writeText(barang.kode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-emerald-800/20 print:shadow-none print:border-none print:max-w-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Modal Header (No Print) */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl">
              <Printer className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Cetak Stiker Label Barcode Barang BHP</h3>
              <p className="text-xs text-emerald-300">
                {barang ? `Barang: ${barang.nama} (${barang.kode})` : 'Format stiker siap tempel pada kemasan / fisik barang BHP'}
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

        {/* Modal Controls (No Print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setPrintMode('single');
                  setPrintCount(1);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  printMode === 'single' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 Barang Ini
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('batch')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  printMode === 'batch' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Barang Katalog
              </button>
            </div>

            {printMode === 'single' && (
              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                <span className="font-medium text-slate-600">Jumlah Label:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 4, 6, 12].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setPrintCount(cnt)}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                        printCount === cnt
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={cnt === 1 ? '1 Label (Paling Rapi & Standar)' : `${cnt} Label`}
                    >
                      {cnt === 1 ? '1 Label (Rapi)' : cnt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {barang && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                title="Salin Kode Barcode ke Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Barcode ({printMode === 'single' ? `${printCount} Label` : `${targetBarangList.length} Label`})</span>
            </button>
          </div>
        </div>

        {/* Printable Label Grid Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          <div className={`mx-auto bg-white p-4 sm:p-6 shadow-sm border border-slate-200 rounded-xl print:shadow-none print:border-none print:p-0 ${
            targetBarangList.length === 1 ? 'max-w-md' : 'max-w-2xl'
          }`}>
            
            {/* Sheet Title preview */}
            <div className="mb-4 text-center border-b pb-2 no-print">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pratinjau Lembar Cetak Label Stiker Barcode
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {targetBarangList.length === 1 
                  ? 'Format 1 Label Tunggal (Tersedia garis potong rapi untuk ditempel di fisik barang)' 
                  : `Format ${targetBarangList.length} Label Stiker (Kertas Label A4 / Tom & Jerry)`}
              </p>
            </div>

            <div className={`grid gap-4 print:gap-3 ${
              targetBarangList.length === 1 
                ? 'grid-cols-1 max-w-sm mx-auto' 
                : 'grid-cols-1 sm:grid-cols-2'
            }`}>
              {targetBarangList.map((item, index) => {
                const barcodeSvg = generateBarcodeSVG(item.kode, 260, 65);
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="border-2 border-dashed border-slate-400 p-3 rounded-lg bg-white flex flex-col justify-between text-left relative overflow-hidden print:border-slate-800 print:border-solid print:border print:rounded-md print:break-inside-avoid shadow-sm print:shadow-none"
                    style={{ minHeight: '140px' }}
                  >
                    {/* Header stiker dengan Logo Pemda Badung & Logo Puskesmas */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                      <div className="flex items-center gap-2">
                        <LogoBadung className="w-6 h-6 shrink-0 object-contain" />
                        <LogoPuskesmas className="w-6 h-6 shrink-0 object-contain" />
                        <div className="leading-tight">
                          <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tight">
                            KABUPATEN BADUNG
                          </p>
                          <p className="text-[9.5px] font-black uppercase text-emerald-900 tracking-tight">
                            {kop.namaPuskesmas}
                          </p>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                        {item.kategori}
                      </span>
                    </div>

                    {/* Nama Barang & Info */}
                    <div className="mb-1">
                      <h5 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                        {item.nama}
                      </h5>
                      <div className="flex items-center justify-between text-[9px] text-slate-600 mt-1">
                        <span>Satuan: <strong className="text-slate-800">{item.satuan}</strong></span>
                        <span>Lokasi: <strong className="text-slate-800">{item.lokasiRak || 'Gudang BHP'}</strong></span>
                        <span className="text-emerald-700 font-semibold">BLUD</span>
                      </div>
                    </div>

                    {/* Barcode SVG Otomatis */}
                    <div 
                      className="my-1 flex justify-center bg-white py-0.5"
                      dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                    />

                    {/* Cut guideline indication */}
                    <div className="flex items-center justify-between text-[7px] text-slate-400 border-t border-slate-100 pt-0.5 mt-0.5 font-mono">
                      <span>SIM-BHP PUSKESMAS PETANG I</span>
                      <span>✂ TEMPEL DI KEMASAN</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Footer (No Print) */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Default 1 label stiker rapi. Kompatibel scanner kamera HP & scanner USB.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
