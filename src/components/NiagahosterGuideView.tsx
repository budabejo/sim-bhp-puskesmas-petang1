import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  Server, 
  Globe, 
  ExternalLink, 
  Terminal, 
  FileCode, 
  FolderTree,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Barang, PenerimaanBarang, PengeluaranBarang } from '../types';
import { generateMySQLDump } from '../utils/sqlExporter';

interface Props {
  listBarang: Barang[];
  listPenerimaan: PenerimaanBarang[];
  listPengeluaran: PengeluaranBarang[];
}

export const NiagahosterGuideView: React.FC<Props> = ({
  listBarang,
  listPenerimaan,
  listPengeluaran
}) => {
  const [copied, setCopied] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const sampleEnv = `APP_NAME="SIM-BHP Puskesmas"
APP_ENV=production
APP_KEY=base64:your_app_key_here
APP_DEBUG=false
APP_URL=https://sim-bhp.puskesmas-anda.sch.id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u1234567_sim_bhp
DB_USERNAME=u1234567_dbuser
DB_PASSWORD=PasswordKuatNiagahoster#2026`;

  const sampleLaravelController = `<?php
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\Barang;
use App\\Models\\PenerimaanBarang;
use App\\Models\\PengeluaranBarang;

class PersediaanController extends Controller
{
    // Mengambil rekapan kartu stok mutasi
    public function kartuStok($barangId)
    {
        $barang = Barang::findOrFail($barangId);
        $penerimaan = PenerimaanBarang::where('barang_id', $barangId)->get();
        $pengeluaran = PengeluaranBarang::where('barang_id', $barangId)->get();

        return view('bhp.kartu_stok', compact('barang', 'penerimaan', 'pengeluaran'));
    }

    // Input pengeluaran & kirim notif WhatsApp jika stok <= 5
    public function simpanPengeluaran(Request $request)
    {
        $barang = Barang::findOrFail($request->barang_id);
        
        if ($request->jumlah_keluar > $barang->stok_saat_ini) {
            return back()->with('error', 'Stok tidak mencukupi!');
        }

        $sisa = $barang->stok_saat_ini - $request->jumlah_keluar;
        $barang->stok_saat_ini = $sisa;
        $barang->save();

        PengeluaranBarang::create([
            'no_bukti' => $request->no_bukti,
            'tanggal' => $request->tanggal,
            'barang_id' => $barang->id,
            'satuan' => $barang->satuan,
            'harga_satuan' => $barang->harga_satuan,
            'stok_awal' => $request->stok_awal,
            'jumlah_keluar' => $request->jumlah_keluar,
            'sisa_stok' => $sisa,
            'total_harga' => $request->jumlah_keluar * $barang->harga_satuan,
            'tujuan_ruangan' => $request->tujuan_ruangan,
            'penerima' => $request->penerima,
            'keterangan' => $request->keterangan
        ]);

        return redirect()->route('bhp.pengeluaran')->with('success', 'Pengeluaran dicatat.');
    }
}`;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paket Integrasi XAMPP, MySQL & Hosting Niagahoster</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Panduan Deployment XAMPP & Niagahoster
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1">
              Aplikasi SIM-BHP ini dapat langsung Anda gunakan di browser ini, atau diekspor ke database MySQL 
              untuk di-deploy pada server Apache XAMPP lokal maupun Cloud Web Hosting Niagahoster cPanel.
            </p>
          </div>

          <button
            onClick={handleDownloadSQL}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Unduh db_sim_bhp.sql</span>
          </button>
        </div>
      </div>

      {/* 4 Step Deployment Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Step 1: XAMPP & MySQL Import */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Lokal Komputer: XAMPP & phpMyAdmin</h3>
              <p className="text-xs text-slate-500">Persiapan database di komputer puskesmas</p>
            </div>
          </div>
          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
            <li>Nyalakan modul <strong>Apache</strong> dan <strong>MySQL</strong> pada XAMPP Control Panel.</li>
            <li>Buka browser, akses <code>http://localhost/phpmyadmin</code>.</li>
            <li>Buat database baru bernama <code>db_sim_bhp_puskesmas</code>.</li>
            <li>Klik tab <strong>Import</strong>, lalu pilih file <code>db_sim_bhp_puskesmas.sql</code> yang Anda unduh di atas.</li>
            <li>Klik <strong>Go / Kirim</strong>. Seluruh tabel dan data master barang BLUD siap digunakan!</li>
          </ol>
        </div>

        {/* Step 2: Niagahoster cPanel Hosting */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-sm">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Online Hosting: Niagahoster cPanel</h3>
              <p className="text-xs text-slate-500">Agar bisa diakses oleh seluruh staf via internet</p>
            </div>
          </div>
          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
            <li>Login ke Member Area Niagahoster &gt; Masuk ke <strong>cPanel</strong>.</li>
            <li>Buka menu <strong>MySQL Databases</strong>, buat database dan user database baru.</li>
            <li>Buka menu <strong>phpMyAdmin</strong> di cPanel, lalu import file <code>db_sim_bhp_puskesmas.sql</code>.</li>
            <li>Buka <strong>File Manager</strong> &gt; folder <code>public_html</code> (atau subdomain).</li>
            <li>Unggah source code dan sesuaikan file <code>.env</code> sesuai kredensial database.</li>
          </ol>
        </div>

        {/* Step 3: Konfigurasi .env Laravel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Konfigurasi Koneksi Database (.env)</h3>
                <p className="text-xs text-slate-500">Salin konfigurasi ini ke file .env Laravel di Niagahoster</p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(sampleEnv, 'env')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200"
            >
              {copied === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'env' ? 'Tersalin!' : 'Salin .env'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-emerald-400 font-mono-code text-xs rounded-xl overflow-x-auto">
            {sampleEnv}
          </pre>
        </div>

        {/* Step 4: Preview Controller Laravel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-extrabold flex items-center justify-center text-sm">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Logic Controller Laravel (Mutasi Stok & Logika Sisa)</h3>
                <p className="text-xs text-slate-500">Standar perhitungan kartu stok kumulatif dan pengeluaran barang</p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(sampleLaravelController, 'controller')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200"
            >
              {copied === 'controller' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'controller' ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-200 font-mono-code text-xs rounded-xl overflow-x-auto max-h-60">
            {sampleLaravelController}
          </pre>
        </div>

      </div>

    </div>
  );
};
