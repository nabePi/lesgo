import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Masuk ke LesGo</h1>
          <p className="text-gray-500">Masukkan nomor WhatsApp Anda</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
