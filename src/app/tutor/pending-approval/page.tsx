'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, LogOut, Loader2 } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: tutor } = await supabase
      .from('tutor_profiles')
      .select('is_onboarded, is_active')
      .eq('user_id', user.id)
      .single();

    if (!tutor?.is_onboarded) {
      router.push('/tutor/complete-registration');
      return;
    }

    if (tutor?.is_active) {
      router.push('/tutor/dashboard');
      return;
    }

    setLoading(false);
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    await checkStatus();
    setChecking(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Menunggu Verifikasi
        </h1>

        <p className="text-slate-600 mb-6 leading-relaxed">
          Data Anda sedang direview oleh tim kami. Proses verifikasi biasanya memakan waktu 1-2 hari kerja.
          Anda akan menerima notifikasi melalui WhatsApp setelah akun disetujui.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Data Lengkap</p>
              <p className="text-sm text-slate-500">Profil Anda telah terkirim</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleCheckAgain}
            disabled={checking}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
          >
            {checking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Cek Status Verifikasi'
            )}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Keluar
          </Button>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Butuh bantuan? Hubungi kami di WhatsApp 0812-3456-7890
        </p>
      </div>
    </div>
  );
}
