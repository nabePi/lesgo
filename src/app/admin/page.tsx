'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  LogOut,
  ArrowRight,
  Loader2,
  UserCheck,
  UserX,
  MapPin,
  BookOpen,
} from 'lucide-react';

interface DashboardStats {
  totalTutors: number;
  pendingApprovals: number;
  activeTutors: number;
  totalBookings: number;
}

interface RecentTutor {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
  is_verified: boolean;
  is_active: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTutors: 0,
    pendingApprovals: 0,
    activeTutors: 0,
    totalBookings: 0,
  });
  const [recentTutors, setRecentTutors] = useState<RecentTutor[]>([]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      await loadDashboardData();
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Get tutor stats
      const { data: tutors } = await supabase
        .from('tutor_profiles')
        .select('is_verified, is_active, is_onboarded');

      const totalTutors = tutors?.length || 0;
      const pendingApprovals = tutors?.filter((t) => t.is_onboarded && !t.is_active).length || 0;
      const activeTutors = tutors?.filter((t) => t.is_active).length || 0;

      // Get total bookings
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalTutors,
        pendingApprovals,
        activeTutors,
        totalBookings: totalBookings || 0,
      });

      // Get recent tutors awaiting approval
      const { data: recent } = await supabase
        .from('tutor_profiles')
        .select(`
          user_id,
          is_verified,
          is_active,
          submitted_at,
          user:profiles!tutor_profiles_user_id_fkey(name, email)
        `)
        .eq('is_onboarded', true)
        .eq('is_active', false)
        .order('submitted_at', { ascending: false })
        .limit(5);

      const formattedRecent = (recent || []).map((tutor: Record<string, unknown>) => ({
        id: tutor.user_id as string,
        name: (tutor.user as Record<string, string>)?.name || 'Unknown',
        email: (tutor.user as Record<string, string>)?.email || '',
        submitted_at: tutor.submitted_at as string,
        is_verified: tutor.is_verified as boolean,
        is_active: tutor.is_active as boolean,
      }));

      setRecentTutors(formattedRecent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">LesGo Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/tutor-approvals')}
              className="hidden sm:flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Verifikasi Tutor
              {stats.pendingApprovals > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {stats.pendingApprovals}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-slate-500">Total Tutor</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalTutors}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-slate-500">Menunggu Verifikasi</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingApprovals}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-500">Tutor Aktif</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.activeTutors}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-slate-500">Total Booking</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Verifikasi Tutor</h3>
                <p className="text-indigo-100 text-sm mb-4">
                  {stats.pendingApprovals > 0
                    ? `Ada ${stats.pendingApprovals} tutor menunggu persetujuan`
                    : 'Tidak ada tutor yang menunggu persetujuan'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <Button
              onClick={() => router.push('/admin/tutor-approvals')}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Kelola Verifikasi
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Cari Tutor</h3>
                <p className="text-slate-500 text-sm">Lihat semua tutor yang terdaftar</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-slate-600" />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/parent/search')}
              className="w-full"
            >
              Lihat Daftar Tutor
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Recent Pending Tutors */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Tutor Menunggu Verifikasi</h2>
            {stats.pendingApprovals > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/tutor-approvals')}
              >
                Lihat Semua
              </Button>
            )}
          </div>

          {recentTutors.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Semua tutor sudah diverifikasi</h3>
              <p className="text-slate-500">Tidak ada tutor yang menunggu persetujuan</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{tutor.name}</h4>
                      <p className="text-sm text-slate-500">{tutor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                      {new Date(tutor.submitted_at).toLocaleDateString('id-ID')}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => router.push('/admin/tutor-approvals')}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
