'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Memproses login...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setStatus('error');
        setMessage('Gagal memproses autentikasi');
        return;
      }

      const user = session.user;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // New user - create profile and tutor profile
        setMessage('Membuat profil tutor...');

        await supabase.from('profiles').insert({
          id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'Tutor',
          email: user.email || '',
          whatsapp: user.user_metadata?.phone || '',
          role: 'tutor',
        });

        await supabase.from('tutor_profiles').insert({
          user_id: user.id,
          bio: '',
          subjects: [],
          hourly_rate: 0,
          is_verified: false,
          is_active: false,
          is_onboarded: false,
        });

        setStatus('success');
        setMessage('Profil berhasil dibuat! Mengalihkan...');

        setTimeout(() => {
          router.push('/tutor/complete-registration');
        }, 1500);
        return;
      }

      // Existing user - check role first
      if (existingProfile.role === 'admin') {
        setStatus('success');
        setMessage('Login berhasil! Mengalihkan...');
        setTimeout(() => router.push('/admin'), 1500);
        return;
      }

      // Check tutor profile status
      const { data: tutorProfile, error: tutorError } = await supabase
        .from('tutor_profiles')
        .select('is_onboarded, is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (tutorError) {
        console.error('Error fetching tutor profile:', tutorError);
      }

      setStatus('success');

      // Debug logging
      console.log('Tutor login:', {
        userId: user.id,
        hasTutorProfile: !!tutorProfile,
        is_onboarded: tutorProfile?.is_onboarded,
        is_active: tutorProfile?.is_active,
      });

      if (!tutorProfile) {
        // No tutor profile found - create one and redirect to complete registration
        console.log('Creating tutor profile for existing user...');
        await supabase.from('tutor_profiles').insert({
          user_id: user.id,
          bio: '',
          subjects: [],
          hourly_rate: 0,
          is_verified: false,
          is_active: false,
          is_onboarded: false,
        });
        setMessage('Lengkapi data tutor Anda...');
        setTimeout(() => router.push('/tutor/complete-registration'), 1500);
      } else if (!tutorProfile.is_onboarded) {
        setMessage('Lengkapi data tutor Anda...');
        setTimeout(() => router.push('/tutor/complete-registration'), 1500);
      } else if (!tutorProfile.is_active) {
        setMessage('Menunggu verifikasi admin...');
        setTimeout(() => router.push('/tutor/pending-approval'), 1500);
      } else {
        setMessage('Login berhasil! Mengalihkan...');
        setTimeout(() => router.push('/tutor/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">{message}</h1>
            <p className="text-slate-500">Mohon tunggu sebentar...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">{message}</h1>
            <p className="text-slate-500">Mengalihkan ke halaman selanjutnya...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">{message}</h1>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
            >
              Kembali ke halaman login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
