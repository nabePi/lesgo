'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Calendar, Clock, MapPin, User, BookOpen, MessageCircle, Home, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface BookingData {
  id: string;
  subject: string;
  session_date: string;
  session_time: string;
  duration_hours: number;
  address: string;
  parent_name: string;
  parent_whatsapp: string;
  total_amount: number;
  tutor: {
    user: {
      name: string;
    };
  };
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingData();
      notifyTutor(); // Notify tutor via email (fallback for local dev)
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const notifyTutor = async () => {
    try {
      await fetch('/api/bookings/notify-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
    } catch (error) {
      console.error('Failed to notify tutor:', error);
      // Don't block the UI if notification fails
    }
  };

  const fetchBookingData = async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    // Fetch booking by exact ID
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (data) {
      // Get tutor info
      const { data: tutor } = await supabase
        .from('tutor_profiles')
        .select('*, user:profiles!tutor_profiles_user_id_fkey(name)')
        .eq('user_id', data.tutor_id)
        .single();

      setBooking({ ...data, tutor });
    }
    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#E85D4C] animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[#1F2937]">LesGo</span>
            <span className="text-[#E85D4C] text-xs font-medium tracking-wide uppercase">Les Privat</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1F2937] mb-2">
            Pembayaran Berhasil!
          </h1>
          <p className="text-[#6B7280]">
            Booking les private Anda telah dikonfirmasi
          </p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-[#FEF2F0] rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#E85D4C]" />
            </div>
            <div>
              <p className="font-semibold text-[#1F2937]">Status Pembayaran</p>
              <p className="text-sm text-[#10B981] font-medium">Lunas</p>
            </div>
          </div>

          {booking ? (
            <div className="space-y-4">
              {/* Tutor Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FEF2F0] to-[#F0FDFA] rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1F2937]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Tutor</p>
                  <p className="font-semibold text-[#1F2937]">{booking.tutor?.user?.name || '-'}</p>
                </div>
              </div>

              {/* Subject */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FEF2F0] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#E85D4C]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Mata Pelajaran</p>
                  <p className="font-semibold text-[#1F2937]">{booking.subject}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Tanggal & Waktu</p>
                  <p className="font-semibold text-[#1F2937]">
                    {formatDate(booking.session_date)}, {booking.session_time}
                  </p>
                  <p className="text-sm text-[#0D9488]">({booking.duration_hours} jam)</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#FFFBEB] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#D97706]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Lokasi</p>
                  <p className="font-semibold text-[#1F2937] line-clamp-2">{booking.address}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="h-px bg-gray-100 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280]">Total Pembayaran</span>
                <span className="font-bold text-xl text-[#E85D4C]">
                  Rp {booking.total_amount?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-[#6B7280]">
              Detail booking tidak tersedia
            </div>
          )}
        </div>

        {/* Next Steps Info */}
        <div className="bg-[#F0FDFA] rounded-2xl border border-[#0D9488]/20 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#0D9488] rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-[#1F2937]">Apa Selanjutnya?</h3>
          </div>

          <div className="space-y-3 text-sm text-[#6B7280]">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#0D9488] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p>Tutor akan menghubungi Anda via WhatsApp untuk konfirmasi</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#0D9488] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p>Tutor akan datang ke lokasi sesuai jadwal yang ditentukan</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#0D9488] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p>Sesi les akan berlangsung sesuai durasi yang dibayar</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Reminder */}
        <div className="bg-[#FEF2F0] rounded-2xl border border-[#E85D4C]/20 p-6 mb-6">
          <p className="text-sm text-[#6B7280] mb-2">
            Kami akan mengirimkan detail booking ke WhatsApp Anda:
          </p>
          <p className="font-semibold text-[#1F2937]">
            {booking?.parent_whatsapp || 'Nomor WhatsApp'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/">
            <Button
              className="w-full h-14 bg-[#E85D4C] hover:bg-[#C94A3B] text-white font-semibold rounded-xl transition-all"
            >
              <Home className="w-5 h-5 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>

          <Link href="/parent/search">
            <Button
              variant="outline"
              className="w-full h-14 border-gray-200 text-[#6B7280] hover:text-[#E85D4C] hover:border-[#E85D4C] font-semibold rounded-xl transition-all"
            >
              <Search className="w-5 h-5 mr-2" />
              Cari Tutor Lain
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#E85D4C] animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">Memuat...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
