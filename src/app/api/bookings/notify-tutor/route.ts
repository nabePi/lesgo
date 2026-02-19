import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get booking details
    const { data: booking } = await supabaseServer
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get tutor profile for email
    const { data: tutorProfile } = await supabaseServer
      .from('tutor_profiles')
      .select('*, user:profiles!tutor_profiles_user_id_fkey(name, email)')
      .eq('user_id', booking.tutor_id)
      .single();

    if (!tutorProfile?.user?.email) {
      return NextResponse.json({ error: 'Tutor email not found' }, { status: 404 });
    }

    // Send email notification
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

    return NextResponse.json({ success: true, message: 'Email sent to tutor' });
  } catch (error) {
    console.error('Failed to send tutor notification:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
