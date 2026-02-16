'use client';

import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  BookOpen,
  User,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  CheckCircle2,
  XCircle,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface BookingRequestsProps {
  bookings: Booking[];
}

export function BookingRequests({ bookings }: BookingRequestsProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      alert(error.message);
    } else {
      window.location.reload();
    }
    setUpdatingId(null);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
      pending_payment: {
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        label: 'Menunggu Pembayaran',
        icon: <Clock className="w-3 h-3" />
      },
      paid: {
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        label: 'Perlu Konfirmasi',
        icon: <CheckCircle2 className="w-3 h-3" />
      },
      confirmed: {
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        label: 'Dikonfirmasi',
        icon: <CheckCircle2 className="w-3 h-3" />
      },
      in_progress: {
        className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        label: 'Berlangsung',
        icon: <Clock className="w-3 h-3" />
      },
      completed: {
        className: 'bg-slate-100 text-slate-700 border-slate-200',
        label: 'Selesai',
        icon: <CheckCircle2 className="w-3 h-3" />
      },
      cancelled: {
        className: 'bg-red-100 text-red-700 border-red-200',
        label: 'Dibatalkan',
        icon: <XCircle className="w-3 h-3" />
      },
      declined: {
        className: 'bg-red-100 text-red-700 border-red-200',
        label: 'Ditolak',
        icon: <XCircle className="w-3 h-3" />
      },
    };

    const config = configs[status] || { className: 'bg-gray-100', label: status, icon: null };

    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className
      )}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">Belum ada booking</h3>
        <p className="text-sm text-slate-500">Booking dari orang tua akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="card-elevated p-4 sm:p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{booking.subject}</h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                  <User className="w-4 h-4" />
                  <span>{booking.parent?.name}</span>
                </div>
              </div>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {format(new Date(booking.session_date), 'EEEE, d MMMM yyyy', { locale: id })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{booking.session_time.slice(0, 5)} ({booking.duration_hours} jam)</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <span className="line-clamp-2">{booking.address}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span className="text-sm text-slate-500">Pendapatan Anda</span>
              <div className="text-xl font-bold text-emerald-600">
                Rp {booking.tutor_earnings.toLocaleString('id-ID')}
              </div>
            </div>

            {booking.status === 'paid' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(booking.id, 'declined')}
                  disabled={updatingId === booking.id}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  {updatingId === booking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Tolak
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateStatus(booking.id, 'confirmed')}
                  disabled={updatingId === booking.id}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {updatingId === booking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Terima
                    </>
                  )}
                </Button>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <Button
                size="sm"
                onClick={() => updateStatus(booking.id, 'completed')}
                disabled={updatingId === booking.id}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {updatingId === booking.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Selesai
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
