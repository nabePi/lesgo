import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // First try to get just the booking
  const { data: booking, error } = await supabaseServer
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !booking) {
    console.error('Booking fetch error:', error);
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  // Then get tutor info separately
  const { data: tutorProfile } = await supabaseServer
    .from('tutor_profiles')
    .select('*, user:profiles!tutor_profiles_user_id_fkey(name)')
    .eq('user_id', booking.tutor_id)
    .single();

  // Combine the data
  const response = {
    ...booking,
    tutor: tutorProfile || null
  };

  return NextResponse.json(response);
}
