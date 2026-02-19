'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Chrome, Loader2, ArrowLeft, CheckCircle2, User, Building2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if tutor profile exists
      const { data: tutor } = await supabase
        .from('tutor_profiles')
        .select('is_onboarded, is_active')
        .eq('user_id', user.id)
        .single();

      if (!tutor) {
        // New tutor - create basic profile and redirect to complete registration
        await createTutorProfile(user.id, user.email || '', user.user_metadata?.full_name || '');
        router.push('/tutor/complete-registration');
      } else if (!tutor.is_onboarded) {
        router.push('/tutor/complete-registration');
      } else if (!tutor.is_active) {
        router.push('/tutor/pending-approval');
      } else {
        router.push('/tutor/dashboard');
      }
    }
  };

  const createTutorProfile = async (userId: string, email: string, name: string) => {
    // Create profile
    await supabase.from('profiles').insert({
      id: userId,
      name: name || 'Tutor',
      email: email,
      whatsapp: '',
      role: 'tutor',
    });

    // Create basic tutor profile
    await supabase.from('tutor_profiles').insert({
      user_id: userId,
      bio: '',
      subjects: [],
      hourly_rate: 0,
      is_verified: false,
      is_active: false,
      is_onboarded: false,
    });
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal daftar dengan Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDFCFB]">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[#6B7280] hover:text-[#E85D4C] transition-colors font-body"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Kembali</span>
      </Link>

      {/* Logo */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold text-[#1F2937] tracking-tight">
            LesGo
          </span>
          <span className="text-[#E85D4C] text-xs font-medium tracking-wide uppercase">
            Les Privat
          </span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0FDFA] rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-[#0D9488] text-xs font-medium">Tutor Area</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#1F2937]">
              Daftar sebagai Tutor
            </h1>
            <p className="font-body text-[#6B7280] mt-2 text-sm">
              Bergabung sebagai tutor les private dan mulai mengajar
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {[
              { icon: CheckCircle2, text: 'Penghasilan tambahan dari mengajar', color: 'text-[#10B981]' },
              { icon: User, text: 'Atur jadwal mengajar sesuai waktu luang', color: 'text-[#E85D4C]' },
              { icon: Building2, text: 'Dapatkan siswa di sekitar lokasi Anda', color: 'text-[#0D9488]' },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-[#6B7280] bg-gray-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
                </div>
                <span className="font-body font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="font-body text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full h-14 font-body font-semibold bg-white border-2 border-gray-200 text-[#1F2937] hover:border-[#E85D4C] hover:text-[#E85D4C] rounded-xl transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5 mr-3" />
                Daftar dengan Google
              </>
            )}
          </Button>

          <div className="mt-8 text-center">
            <p className="font-body text-sm text-[#6B7280]">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-[#E85D4C] font-semibold hover:text-[#C94A3B] transition-colors">
                Masuk sekarang
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="font-body text-xs text-center text-[#9CA3AF]">
              Dengan mendaftar, Anda menyetujui syarat dan ketentuan sebagai tutor LesGo.
              Data Anda akan diverifikasi sebelum akun diaktifkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
