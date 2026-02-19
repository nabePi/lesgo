'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Loader2,
  Search,
  MapPin,
  Star,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
} from 'lucide-react';

interface Tutor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp: string;
  bio: string;
  subjects: string[];
  hourly_rate: number;
  is_verified: boolean;
  is_active: boolean;
  is_onboarded: boolean;
  rating: number;
  total_reviews: number;
  address: string;
  submitted_at: string;
  approved_at: string;
  birth_place?: string;
  birth_date?: string;
  gender?: string;
  last_education?: string;
  school_name?: string;
  id_card_url?: string;
  selfie_url?: string;
  province_id?: string;
  city_id?: string;
  district_id?: string;
  village_id?: string;
  location_lat?: number;
  location_lng?: number;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'inactive';

export default function AdminTutorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [locationNames, setLocationNames] = useState<{
    province: string;
    city: string;
    district: string;
    village: string;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchQuery, statusFilter]);

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

      await loadTutors();
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTutors = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select(`
          *,
          user:profiles!tutor_profiles_user_id_fkey(name, email, whatsapp, birth_place, birth_date, gender)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTutors = (data || []).map((tutor: Record<string, unknown>) => ({
        id: tutor.id as string,
        user_id: tutor.user_id as string,
        name: (tutor.user as Record<string, string>)?.name || 'Unknown',
        email: (tutor.user as Record<string, string>)?.email || '',
        whatsapp: (tutor.user as Record<string, string>)?.whatsapp || '',
        bio: tutor.bio as string,
        subjects: tutor.subjects as string[],
        hourly_rate: tutor.hourly_rate as number,
        is_verified: tutor.is_verified as boolean,
        is_active: tutor.is_active as boolean,
        is_onboarded: tutor.is_onboarded as boolean,
        rating: tutor.rating as number,
        total_reviews: tutor.total_reviews as number,
        address: tutor.address as string,
        submitted_at: tutor.submitted_at as string,
        approved_at: tutor.approved_at as string,
        birth_place: (tutor.user as Record<string, string>)?.birth_place || '',
        birth_date: (tutor.user as Record<string, string>)?.birth_date || '',
        gender: (tutor.user as Record<string, string>)?.gender || '',
        last_education: tutor.last_education as string,
        school_name: tutor.school_name as string,
        id_card_url: tutor.id_card_url as string,
        selfie_url: tutor.selfie_url as string,
        province_id: tutor.province_id as string,
        city_id: tutor.city_id as string,
        district_id: tutor.district_id as string,
        village_id: tutor.village_id as string,
        location_lat: tutor.location_lat as number,
        location_lng: tutor.location_lng as number,
      }));

      setTutors(formattedTutors);
    } catch (error) {
      console.error('Error loading tutors:', error);
    }
  };

  const filterTutors = () => {
    let filtered = tutors;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tutor) => {
        if (statusFilter === 'active') return tutor.is_active;
        if (statusFilter === 'pending') return tutor.is_onboarded && !tutor.is_active;
        if (statusFilter === 'inactive') return !tutor.is_active && !tutor.is_onboarded;
        return true;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tutor) =>
          tutor.name.toLowerCase().includes(query) ||
          tutor.email.toLowerCase().includes(query) ||
          tutor.subjects.some((s) => s.toLowerCase().includes(query))
      );
    }

    setFilteredTutors(filtered);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const fetchLocationNames = async (tutor: Tutor) => {
    if (!tutor.province_id) return;

    setLoadingLocation(true);
    try {
      const names: { province: string; city: string; district: string; village: string } = {
        province: '',
        city: '',
        district: '',
        village: '',
      };

      if (tutor.province_id) {
        const res = await fetch('/api/wilayah/provinces');
        const provinces = await res.json();
        const province = provinces.find((p: { id: string; name: string }) => p.id === tutor.province_id);
        if (province) names.province = province.name;
      }

      if (tutor.city_id) {
        const res = await fetch(`/api/wilayah/cities?provinceId=${tutor.province_id}`);
        const cities = await res.json();
        const city = cities.find((c: { id: string; name: string }) => c.id === tutor.city_id);
        if (city) names.city = city.name;
      }

      if (tutor.district_id) {
        const res = await fetch(`/api/wilayah/districts?cityId=${tutor.city_id}`);
        const districts = await res.json();
        const district = districts.find((d: { id: string; name: string }) => d.id === tutor.district_id);
        if (district) names.district = district.name;
      }

      if (tutor.village_id) {
        const res = await fetch(`/api/wilayah/villages?districtId=${tutor.district_id}`);
        const villages = await res.json();
        const village = villages.find((v: { id: string; name: string }) => v.id === tutor.village_id);
        if (village) names.village = village.name;
      }

      setLocationNames(names);
    } catch (error) {
      console.error('Error fetching location names:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const openTutorDetail = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    fetchLocationNames(tutor);
  };

  const closeTutorDetail = () => {
    setSelectedTutor(null);
    setLocationNames(null);
  };

  const getStatusBadge = (tutor: Tutor) => {
    if (tutor.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          Aktif
        </span>
      );
    }
    if (tutor.is_onboarded) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" />
          Menunggu
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
        <XCircle className="w-3 h-3" />
        Belum Lengkap
      </span>
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredTutors.length / itemsPerPage);
  const paginatedTutors = filteredTutors.slice(
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
              <h1 className="font-bold text-slate-900">Daftar Tutor</h1>
              <p className="text-xs text-slate-500">{filteredTutors.length} tutor terdaftar</p>
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
              onClick={() => router.push('/admin/bookings')}
              className="hidden md:flex items-center gap-2"
            >
              Daftar Booking
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
                placeholder="Cari nama, email, atau mata pelajaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'pending', 'inactive'] as FilterStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' && 'Semua'}
                  {status === 'active' && 'Aktif'}
                  {status === 'pending' && 'Menunggu'}
                  {status === 'inactive' && 'Belum Lengkap'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Tutors List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {paginatedTutors.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Tidak ada tutor</h3>
              <p className="text-slate-500">Belum ada tutor yang terdaftar</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-200">
                {paginatedTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg text-slate-900">
                                {tutor.name}
                              </h3>
                              {getStatusBadge(tutor)}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {tutor.email}
                              </span>
                              {tutor.whatsapp && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {tutor.whatsapp}
                                </span>
                              )}
                            </div>

                            {tutor.subjects && tutor.subjects.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {tutor.subjects.map((subject) => (
                                  <span
                                    key={subject}
                                    className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                                  >
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            )}

                            {tutor.address && (
                              <p className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                                <MapPin className="w-3 h-3" />
                                {tutor.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-2">
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-600">
                            Rp {tutor.hourly_rate?.toLocaleString('id-ID')}/jam
                          </p>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>{tutor.rating || 0}</span>
                            <span>({tutor.total_reviews || 0} ulasan)</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTutorDetail(tutor)}
                        >
                          Detail
                        </Button>
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
                    {Math.min(currentPage * itemsPerPage, filteredTutors.length)} dari{' '}
                    {filteredTutors.length} tutor
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

      {/* Detail Modal */}
      {selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Tutor</h2>
              <button
                onClick={closeTutorDetail}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Data Pribadi</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Nama Lengkap</span>
                    <p className="font-medium">{selectedTutor.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Jenis Kelamin</span>
                    <p className="font-medium capitalize">{selectedTutor.gender === 'male' ? 'Laki-laki' : selectedTutor.gender === 'female' ? 'Perempuan' : '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                    <p className="font-medium">{selectedTutor.birth_place || '-'}, {selectedTutor.birth_date || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> WhatsApp
                    </span>
                    <p className="font-medium">{selectedTutor.whatsapp || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </span>
                    <p className="font-medium">{selectedTutor.email}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {(selectedTutor.id_card_url || selectedTutor.selfie_url) && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Dokumen</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTutor.id_card_url && (
                      <div>
                        <span className="text-slate-500 text-sm">KTP</span>
                        <img
                          src={selectedTutor.id_card_url.startsWith('http') ? selectedTutor.id_card_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tutor-documents/${selectedTutor.id_card_url}`}
                          alt="KTP"
                          className="mt-2 rounded-lg border w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50" y="50" text-anchor="middle">KTP Error</text></svg>';
                          }}
                        />
                      </div>
                    )}
                    {selectedTutor.selfie_url && (
                      <div>
                        <span className="text-slate-500 text-sm">Foto Diri</span>
                        <img
                          src={selectedTutor.selfie_url.startsWith('http') ? selectedTutor.selfie_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tutor-documents/${selectedTutor.selfie_url}`}
                          alt="Foto Diri"
                          className="mt-2 rounded-lg border w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50" y="50" text-anchor="middle">Foto Error</text></svg>';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Lokasi</h3>

                {selectedTutor.province_id && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-3">
                    {loadingLocation ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memuat data lokasi...
                      </div>
                    ) : locationNames?.province ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-slate-500 w-20">Provinsi</span>
                          <span className="text-sm font-medium text-slate-900">{locationNames.province}</span>
                        </div>
                        {locationNames.city && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-medium text-slate-500 w-20">Kota/Kab</span>
                            <span className="text-sm text-slate-800">{locationNames.city}</span>
                          </div>
                        )}
                        {locationNames.district && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-medium text-slate-500 w-20">Kecamatan</span>
                            <span className="text-sm text-slate-800">{locationNames.district}</span>
                          </div>
                        )}
                        {locationNames.village && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-medium text-slate-500 w-20">Desa/Kel</span>
                            <span className="text-sm text-slate-800">{locationNames.village}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Data lokasi tidak ditemukan</p>
                    )}
                  </div>
                )}

                {selectedTutor.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-xs mb-1">Alamat Lengkap</span>
                      <p className="text-slate-800">{selectedTutor.address}</p>
                    </div>
                  </div>
                )}

                {selectedTutor.location_lat && selectedTutor.location_lng && (
                  <p className="text-sm text-slate-500 mt-2 ml-6">
                    Koordinat: {selectedTutor.location_lat}, {selectedTutor.location_lng}
                  </p>
                )}
              </div>

              {/* Education */}
              {(selectedTutor.last_education || selectedTutor.school_name) && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Pendidikan</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{selectedTutor.last_education || '-'} - {selectedTutor.school_name || '-'}</span>
                  </div>
                </div>
              )}

              {/* Subjects & Rate */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Mengajar</h3>
                {selectedTutor.subjects && selectedTutor.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTutor.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-lg font-bold text-emerald-600">
                  Rp {selectedTutor.hourly_rate?.toLocaleString('id-ID')}/jam
                </p>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Status</h3>
                <div className="flex items-center gap-2">
                  {selectedTutor.is_active ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Aktif
                    </span>
                  ) : selectedTutor.is_onboarded ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Menunggu Verifikasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Belum Lengkap
                    </span>
                  )}
                </div>
                {selectedTutor.submitted_at && (
                  <p className="text-sm text-slate-500 mt-2">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Terdaftar: {new Date(selectedTutor.submitted_at).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end">
              <Button variant="outline" onClick={closeTutorDetail}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
