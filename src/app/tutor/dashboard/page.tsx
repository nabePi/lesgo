import { supabaseServer } from '@/lib/supabase-server';
import { BookingRequests } from '@/components/tutor/BookingRequests';
import { EarningsCard } from '@/components/tutor/EarningsCard';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function TutorDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: bookings } = await supabaseServer
    .from('bookings')
    .select('*, parent:profiles!parent_id(*)')
    .eq('tutor_id', session.user.id)
    .order('created_at', { ascending: false });

  const { data: wallet } = await supabaseServer
    .from('tutor_wallets')
    .select('*')
    .eq('tutor_id', session.user.id)
    .single();

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Guru</h1>
      <EarningsCard balance={wallet?.balance || 0} totalEarned={wallet?.total_earned || 0} />
      
      <div>
        <h2 className="font-semibold mb-4">Permintaan Booking</h2>
        <BookingRequests bookings={bookings || []} />
      </div>
    </div>
  );
}
