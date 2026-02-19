'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  User,
  LogOut,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface Booking {
  id: string;
  parent_name: string;
  parent_whatsapp: string;
  tutor_name: string;
  tutor_whatsapp: string;
  subject: string;
  session_date: string;
  session_time: string;
  duration_hours: number;
  address: string;
  status: string;
  hourly_rate: number;
  total_amount: number;
  notes: string;
  created_at: string;
}

type FilterStatus = 'all' | 'pending_payment' | 'paid' | 'confirmed' | 'completed' | 'cancelled';

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: {
    label: 'Menunggu Pembayaran',
    color: 'bg-amber-100 text-amber-700',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  paid: {
    label: 'Sudah Dibayar',
    color: 'bg-blue-100 text-blue-700',
    icon: <CreditCard className="w-3 h-3" />,
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'bg-indigo-100 text-indigo-700',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  in_progress: {
    label: 'Sedang Berlangsung',
    color: 'bg-purple-100 text-purple-700',
    icon: <Clock className="w-3 h-3" />,
  },
  completed: {
    label: 'Selesai',
    color: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-3 h-3" />,
  },
  declined: {
    label: 'Ditolak',
    color: 'bg-slate-100 text-slate-600',
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter]);

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

      await loadBookings();
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          parent:profiles!bookings_parent_id_fkey(name, whatsapp),
          tutor:profiles!bookings_tutor_id_fkey(name, whatsapp)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBookings = (data || []).map((booking: Record<string, unknown>) => ({
        id: booking.id as string,
        parent_name: (booking.parent as Record<string, string>)?.name || booking.parent_name as string || 'Unknown',
        parent_whatsapp: (booking.parent as Record<string, string>)?.whatsapp || booking.parent_whatsapp as string || '',
        tutor_name: (booking.tutor as Record<string, string>)?.name || 'Unknown',
        tutor_whatsapp: (booking.tutor as Record<string, string>)?.whatsapp || '',
        subject: booking.subject as string,
        session_date: booking.session_date as string,
        session_time: booking.session_time as string,
        duration_hours: booking.duration_hours as number,
        address: booking.address as string,
        status: booking.status as string,
        hourly_rate: booking.hourly_rate as number,
        total_amount: booking.total_amount as number,
        notes: booking.notes as string,
        created_at: booking.created_at as string,
      }));

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.parent_name.toLowerCase().includes(query) ||
          booking.tutor_name.toLowerCase().includes(query) ||
          booking.subject.toLowerCase().includes(query) ||
          booking.id.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const config = statusLabels[status] || {
      label: status,
      color: 'bg-slate-100 text-slate-600',
      icon: null,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              <h1 className="font-bold text-slate-900">Daftar Booking</h1>
              <p className="text-xs text-slate-500">{filteredBookings.length} booking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="hidden md:flex items-center gap-2"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/tutors')}
              className="hidden md:flex items-center gap-2"
            >
              Daftar Tutor
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/tutor-approvals')}
              className="hidden sm:flex items-center gap-2"
            >
              Verifikasi
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
        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari nama siswa, tutor, atau mata pelajaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending_payment', 'paid', 'confirmed', 'completed', 'cancelled'] as FilterStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' && 'Semua'}
                  {status === 'pending_payment' && 'Menunggu'}
                  {status === 'paid' && 'Dibayar'}
                  {status === 'confirmed' && 'Dikonfirmasi'}
                  {status === 'completed' && 'Selesai'}
                  {status === 'cancelled' && 'Dibatalkan'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {paginatedBookings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Tidak ada booking</h3>
              <p className="text-slate-500">Belum ada booking yang terdaftar</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-200">
                {paginatedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg text-slate-900">
                                {booking.subject}
                              </h3>
                              {getStatusBadge(booking.status)}
                            </div>

                            <p className="text-sm text-slate-500 mt-1">
                              ID: {booking.id}
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                              {/* Parent Info */}
                              <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Siswa</p>
                                <p className="font-medium text-slate-900">{booking.parent_name}</p>
                                {booking.parent_whatsapp && (
                                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                    <Phone className="w-3 h-3" />
                                    {booking.parent_whatsapp}
                                  </p>
                                )}
                              </div>

                              {/* Tutor Info */}
                              <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Tutor</p>
                                <p className="font-medium text-slate-900">{booking.tutor_name}</p>
                                {booking.tutor_whatsapp && (
                                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                    <Phone className="w-3 h-3" />
                                    {booking.tutor_whatsapp}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Session Details */}
                            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                              <span className="flex items-center gap-1 text-slate-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(booking.session_date)}
                              </span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <Clock className="w-4 h-4" />
                                {formatTime(booking.session_time)} ({booking.duration_hours} jam)
                              </span>
                            </div>

                            {booking.address && (
                              <p className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                                <MapPin className="w-3 h-3" />
                                {booking.address}
                              </p>
                            )}

                            {booking.notes && (
                              <p className="mt-2 text-sm text-slate-500 bg-yellow-50 p-2 rounded">
                                Catatan: {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-2">
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-600">
                            Rp {booking.total_amount?.toLocaleString('id-ID')}
                          </p>
                          <p className="text-sm text-slate-500">
                            Rp {booking.hourly_rate?.toLocaleString('id-ID')}/jam × {booking.duration_hours} jam
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">
                          Dibuat: {new Date(booking.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredBookings.length)} dari{' '}
                    {filteredBookings.length} booking
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-600">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
