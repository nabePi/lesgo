import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { order_id, transaction_status, payment_type } = body;

  const { data: payment } = await supabaseServer
    .from('payments')
    .select('*')
    .eq('midtrans_order_id', order_id)
    .single();

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  let status: string;
  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    status = 'success';
  } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
    status = 'failed';
  } else if (transaction_status === 'expire') {
    status = 'expired';
  } else {
    status = 'pending';
  }

  await supabaseServer
    .from('payments')
    .update({ status, payment_type, paid_at: status === 'success' ? new Date().toISOString() : null })
    .eq('id', payment.id);

  if (status === 'success') {
    await supabaseServer
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', payment.booking_id);
  }

  return NextResponse.json({ success: true });
}
