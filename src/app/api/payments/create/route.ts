import { NextRequest, NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const { bookingId } = await request.json();

  const { data: booking } = await supabaseServer
    .from('bookings')
    .select('*, parent:profiles!parent_id(*), tutor:profiles!tutor_id(*)')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const orderId = `LESGO-${bookingId}-${Date.now()}`;
  
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: booking.total_amount,
    },
    customer_details: {
      first_name: booking.parent.name,
      email: booking.parent.email,
      phone: booking.parent.whatsapp,
    },
    item_details: [
      {
        id: bookingId,
        price: booking.total_amount,
        quantity: 1,
        name: `Les ${booking.subject} - ${booking.tutor.name}`,
      },
    ],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    
    await supabaseServer.from('payments').insert({
      booking_id: bookingId,
      midtrans_order_id: orderId,
      amount: booking.total_amount,
      status: 'pending',
    });

    return NextResponse.json({ 
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
