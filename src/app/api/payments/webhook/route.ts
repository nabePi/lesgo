import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email notification to tutor
    try {
      // Get booking details with tutor and parent info
      const { data: booking } = await supabaseServer
        .from('bookings')
        .select('*')
        .eq('id', payment.booking_id)
        .single();

      if (booking) {
        // Get tutor profile for email
        const { data: tutorProfile } = await supabaseServer
          .from('tutor_profiles')
          .select('*, user:profiles!tutor_profiles_user_id_fkey(name, email)')
          .eq('user_id', booking.tutor_id)
          .single();

        if (tutorProfile?.user?.email) {
          await resend.emails.send({
            from: 'LesGo <noreply@bangundiri.id>',
            to: tutorProfile.user.email,
            subject: 'Pemesanan Les Baru - LesGo',
            html: `
              <h2>Halo ${tutorProfile.user.name},</h2>
              <p>Anda memiliki pemesanan les baru yang telah dibayar!</p>

              <h3>Detail Pemesanan:</h3>
              <ul>
                <li><strong>Mata Pelajaran:</strong> ${booking.subject}</li>
                <li><strong>Tanggal:</strong> ${booking.session_date}</li>
                <li><strong>Waktu:</strong> ${booking.session_time}</li>
                <li><strong>Durasi:</strong> ${booking.duration_hours} jam</li>
                <li><strong>Lokasi:</strong> ${booking.address}</li>
                <li><strong>Nama Orang Tua:</strong> ${booking.parent_name}</li>
                <li><strong>WhatsApp:</strong> ${booking.parent_whatsapp}</li>
                <li><strong>Total Pembayaran:</strong> Rp ${booking.total_amount?.toLocaleString('id-ID')}</li>
              </ul>

              <p>Silakan hubungi orang tua siswa via WhatsApp untuk konfirmasi.</p>

              <p>Terima kasih,<br>Tim LesGo</p>
            `,
          });
        }
      }
    } catch (error) {
      console.error('Failed to send tutor email notification:', error);
      // Don't fail the webhook if email fails
    }
  }

  return NextResponse.json({ success: true });
}
