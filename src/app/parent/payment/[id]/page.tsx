'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [snapToken, setSnapToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createPayment();
  }, []);

  const createPayment = async () => {
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: params.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      setSnapToken(data.token);
    } catch {
      setError('Gagal memuat pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const pay = () => {
    if (typeof window !== 'undefined' && (window as any).snap) {
      (window as any).snap.pay(snapToken, {
        onSuccess: () => { window.location.href = '/parent/bookings'; },
        onPending: () => { alert('Menunggu pembayaran...'); },
        onError: () => { alert('Pembayaran gagal'); },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href="/parent/search"
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pembayaran</h1>
          <p className="text-slate-500">
            Lanjutkan pembayaran untuk mengkonfirmasi booking Anda
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Memuat pembayaran...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600">{error}</p>
              <Button
                onClick={createPayment}
                variant="outline"
                className="mt-4"
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Security Badge */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Pembayaran Aman</p>
                  <p className="text-sm text-slate-500">Diproses oleh Midtrans</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Metode Pembayaran Tersedia:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Transfer Bank
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Kartu Kredit
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    E-Wallet
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    QRIS
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={pay}
                className={cn(
                  "w-full h-14 text-base font-semibold",
                  "bg-emerald-500 hover:bg-emerald-600",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                )}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Bayar Sekarang
              </Button>

              <p className="text-xs text-center text-slate-400">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan pembayaran
              </p>
            </div>
          )}
        </div>

        {/* Midtrans Script */}
        <script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      </main>
    </div>
  );
}
