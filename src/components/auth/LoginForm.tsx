'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Smartphone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'phone' | 'otp' | 'success';

export function LoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<Step>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove non-numeric characters
    const numeric = value.replace(/\D/g, '');
    // Add +62 prefix if starts with 0
    if (numeric.startsWith('0')) {
      return '+62' + numeric.slice(1);
    }
    // Add + if starts with 62
    if (numeric.startsWith('62') && !numeric.startsWith('+')) {
      return '+' + numeric;
    }
    return numeric.startsWith('+') ? numeric : '+62' + numeric;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError(null);
  };

  const sendOtp = async () => {
    if (phone.length < 10) {
      setError('Nomor telepon tidak valid');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        setError(error.message);
      } else {
        setStep('otp');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        setError(error.message);
      } else {
        setStep('success');
        setTimeout(() => {
          window.location.href = '/parent/search';
        }, 1000);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOtp({ phone });
      setError(null);
    } catch (err) {
      setError('Gagal mengirim ulang kode');
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
          step === 'phone' ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"
        )}>
          {step === 'phone' ? '1' : <CheckCircle2 className="w-4 h-4" />}
        </div>
        <div className={cn(
          "w-12 h-1 rounded-full transition-colors",
          step === 'phone' ? "bg-slate-200" : "bg-emerald-500"
        )} />
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
          step === 'otp' ? "bg-indigo-600 text-white" :
          step === 'success' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
        )}>
          {step === 'success' ? <CheckCircle2 className="w-4 h-4" /> : '2'}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {step === 'phone' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Masuk dengan WhatsApp</h3>
              <p className="text-sm text-slate-500">
                Kami akan mengirimkan kode verifikasi ke nomor Anda
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-slate-700">
                Nomor WhatsApp
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+6281234567890"
                  className={cn(
                    "h-12 text-lg pl-4",
                    error && "border-red-500 focus:ring-red-500"
                  )}
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
              onClick={sendOtp}
              disabled={loading || phone.length < 10}
              className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  Kirim Kode OTP
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-slate-400">
              Dengan melanjutkan, Anda menyetujui Syarat dan Ketentuan kami
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Masukkan Kode OTP</h3>
              <p className="text-sm text-slate-500">
                Kode telah dikirim ke <span className="font-medium text-slate-700">{phone}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="otp" className="text-slate-700">
                Kode Verifikasi
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError(null);
                }}
                placeholder="123456"
                className={cn(
                  "h-12 text-2xl text-center tracking-[0.5em] font-semibold",
                  error && "border-red-500 focus:ring-red-500"
                )}
              />
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {error}
                </p>
              )}
            </div>

            <Button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Verifikasi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="text-center">
              <button
                onClick={resendOtp}
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
              >
                Kirim ulang kode
              </button>
            </div>

            <button
              onClick={() => setStep('phone')}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              Ganti nomor telepon
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Berhasil Masuk!</h3>
            <p className="text-slate-500">Mengalihkan ke halaman utama...</p>
          </div>
        )}
      </div>
    </div>
  );
}
