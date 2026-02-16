'use client';

import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface BookingRequestsProps {
  bookings: Booking[];
}

export function BookingRequests({ bookings }: BookingRequestsProps) {
  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      alert(error.message);
    } else {
      window.location.reload();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_payment: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending_payment: 'Menunggu',
      paid: 'Konfirmasi',
      confirmed: 'Dikonfirmasi',
      declined: 'Ditolak',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (bookings.length === 0) {
    return <p className="text-gray-500">Belum ada booking</p>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{booking.subject}</h3>
              <p className="text-sm text-gray-500">{booking.parent?.name}</p>
              <p className="text-sm">
                {format(new Date(booking.session_date), 'EEEE, d MMMM yyyy', { locale: id })}
              </p>
              <p className="text-sm text-gray-500">{booking.address}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="font-bold">Rp {booking.tutor_earnings.toLocaleString()}</div>
            
            {booking.status === 'paid' && (
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, 'declined')}>
                  Tolak
                </Button>
                <Button size="sm" onClick={() => updateStatus(booking.id, 'confirmed')}>
                  Terima
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
