import React, { useState } from 'react';
import { X, Printer, Grid, FileCheck } from 'lucide-react';
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
  const [printCount, setPrintCount] = useState<number>(6);
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');

  if (!isOpen) return null;

  const targetBarangList = (printMode === 'single' && barang)
    ? Array.from({ length: printCount }, () => barang)
    : (allBarang.length > 0 ? allBarang : (barang ? [barang] : []));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-800/20">
        
        {/* Modal Header (No Print) */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl">
              <Printer className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Cetak Stiker Label Barcode Barang BHP</h3>
              <p className="text-xs text-emerald-300">Format stiker siap tempel pada kemasan / fisik barang BHP</p>
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPrintMode('single')}
                className={`px-3 py-1.5 rounded-md font-semibold ${
                  printMode === 'single' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 Barang (Multiple Label)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('batch')}
                className={`px-3 py-1.5 rounded-md font-semibold ${
                  printMode === 'batch' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Barang Katalog
              </button>
            </div>

            {printMode === 'single' && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600">Jumlah Cetak Label:</span>
                <select
                  value={printCount}
                  onChange={(e) => setPrintCount(Number(e.target.value))}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none"
                >
                  <option value={1}>1 Label</option>
                  <option value={2}>2 Label</option>
                  <option value={4}>4 Label</option>
                  <option value={6}>6 Label (Setengah Lembar)</option>
                  <option value={12}>12 Label (1 Lembar Penuh)</option>
                  <option value={24}>24 Label (2 Lembar)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
          </div>
        </div>

        {/* Printable Label Grid Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
          <div className="max-w-2xl mx-auto bg-white p-6 shadow-sm border border-slate-200 rounded-lg print:shadow-none print:border-none print:p-0">
            
            {/* Sheet Title preview */}
            <div className="mb-4 text-center border-b pb-2 no-print">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pratinjau Lembar Cetak Label Stiker Barcode
              </p>
              <p className="text-[11px] text-slate-500">
                Gunakan kertas stiker A4 / label berperekat (Ukuran per stiker 6.5 cm x 3.8 cm)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {targetBarangList.map((item, index) => {
                const barcodeSvg = generateBarcodeSVG(item.kode, 260, 65);
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="border-2 border-dashed border-slate-400 p-3 rounded-lg bg-white flex flex-col justify-between text-left relative overflow-hidden"
                    style={{ minHeight: '135px' }}
                  >
                    {/* Header stiker */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <LogoBadung className="w-5 h-5 shrink-0 object-contain" />
                        <LogoPuskesmas className="w-5 h-5 shrink-0 object-contain" />
                        <div className="leading-tight">
                          <p className="text-[9px] font-black uppercase text-emerald-900 tracking-tight">
                            {kop.namaPuskesmas}
                          </p>
                          <p className="text-[7.5px] font-bold text-slate-500 uppercase">
                            PERSEDIAAN BHP
                          </p>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                        {item.kategori}
                      </span>
                    </div>

                    {/* Nama Barang */}
                    <div className="mb-1">
                      <h5 className="font-bold text-slate-900 text-xs line-clamp-1 leading-snug">
                        {item.nama}
                      </h5>
                      <div className="flex items-center justify-between text-[9px] text-slate-600 mt-0.5">
                        <span>Satuan: <strong>{item.satuan}</strong></span>
                        <span>Lokasi: <strong>{item.lokasiRak || '-'}</strong></span>
                      </div>
                    </div>

                    {/* Barcode SVG */}
                    <div 
                      className="my-0.5 flex justify-center"
                      dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                    />
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Footer (No Print) */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 no-print">
          <span>Stiker ini kompatibel dengan scanner kamera handphone dan scanner laser USB.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
