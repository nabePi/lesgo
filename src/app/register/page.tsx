import { RegisterForm } from '@/components/auth/RegisterForm';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Buat Akun Baru</h1>
          <p className="text-slate-500 mt-1">Bergabung dengan ribuan tutor dan orang tua</p>
        </div>
        <RegisterForm />

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
