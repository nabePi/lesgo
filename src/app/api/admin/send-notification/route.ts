import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_NAME = 'LesGo';
// Use verified domain for sending emails
const FROM_EMAIL = process.env.FROM_EMAIL || 'LesGo <noreply@bangundiri.id>';

interface EmailRequest {
  email: string;
  name: string;
  status: 'approved' | 'rejected';
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { email, name, status } = body;

    if (!email || !name || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, or status' },
        { status: 400 }
      );
    }

    // Get Resend API key
    const apiKey = process.env.RESEND_API_KEY;

    // If no API key is configured, log the notification and return success
    // This allows testing without a real email service
    if (!apiKey) {
      console.log(`[EMAIL NOTIFICATION - ${status.toUpperCase()}]`);
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log('Note: RESEND_API_KEY not configured. Email not sent.');

      return NextResponse.json({
        success: true,
        message: 'Email notification logged (RESEND_API_KEY not configured)',
        simulated: true,
      });
    }

    let subject: string;
    let htmlContent: string;

    if (status === 'approved') {
      subject = `Selamat! Akun Tutor Anda Telah Disetujui - ${APP_NAME}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Selamat, ${name}!</h2>
          <p>Akun tutor Anda di <strong>${APP_NAME}</strong> telah berhasil diverifikasi dan disetujui.</p>

          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Status:</strong> Aktif</p>
            <p style="margin: 5px 0 0 0;">Anda sekarang dapat menerima permintaan les dari orang tua.</p>
          </div>

          <p>Langkah selanjutnya:</p>
          <ul>
            <li>Login ke akun tutor Anda</li>
            <li>Pastikan profil dan jadwal Anda sudah lengkap</li>
            <li>Tunggu permintaan les dari orang tua di area Anda</li>
          </ul>

          <p>Terima kasih telah bergabung dengan ${APP_NAME}!</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Email ini dikirim secara otomatis. Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.
          </p>
        </div>
      `;
    } else {
      subject = `Informasi Pendaftaran Tutor - ${APP_NAME}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ef4444;">Halo, ${name}</h2>
          <p>Terima kasih telah mendaftar sebagai tutor di <strong>${APP_NAME}</strong>.</p>

          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Status Pendaftaran:</strong> Tidak Disetujui</p>
            <p style="margin: 5px 0 0 0;">Mohon maaf, pendaftaran Anda belum dapat kami proses saat ini.</p>
          </div>

          <p>Beberapa kemungkinan penyebab:</p>
          <ul>
            <li>Dokumen yang diunggah tidak lengkap atau tidak jelas</li>
            <li>Informasi profil belum lengkap</li>
            <li>Area lokasi belum tersedia dalam layanan kami</li>
          </ul>

          <p>Anda dapat mencoba mendaftar kembali dengan memastikan:</p>
          <ul>
            <li>Foto KTP dan foto diri jelas terlihat</li>
            <li>Semua informasi profil diisi dengan lengkap dan benar</li>
            <li>Nomor WhatsApp dapat dihubungi</li>
          </ul>

          <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Email ini dikirim secara otomatis oleh ${APP_NAME}.
          </p>
        </div>
      `;
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend email error:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email notification sent successfully to ${email}`,
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
