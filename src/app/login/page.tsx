import { LoginForm } from '@/components/auth/LoginForm';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50/50 to-background">
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
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Selamat Datang Kembali</h1>
          <p className="text-slate-500 mt-1">Masuk untuk melanjutkan les private Anda</p>
        </div>
        <LoginForm />

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
