import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { LogoBadung } from './logos/LogoBadung';
import { LogoPuskesmas } from './logos/LogoPuskesmas';
import { UserProfile } from '../types';

interface Props {
  allUsers: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginView: React.FC<Props> = ({ allUsers, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Harap isi nama pengguna (username) dan kata sandi (password).');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Periksa kecocokan user dan password dari daftar allUsers
      const matched = allUsers.find(u => {
        const uName = u.username.toLowerCase();
        const expectedPass = u.password || (uName === 'admin' ? 'admin' : uName === 'user' ? 'user' : uName);
        return (uName === cleanUser || (cleanUser === 'pegawai' && uName === 'user')) && cleanPass === expectedPass;
      });

      if (matched) {
        setIsLoading(false);
        onLoginSuccess(matched);
        return;
      }

      // Default fallback jika admin/admin atau user/user
      if (cleanUser === 'admin' && cleanPass === 'admin') {
        const adminUser = allUsers.find(u => u.username === 'admin') || {
          id: 'user-1',
          username: 'admin',
          password: 'admin',
          nama: 'I Ketut Buda Antara',
          jabatan: 'Pengurus Barang / Admin SIM-BHP',
          nip: '19930920 201802 1 003',
          role: 'admin',
          phone: '6281234567890'
        };
        setIsLoading(false);
        onLoginSuccess(adminUser);
        return;
      }

      if ((cleanUser === 'user' || cleanUser === 'pegawai') && (cleanPass === 'user' || cleanPass === 'pegawai')) {
        const staffUser = allUsers.find(u => u.username === 'user' || u.role === 'petugas') || {
          id: 'user-2',
          username: 'user',
          password: 'user',
          nama: 'Pegawai Logistik Puskesmas',
          jabatan: 'Petugas Pengelola Gudang BHP',
          nip: '19950110 202012 1 002',
          role: 'petugas',
          phone: '6285712345678'
        };
        setIsLoading(false);
        onLoginSuccess(staffUser);
        return;
      }

      setIsLoading(false);
      setErrorMessage('Username atau Password salah! Periksa kembali data login Anda.');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#062017] to-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Decorative background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-10 right-1/3 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl shadow-emerald-950/60 p-6 sm:p-8">
          
          {/* Header Branding */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            {/* Dual Logos */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-md shadow-slate-200/60">
                <LogoBadung className="w-full h-full object-contain" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-md shadow-slate-200/60">
                <LogoPuskesmas className="w-full h-full object-contain" />
              </div>
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-black tracking-wide border border-emerald-300 shadow-2xs mb-1.5">
                UPTD PUSKESMAS PETANG I
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                SIM-BHP
              </h1>
              <p className="text-xs text-slate-600 font-semibold max-w-xs mx-auto leading-relaxed mt-1">
                Sistem Informasi Persediaan Barang Habis Pakai ( BHP )
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            
            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-hidden"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-hidden"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer Security Badges */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sistem Informasi Logistik Resmi Puskesmas • Aman & Terenkripsi</span>
          </div>

        </div>

      </div>
    </div>
  );
};
