'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BookingRequests } from '@/components/tutor/BookingRequests';
import { EarningsCard } from '@/components/tutor/EarningsCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, LogOut, LayoutDashboard, Settings, Loader2 } from 'lucide-react';
import type { Booking } from '@/types';

interface Wallet {
  balance: number;
  total_earned: number;
}

export default function TutorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, total_earned: 0 });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, parent:profiles!parent_id(*)')
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false });

      // Load wallet
      const { data: walletData } = await supabase
        .from('tutor_wallets')
        .select('*')
        .eq('tutor_id', user.id)
        .maybeSingle();

      setBookings(bookingsData || []);
      setWallet({
        balance: walletData?.balance || 0,
        total_earned: walletData?.total_earned || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">LesGo</span>
          </Link>

          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Guru</h1>
          <p className="text-slate-500">Kelola booking dan pendapatan Anda</p>
        </div>

        {/* Earnings */}
        <EarningsCard balance={wallet.balance} totalEarned={wallet.total_earned} />

        {/* Navigation Pills */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium whitespace-nowrap">
            Semua Booking
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full text-sm font-medium whitespace-nowrap hover:bg-slate-50">
            Menunggu
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full text-sm font-medium whitespace-nowrap hover:bg-slate-50">
            Dikonfirmasi
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full text-sm font-medium whitespace-nowrap hover:bg-slate-50">
            Selesai
          </button>
        </div>

        {/* Bookings */}
        <div className="mt-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
            Permintaan Booking
          </h2>
          <BookingRequests bookings={bookings} />
        </div>
      </main>
    </div>
  );
}
