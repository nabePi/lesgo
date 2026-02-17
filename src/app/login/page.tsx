'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { GraduationCap, Chrome, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
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
      redirectBasedOnRole(user.id);
    }
  };

  const redirectBasedOnRole = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profile?.role === 'tutor') {
      // Check if tutor has completed onboarding
      const { data: tutor } = await supabase
        .from('tutor_profiles')
        .select('is_onboarded, is_active')
        .eq('user_id', userId)
        .single();

      if (!tutor?.is_onboarded) {
        router.push('/tutor/complete-registration');
      } else if (!tutor?.is_active) {
        router.push('/tutor/pending-approval');
      } else {
        router.push('/tutor/dashboard');
      }
    } else {
      router.push('/parent/search');
    }
  };

  const handleGoogleLogin = async () => {
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
      setError(err instanceof Error ? err.message : 'Gagal login dengan Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50/50 to-white">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Kembali</span>
      </Link>

      {/* Logo */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">LesGo</span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Masuk sebagai Tutor</h1>
            <p className="text-slate-500 mt-2">
              Akses dashboard tutor untuk kelola jadwal dan pemesanan
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 text-base font-semibold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5 mr-3 text-red-500" />
                Lanjutkan dengan Google
              </>
            )}
          </Button>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun tutor?{' '}
              <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Daftar sekarang
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400">
              Hanya untuk tutor yang sudah terdaftar. Orang tua tidak perlu login untuk memesan les.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
