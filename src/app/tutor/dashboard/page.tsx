'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BookingRequests } from '@/components/tutor/BookingRequests';
import { AvailabilityManager } from '@/components/tutor/AvailabilityManager';
import { SubjectManager } from '@/components/tutor/SubjectManager';
import { RateManager } from '@/components/tutor/RateManager';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  LayoutDashboard,
  Wallet,
  User,
  BookOpen,
  Clock,
  DollarSign,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock3,
  Mail,
  Shield,
  Sparkles,
} from 'lucide-react';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';

interface TutorData {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  is_verified: boolean;
}

interface WalletData {
  balance: number;
  total_earned: number;
}

export default function TutorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'settings'>('overview');
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, total_earned: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    activeAvailabilitySlots: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load tutor profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', user.id)
        .single();

      const { data: tutorProfileData } = await supabase
        .from('tutor_profiles')
        .select('subjects, hourly_rate, rating, total_reviews, is_active, is_verified')
        .eq('user_id', user.id)
        .single();

      // Load wallet
      const { data: walletData } = await supabase
        .from('tutor_wallets')
        .select('balance, total_earned')
        .eq('tutor_id', user.id)
        .maybeSingle();

      // Load bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, parent:profiles!parent_id(*)')
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false });

      // Load availability slots count
      const { data: availabilityData } = await supabase
        .from('tutor_availability')
        .select('is_active')
        .eq('tutor_id', user.id);

      setTutor({
        id: user.id,
        name: profileData?.name || 'Tutor',
        email: profileData?.email || '',
        subjects: tutorProfileData?.subjects || [],
        hourly_rate: tutorProfileData?.hourly_rate || 0,
        rating: tutorProfileData?.rating || 0,
        total_reviews: tutorProfileData?.total_reviews || 0,
        is_active: tutorProfileData?.is_active || false,
        is_verified: tutorProfileData?.is_verified || false,
      });

      setWallet({
        balance: walletData?.balance || 0,
        total_earned: walletData?.total_earned || 0,
      });

      const bookingsList = bookingsData || [];
      setBookings(bookingsList);

      const availabilityList = availabilityData || [];

      setStats({
        pendingBookings: bookingsList.filter((b) => b.status === 'pending_payment' || b.status === 'paid').length,
        confirmedBookings: bookingsList.filter((b) => b.status === 'confirmed').length,
        completedBookings: bookingsList.filter((b) => b.status === 'completed').length,
        activeAvailabilitySlots: availabilityList.filter((a) => a.is_active).length,
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

  const handleSubjectsUpdate = (newSubjects: string[]) => {
    if (tutor) {
      setTutor({ ...tutor, subjects: newSubjects });
    }
  };

  const handleRateUpdate = (newRate: number) => {
    if (tutor) {
      setTutor({ ...tutor, hourly_rate: newRate });
    }
  };

  if (loading || !tutor) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E85D4C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[#1F2937] tracking-tight">
              LesGo
            </span>
            <span className="text-[#E85D4C] text-xs font-medium tracking-wide uppercase">
              Tutor
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-body text-sm font-semibold text-[#1F2937]">{tutor.name}</p>
              <div className="flex items-center justify-end gap-1.5">
                {tutor.is_active ? (
                  <>
                    <span className="w-2 h-2 bg-[#10B981] rounded-full"></span>
                    <span className="font-body text-xs text-[#6B7280]">Tutor Aktif</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse"></span>
                    <span className="font-body text-xs text-[#F59E0B]">Menunggu Verifikasi</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-[#6B7280] hover:text-[#E85D4C] hover:bg-[#FEF2F0] rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Ringkasan"
            />
            <TabButton
              active={activeTab === 'schedule'}
              onClick={() => setActiveTab('schedule')}
              icon={<Clock className="w-4 h-4" />}
              label="Jadwal"
            />
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<User className="w-4 h-4" />}
              label="Pengaturan"
            />
          </nav>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Pending Verification Banner */}
        {!tutor.is_active && (
          <div className="mb-6 bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FEF2F0] rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock3 className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-[#1F2937]">Menunggu Verifikasi</h3>
                  <span className="px-2 py-0.5 bg-[#F59E0B] text-white text-xs font-body font-medium rounded-full">
                    Pending
                  </span>
                </div>
                <p className="font-body text-sm text-[#6B7280] mb-3">
                  Profil Anda sedang direview oleh tim admin. Proses verifikasi biasanya memakan waktu 1-2 hari kerja.
                  Anda akan menerima notifikasi via email setelah akun disetujui.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-[#0D9488]">
                    <Shield className="w-4 h-4" />
                    <span className="font-body">Anda dapat mengatur jadwal dan profil</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#0D9488]">
                    <Mail className="w-4 h-4" />
                    <span className="font-body">Notifikasi via email</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className={cn(
              "p-6 rounded-2xl text-white",
              tutor.is_active
                ? "bg-gradient-to-r from-[#E85D4C] to-[#F97316]"
                : "bg-gradient-to-r from-[#4B5563] to-[#6B7280]"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="font-display text-2xl font-bold">Selamat Datang, {tutor.name}!</h1>
                {!tutor.is_active && (
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-body font-medium rounded-full">
                    Preview Mode
                  </span>
                )}
              </div>
              <p className={cn(
                "font-body max-w-xl",
                tutor.is_active ? "text-white/90" : "text-white/80"
              )}>
                {tutor.is_active
                  ? "Kelola jadwal les Anda dan pantau pemesanan dari siswa."
                  : "Anda dapat mengatur jadwal dan profil sambil menunggu verifikasi. Setelah disetujui, profil Anda akan terlihat oleh siswa."
                }
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Wallet className="w-5 h-5" />}
                label="Saldo"
                value={`Rp ${wallet.balance.toLocaleString('id-ID')}`}
                color="success"
              />
              <StatCard
                icon={<BookOpen className="w-5 h-5" />}
                label="Booking Menunggu"
                value={stats.pendingBookings}
                color="warning"
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="Jadwal Aktif"
                value={stats.activeAvailabilitySlots}
                color="primary"
              />
              <StatCard
                icon={<Star className="w-5 h-5" />}
                label="Rating"
                value={tutor.rating > 0 ? `${tutor.rating}/5` : '-'}
                color="accent"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <QuickActionCard
                icon={<Clock className="w-6 h-6 text-[#E85D4C]" />}
                title="Kelola Jadwal"
                description="Tambah atau ubah jadwal ketersediaan Anda"
                onClick={() => setActiveTab('schedule')}
              />
              <QuickActionCard
                icon={<DollarSign className="w-6 h-6 text-[#0D9488]" />}
                title="Ubah Tarif"
                description="Sesuaikan tarif les per jam Anda"
                onClick={() => setActiveTab('settings')}
              />
            </div>

            {/* Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-display text-xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-[#E85D4C]" />
                Permintaan Booking Terbaru
              </h2>
              {!tutor.is_active ? (
                <div className="bg-gray-50 p-8 text-center rounded-xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Clock3 className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="font-display font-bold text-[#1F2937] mb-2">Booking Belum Tersedia</h3>
                  <p className="font-body text-sm text-[#6B7280] max-w-sm mx-auto">
                    Fitur booking akan aktif setelah akun Anda terverifikasi.
                    Anda akan menerima notifikasi via email ketika ada pemesanan.
                  </p>
                </div>
              ) : (
                <>
                  <BookingRequests bookings={bookings.slice(0, 5)} />
                  {bookings.length > 5 && (
                    <button className="w-full mt-4 py-2 font-body text-sm text-[#E85D4C] font-semibold hover:bg-[#FEF2F0] rounded-xl transition-colors">
                      Lihat Semua Booking
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#1F2937]">Jadwal Ketersediaan</h1>
                <p className="font-body text-[#6B7280]">Atur kapan Anda tersedia untuk mengajar</p>
              </div>
            </div>
            <AvailabilityManager tutorId={tutor.id} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#1F2937]">Pengaturan Profil</h1>
                <p className="font-body text-[#6B7280]">Kelola informasi dan tarif Anda</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <SubjectManager
                tutorId={tutor.id}
                subjects={tutor.subjects}
                onUpdate={handleSubjectsUpdate}
              />
              <RateManager
                tutorId={tutor.id}
                currentRate={tutor.hourly_rate}
                onUpdate={handleRateUpdate}
              />
            </div>

            {/* Profile Info Note */}
            <div className="bg-[#F0FDFA] border border-[#0D9488]/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-body font-bold text-[#1F2937]">Informasi Profil</h3>
                  <p className="font-body text-sm text-[#6B7280] mt-1">
                    Untuk mengubah nama, foto profil, atau data pribadi lainnya,
                    silakan hubungi admin melalui WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-3 font-body text-sm font-semibold border-b-2 transition-colors',
        active
          ? 'border-[#E85D4C] text-[#E85D4C]'
          : 'border-transparent text-[#6B7280] hover:text-[#1F2937] hover:border-gray-200'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'success' | 'warning' | 'primary' | 'accent';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    success: 'bg-[#ECFDF5] text-[#10B981]',
    warning: 'bg-[#FFFBEB] text-[#F59E0B]',
    primary: 'bg-[#FEF2F0] text-[#E85D4C]',
    accent: 'bg-gray-50 text-[#1F2937]',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colorClasses[color])}>
        {icon}
      </div>
      <p className="font-display text-2xl font-bold text-[#1F2937]">{value}</p>
      <p className="font-body text-sm text-[#6B7280]">{label}</p>
    </div>
  );
}

// Quick Action Card Component
interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function QuickActionCard({ icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-[#E85D4C] hover:shadow-md transition-all text-left group"
    >
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-[#FEF2F0] transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-[#1F2937]">{title}</h3>
        <p className="font-body text-sm text-[#6B7280]">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#E85D4C]" />
    </button>
  );
}
