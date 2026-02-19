import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Update booking status to paid
    await supabaseServer
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', bookingId);

    // Update payment status if exists
    await supabaseServer
      .from('payments')
      .update({ status: 'success', paid_at: new Date().toISOString() })
      .eq('booking_id', bookingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark booking as paid:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
