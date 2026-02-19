'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Shield, ArrowLeft, CheckCircle2, Calendar, Clock, MapPin, User, BookOpen, Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BookingData {
  id: string;
  parent_name: string;
  subject: string;
  session_date: string;
  session_time: string;
  duration_hours: number;
  address: string;
  total_amount: number;
  tutor: {
    user: {
      name: string;
    };
  };
}

export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [snapToken, setSnapToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId]);

  const fetchBookingData = async () => {
    try {
      // Fetch booking details
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      }

      // Create payment
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment');
      }

      const paymentData = await paymentResponse.json();
      setSnapToken(paymentData.token);
    } catch (err) {
      setError('Gagal memuat pembayaran. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pay = () => {
    if (typeof window !== 'undefined' && (window as any).snap) {
      (window as any).snap.pay(snapToken, {
        onSuccess: async () => {
          // Mark booking as paid (for local dev where webhook doesn't work)
          try {
            await fetch('/api/bookings/mark-paid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId }),
            });
          } catch (error) {
            console.error('Failed to mark booking as paid:', error);
          }
          // Pass booking_id to success page
          window.location.href = `/parent/bookings?booking_id=${bookingId}`;
        },
        onPending: () => {
          window.location.href = `/parent/bookings?booking_id=${bookingId}&status=pending`;
        },
        onError: () => { alert('Pembayaran gagal'); },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href="/parent/search"
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#E85D4C] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {/* Progress Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-bold">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-[#10B981]">Data Diri</span>
          </div>
          <div className="w-12 h-px bg-[#E85D4C]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E85D4C] text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-sm font-semibold text-[#E85D4C]">Pembayaran</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#10B981]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Pembayaran</h1>
          <p className="text-[#6B7280]">
            Lanjutkan pembayaran untuk mengkonfirmasi booking Anda
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-[#E85D4C] animate-spin mx-auto mb-4" />
              <p className="text-[#6B7280]">Memuat pembayaran...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600">{error}</p>
              <Button
                onClick={fetchBookingData}
                variant="outline"
                className="mt-4 rounded-xl border-[#E85D4C] text-[#E85D4C] hover:bg-[#E85D4C] hover:text-white"
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Booking Summary */}
              {booking && (
                <div className="bg-[#FEF2F0] rounded-xl p-4 border border-[#E85D4C]/20">
                  <h3 className="font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E85D4C]" />
                    Ringkasan Booking
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <User className="w-4 h-4 text-[#E85D4C]" />
                      <span>Tutor: <span className="font-medium text-[#1F2937]">{booking.tutor?.user?.name || '-'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <BookOpen className="w-4 h-4 text-[#E85D4C]" />
                      <span>Mata Pelajaran: <span className="font-medium text-[#1F2937]">{booking.subject}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Calendar className="w-4 h-4 text-[#E85D4C]" />
                      <span>Tanggal: <span className="font-medium text-[#1F2937]">{formatDate(booking.session_date)}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Clock className="w-4 h-4 text-[#E85D4C]" />
                      <span>Waktu: <span className="font-medium text-[#1F2937]">{booking.session_time} ({booking.duration_hours} jam)</span></span>
                    </div>
                    <div className="flex items-start gap-2 text-[#6B7280]">
                      <MapPin className="w-4 h-4 text-[#E85D4C] mt-0.5" />
                      <span className="line-clamp-2">Lokasi: <span className="font-medium text-[#1F2937]">{booking.address}</span></span>
                    </div>
                    <div className="h-px bg-[#E85D4C]/20 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#1F2937]">Total Pembayaran</span>
                      <span className="font-bold text-lg text-[#E85D4C]">
                        Rp {booking.total_amount?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1F2937]">Pembayaran Aman</p>
                  <p className="text-sm text-[#6B7280]">Diproses oleh Midtrans</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1F2937]">Metode Pembayaran Tersedia:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Transfer Bank
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Kartu Kredit
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    E-Wallet
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    QRIS
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={pay}
                className={cn(
                  "w-full h-14 text-base font-semibold rounded-xl",
                  "bg-[#E85D4C] hover:bg-[#C94A3B]",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200"
                )}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Bayar Sekarang
              </Button>

              <p className="text-xs text-center text-[#9CA3AF]">
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
