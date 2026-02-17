'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleSelector } from './RoleSelector';
import { UserRole } from '@/types';
import { Loader2, ArrowRight, CheckCircle2, User, Mail, Phone, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'role' | 'details' | 'success';

export function RegisterForm() {
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<UserRole>('parent');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatWhatsappNumber = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (numeric.startsWith('0')) {
      return '+62' + numeric.slice(1);
    }
    if (numeric.startsWith('62') && !numeric.startsWith('+')) {
      return '+' + numeric;
    }
    return numeric.startsWith('+') ? numeric : '+62' + numeric;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsappNumber(e.target.value);
    setWhatsapp(formatted);
    setError(null);
  };

  const validateDetails = () => {
    if (!name.trim()) {
      setError('Nama lengkap wajib diisi');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Email tidak valid');
      return false;
    }
    if (whatsapp.length < 10) {
      setError('Nomor WhatsApp tidak valid');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateDetails()) return;

    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        phone: whatsapp,
        password: Math.random().toString(36).slice(-8),
      });

      if (authError || !authData.user) {
        setError(authError?.message || 'Gagal membuat akun');
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        name: name.trim(),
        email: email.trim(),
        whatsapp,
        role,
      });

      if (profileError) {
        setError(profileError.message);
      } else {
        setStep('success');
        setTimeout(() => {
          window.location.href = role === 'tutor' ? '/tutor/dashboard' : '/parent/search';
        }, 1500);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
          step === 'role' ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"
        )}>
          {step === 'role' ? '1' : <CheckCircle2 className="w-4 h-4" />}
        </div>
        <div className={cn(
          "w-12 h-1 rounded-full transition-colors",
          step === 'role' ? "bg-slate-200" : "bg-emerald-500"
        )} />
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
          step === 'details' ? "bg-indigo-600 text-white" :
          step === 'success' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
        )}>
          {step === 'success' ? <CheckCircle2 className="w-4 h-4" /> : '2'}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {step === 'role' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Pilih Peran Anda</h3>
              <p className="text-sm text-slate-500">
                Bagaimana Anda ingin menggunakan LesGo?
              </p>
            </div>

            <RoleSelector value={role} onChange={setRole} />

            <Button
              onClick={() => setStep('details')}
              className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600"
            >
              Lanjutkan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-xs text-center text-slate-400">
              Anda dapat mengubah peran kapan saja di pengaturan akun
            </p>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Lengkapi Data Anda</h3>
              <p className="text-sm text-slate-500">
                Daftar sebagai {role === 'parent' ? 'Orang Tua' : 'Guru'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  placeholder="Nama lengkap Anda"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="email@example.com"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Nomor WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  placeholder="+6281234567890"
                  className="h-11"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {error}
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <button
              onClick={() => setStep('role')}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              Kembali ke pemilihan peran
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Pendaftaran Berhasil!</h3>
            <p className="text-slate-500">
              Selamat datang di LesGo! Mengalihkan ke halaman utama...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
