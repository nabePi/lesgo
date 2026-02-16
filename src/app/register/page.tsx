import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Daftar LesGo</h1>
          <p className="text-gray-500">Buat akun baru</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
