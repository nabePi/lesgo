'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [snapToken, setSnapToken] = useState('');

  useEffect(() => {
    createPayment();
  }, []);

  const createPayment = async () => {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: params.id }),
    });
    const data = await response.json();
    setSnapToken(data.token);
    setLoading(false);
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
    <div className="max-w-md mx-auto p-4 text-center space-y-6">
      <h1 className="text-2xl font-bold">Pembayaran</h1>
      
      {loading ? (
        <p>Memuat...</p>
      ) : (
        <>
          <p>Silakan lanjutkan pembayaran Anda</p>
          <Button onClick={pay} className="w-full">Bayar Sekarang</Button>
        </>
      )}
      
      <script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
    </div>
  );
}
