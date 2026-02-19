'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, User, MapPin, GraduationCap, Clock, Loader2, Phone, Calendar, Building2, Mail, CheckIcon, XIcon } from 'lucide-react';

interface PendingTutor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  address: string;
  location_lat: number;
  location_lng: number;
  province_id: string;
  city_id: string;
  district_id: string;
  village_id: string;
  id_card_url: string;
  selfie_url: string;
  last_education: string;
  school_name: string;
  subjects: string[];
  hourly_rate: number;
  submitted_at: string;
  availability: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[];
}

interface NotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Helper function to get public URL for storage files
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqmolmghcnpuhztjnuqg.supabase.co';

const getStorageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const parts = path.split('/');
  const encodedParts = parts.map((part, index) => {
    if (index === parts.length - 1) {
      return encodeURIComponent(part);
    }
    return part;
  });
  const encodedPath = encodedParts.join('/');
  return `${SUPABASE_URL}/storage/v1/object/public/tutor-documents/${encodedPath}`;
};

export default function TutorApprovalsPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<PendingTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<PendingTutor | null>(null);
  const [locationNames, setLocationNames] = useState<{
    province: string;
    city: string;
    district: string;
    village: string;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchPendingTutors();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type, message: '' });
    }, 5000);
  };

  const fetchPendingTutors = async () => {
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

      const { data, error } = await supabase
        .from('tutor_profiles')
        .select(`
          *,
          user:profiles!tutor_profiles_user_id_fkey(name, email, whatsapp, birth_place, birth_date, gender)
        `)
        .eq('is_onboarded', true)
        .eq('is_active', false)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const tutorsWithAvailability = await Promise.all(
        (data || []).map(async (tutor: Record<string, unknown>) => {
          const { data: availability, error: availError } = await supabase
            .from('tutor_availability')
            .select('*')
            .eq('tutor_id', tutor.user_id);

          if (availError) {
            console.error('Error fetching availability for tutor', tutor.user_id, availError);
          }

          return {
            ...tutor,
            name: (tutor.user as Record<string, string>)?.name,
            email: (tutor.user as Record<string, string>)?.email,
            whatsapp: (tutor.user as Record<string, string>)?.whatsapp,
            birth_place: (tutor.user as Record<string, string>)?.birth_place,
            birth_date: (tutor.user as Record<string, string>)?.birth_date,
            gender: (tutor.user as Record<string, string>)?.gender,
            availability: availability || [],
            province_id: (tutor as Record<string, string>)?.province_id,
            city_id: (tutor as Record<string, string>)?.city_id,
            district_id: (tutor as Record<string, string>)?.district_id,
            village_id: (tutor as Record<string, string>)?.village_id,
          };
        })
      );

      setTutors(tutorsWithAvailability as PendingTutor[]);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      showNotification('error', 'Gagal memuat data tutor');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailNotification = async (email: string, name: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send email notification:', errorData);
      } else {
        const data = await response.json();
        console.log('Email notification result:', data);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleApprove = async (tutorId: string, tutorEmail: string, tutorName: string) => {
    setProcessing(tutorId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Approving tutor:', { tutorId, tutorEmail, tutorName, adminUserId: user?.id });

      const { data, error } = await supabase
        .from('tutor_profiles')
        .update({
          is_active: true,
          is_verified: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('user_id', tutorId)
        .select();

      console.log('Update result:', { data, error });

      if (error) throw error;

      // Send email notification
      await sendEmailNotification(tutorEmail, tutorName, 'approved');

      showNotification('success', `Tutor ${tutorName} berhasil disetujui! Email notifikasi telah dikirim.`);

      // Refresh list
      await fetchPendingTutors();
      setSelectedTutor(null);
    } catch (error) {
      console.error('Error approving tutor:', error);
      showNotification('error', 'Gagal menyetujui tutor. Silakan coba lagi.');
    } finally {
      setProcessing(null);
    }
  };

  const fetchLocationNames = async (tutor: PendingTutor) => {
    if (!tutor.province_id) return;

    setLoadingLocation(true);
    try {
      const names: { province: string; city: string; district: string; village: string } = {
        province: '',
        city: '',
        district: '',
        village: '',
      };

      // Fetch province name
      if (tutor.province_id) {
        const res = await fetch('/api/wilayah/provinces');
        const provinces = await res.json();
        const province = provinces.find((p: { id: string; name: string }) => p.id === tutor.province_id);
        if (province) names.province = province.name;
      }

      // Fetch city name
      if (tutor.city_id) {
        const res = await fetch(`/api/wilayah/cities?provinceId=${tutor.province_id}`);
        const cities = await res.json();
        const city = cities.find((c: { id: string; name: string }) => c.id === tutor.city_id);
        if (city) names.city = city.name;
      }

      // Fetch district name
      if (tutor.district_id) {
        const res = await fetch(`/api/wilayah/districts?cityId=${tutor.city_id}`);
        const districts = await res.json();
        const district = districts.find((d: { id: string; name: string }) => d.id === tutor.district_id);
        if (district) names.district = district.name;
      }

      // Fetch village name
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

  const handleReject = async (tutorId: string, tutorEmail: string, tutorName: string) => {
    if (!confirm(`Yakin ingin menolak tutor ${tutorName}?`)) return;

    setProcessing(tutorId);
    try {
      const { error } = await supabase
        .from('tutor_profiles')
        .update({
          is_active: false,
          is_onboarded: false,
        })
        .eq('user_id', tutorId);

      if (error) throw error;

      // Send email notification
      await sendEmailNotification(tutorEmail, tutorName, 'rejected');

      showNotification('success', `Tutor ${tutorName} telah ditolak. Email notifikasi telah dikirim.`);

      await fetchPendingTutors();
      setSelectedTutor(null);
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      showNotification('error', 'Gagal menolak tutor. Silakan coba lagi.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-md animate-fade-in ${
          notification.type === 'success' ? 'bg-success text-white' : 'bg-error text-white'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <XIcon className="w-5 h-5" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">
            Verifikasi Tutor ({tutors.length})
          </h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            Kembali
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {tutors.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900">Semua tutor sudah diverifikasi</h2>
            <p className="text-slate-500">Tidak ada tutor yang menunggu persetujuan</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tutors.map((tutor) => (
              <div
                key={tutor.user_id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{tutor.name}</h3>
                      <p className="text-slate-500">{tutor.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {tutor.last_education} - {tutor.school_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Rp {tutor.hourly_rate?.toLocaleString('id-ID')}/jam
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('Selected tutor:', tutor);
                        setSelectedTutor(tutor);
                        fetchLocationNames(tutor);
                      }}
                    >
                      Lihat Detail
                    </Button>
                    <Button
                      onClick={() => handleApprove(tutor.user_id, tutor.email, tutor.name)}
                      disabled={processing === tutor.user_id}
                      className="bg-success hover:bg-success-hover"
                    >
                      {processing === tutor.user_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(tutor.user_id, tutor.email, tutor.name)}
                      disabled={processing === tutor.user_id}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Tutor</h2>
              <button
                onClick={() => {
                  setSelectedTutor(null);
                  setLocationNames(null);
                }}
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
                    <p className="font-medium capitalize">{selectedTutor.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                    <p className="font-medium">{selectedTutor.birth_place}, {selectedTutor.birth_date}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> WhatsApp
                    </span>
                    <p className="font-medium">{selectedTutor.whatsapp}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Dokumen</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-sm">KTP</span>
                    {selectedTutor.id_card_url ? (
                      <img
                        src={getStorageUrl(selectedTutor.id_card_url) || ''}
                        alt="KTP"
                        className="mt-2 rounded-lg border w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50" y="50" text-anchor="middle">KTP Error</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="mt-2 rounded-lg border w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                        KTP tidak tersedia
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 text-sm">Foto Diri</span>
                    {selectedTutor.selfie_url ? (
                      <img
                        src={getStorageUrl(selectedTutor.selfie_url) || ''}
                        alt="Foto Diri"
                        className="mt-2 rounded-lg border w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50" y="50" text-anchor="middle">Foto Error</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="mt-2 rounded-lg border w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                        Foto tidak tersedia
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Lokasi</h3>

                {/* Hierarchical Location */}
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

                {/* Full Address */}
                {selectedTutor.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-xs mb-1">Alamat Lengkap</span>
                      <p className="text-slate-800">{selectedTutor.address}</p>
                    </div>
                  </div>
                )}

                {/* GPS Coordinates */}
                {selectedTutor.location_lat && selectedTutor.location_lng && (
                  <p className="text-sm text-slate-500 mt-2 ml-6">
                    Koordinat: {selectedTutor.location_lat}, {selectedTutor.location_lng}
                  </p>
                )}
              </div>

              {/* Education */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Pendidikan</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{selectedTutor.last_education} - {selectedTutor.school_name}</span>
                </div>
              </div>

              {/* Subjects & Rate */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Mengajar</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTutor.subjects?.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  Rp {selectedTutor.hourly_rate?.toLocaleString('id-ID')}/jam
                </p>
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Jadwal Tersedia</h3>
                {selectedTutor.availability && selectedTutor.availability.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTutor.availability.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{daysOfWeek[slot.day_of_week]}</span>
                        <span className="text-slate-500">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded">
                    Tidak ada jadwal ketersediaan yang diatur
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => handleReject(selectedTutor.user_id, selectedTutor.email, selectedTutor.name)}
                disabled={processing === selectedTutor.user_id}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Tolak
              </Button>
              <Button
                onClick={() => handleApprove(selectedTutor.user_id, selectedTutor.email, selectedTutor.name)}
                disabled={processing === selectedTutor.user_id}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {processing === selectedTutor.user_id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Setujui Tutor
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
