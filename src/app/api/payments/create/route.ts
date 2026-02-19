import { NextRequest, NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get booking first
    const { data: booking, error: bookingError } = await supabaseServer
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get parent info
    const { data: parent } = await supabaseServer
      .from('profiles')
      .select('name, email, whatsapp')
      .eq('id', booking.parent_id)
      .single();

    // Get tutor info
    const { data: tutor } = await supabaseServer
      .from('profiles')
      .select('name')
      .eq('id', booking.tutor_id)
      .single();

    // Shorter order_id format (Midtrans limit is ~50 chars)
    const orderId = `LG-${bookingId.slice(0, 8)}-${Date.now().toString(36).slice(-6)}`;

    const whatsapp = parent?.whatsapp || booking.parent_whatsapp || '';
    // Generate placeholder email from WhatsApp number since Midtrans requires email
    const email = whatsapp ? `user-${whatsapp.replace(/\D/g, '')}@lesgo.id` : 'guest@lesgo.id';

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.total_amount,
      },
      customer_details: {
        first_name: parent?.name || booking.parent_name || 'Customer',
        email,
        phone: whatsapp || '08123456789',
      },
      item_details: [
        {
          id: bookingId,
          price: booking.total_amount,
          quantity: 1,
          name: `Les ${booking.subject} - ${tutor?.name || 'Tutor'}`,
        },
      ],
    };

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
      order_id: orderId,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
