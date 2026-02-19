'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle2,
  LogOut,
  Loader2,
  LayoutDashboard,
  Mail,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

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

    // If onboarded but not active, show this page with option to go to dashboard
    setLoading(false);
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    await checkStatus();
    setChecking(false);
  };

  const handleGoToDashboard = () => {
    router.push('/tutor/dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E85D4C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Success Banner */}
        <div className="bg-[#10B981] rounded-2xl p-1 mb-6">
          <div className="bg-white px-6 py-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="font-display font-bold text-[#1F2937] text-lg">Pendaftaran Berhasil!</p>
              <p className="font-body text-sm text-[#6B7280]">Data Anda telah terkirim dan sedang direview</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#FFFBEB] p-8 text-center border-b border-[#F59E0B]/20">
            <div className="w-24 h-24 bg-[#FEF2F0] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-[#F59E0B]" />
            </div>

            <h1 className="font-display text-3xl font-bold text-[#1F2937] mb-2">
              Menunggu Verifikasi
            </h1>
            <p className="font-body text-[#6B7280]">
              Tim kami sedang meninjau profil Anda
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Timeline */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#ECFDF5] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <p className="font-body font-semibold text-[#1F2937]">Data Terkirim</p>
                  <p className="font-body text-sm text-[#6B7280]">Profil Anda berhasil dikirim</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#FFFBEB] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="font-body font-semibold text-[#1F2937]">Dalam Review</p>
                  <p className="font-body text-sm text-[#6B7280]">Tim admin sedang memverifikasi data Anda</p>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-50">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-body font-semibold text-[#1F2937]">Notifikasi Email</p>
                  <p className="font-body text-sm text-[#6B7280]">Anda akan menerima email setelah terverifikasi</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#F0FDFA] border border-[#0D9488]/20 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-[#1F2937] mb-1">Notifikasi via Email</p>
                  <p className="font-body text-sm text-[#6B7280]">
                    Anda akan menerima email konfirmasi setelah akun disetujui.
                    Proses verifikasi biasanya memakan waktu <strong>1-2 hari kerja</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action */}
            <Button
              onClick={handleGoToDashboard}
              className="w-full h-14 bg-[#E85D4C] hover:bg-[#C94A3B] text-white font-body font-semibold mb-3 rounded-xl shadow-lg shadow-orange-200"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Lihat Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center font-body text-sm text-[#6B7280] mb-6">
              Atur jadwal dan profil Anda sambil menunggu verifikasi
            </p>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCheckAgain}
                disabled={checking}
                variant="outline"
                className="h-12 rounded-xl border-gray-200 text-[#1F2937] hover:border-[#E85D4C] hover:text-[#E85D4C]"
              >
                {checking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Cek Status
                  </>
                )}
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="h-12 rounded-xl border-gray-200 text-[#6B7280] hover:border-red-400 hover:text-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="font-body text-xs text-[#9CA3AF] text-center">
              Butuh bantuan? Hubungi kami di{' '}
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E85D4C] hover:text-[#C94A3B] font-semibold"
              >
                WhatsApp 0812-3456-7890
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
