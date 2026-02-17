'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SUBJECTS } from '@/types';
import {
  User,
  Calendar,
  MapPin,
  Upload,
  GraduationCap,
  Clock,
  Phone,
  BookOpen,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const daysOfWeek = [
  { id: 0, name: 'Minggu' },
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Step 2: Documents
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');

  // Step 3: Contact & Location
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Step 4: Availability
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  // Step 5: Education & Teaching
  const [lastEducation, setLastEducation] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');

  const educationOptions = [
    'SMA/SMK',
    'D1',
    'D2',
    'D3',
    'S1',
    'S2',
    'S3'
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if tutor already onboarded
    const { data: tutor } = await supabase
      .from('tutor_profiles')
      .select('is_onboarded, is_active')
      .eq('user_id', user.id)
      .single();

    if (tutor?.is_onboarded) {
      if (tutor.is_active) {
        router.push('/tutor/dashboard');
      } else {
        router.push('/tutor/pending-approval');
      }
    }
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIdCardPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelfiePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocationLoading(false);
      },
      () => {
        setError('Gagal mendapatkan lokasi. Silakan coba lagi.');
        setLocationLoading(false);
      }
    );
  };

  const addAvailabilitySlot = () => {
    setAvailability([...availability, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  };

  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: string | number) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('tutor-documents')
      .upload(`${path}/${Date.now()}-${file.name}`, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload documents
      let idCardUrl = '';
      let selfieUrl = '';

      if (idCardFile) {
        idCardUrl = await uploadFile(idCardFile, `ktp/${user.id}`);
      }
      if (selfieFile) {
        selfieUrl = await uploadFile(selfieFile, `selfie/${user.id}`);
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: fullName,
          birth_place: birthPlace,
          birth_date: birthDate,
          gender,
          whatsapp,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update tutor profile
      const { error: tutorError } = await supabase
        .from('tutor_profiles')
        .update({
          address,
          location_lat: lat,
          location_lng: lng,
          id_card_url: idCardUrl,
          selfie_url: selfieUrl,
          last_education: lastEducation,
          school_name: schoolName,
          subjects: selectedSubjects,
          hourly_rate: parseInt(hourlyRate),
          is_onboarded: true,
          submitted_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (tutorError) throw tutorError;

      // Save availability
      if (availability.length > 0) {
        const availabilityData = availability.map(slot => ({
          tutor_id: user.id,
          day_of_week: slot.dayOfWeek,
          start_time: slot.startTime,
          end_time: slot.endTime,
        }));

        const { error: availError } = await supabase
          .from('tutor_availability')
          .insert(availabilityData);

        if (availError) throw availError;
      }

      router.push('/tutor/pending-approval');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!fullName || !birthPlace || !birthDate) {
          setError('Semua field wajib diisi');
          return false;
        }
        break;
      case 2:
        if (!idCardFile || !selfieFile) {
          setError('KTP dan foto diri wajib diupload');
          return false;
        }
        break;
      case 3:
        if (!whatsapp || !address || !lat || !lng) {
          setError('WhatsApp, alamat, dan lokasi wajib diisi');
          return false;
        }
        break;
      case 4:
        if (availability.length === 0) {
          setError('Minimal tambahkan 1 jadwal ketersediaan');
          return false;
        }
        break;
      case 5:
        if (!lastEducation || !schoolName || selectedSubjects.length === 0 || !hourlyRate) {
          setError('Semua field wajib diisi');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError(null);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Data Pribadi</h2>
              <p className="text-slate-500">Lengkapi data diri Anda</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <Label htmlFor="birthPlace">Tempat Lahir</Label>
                <Input
                  id="birthPlace"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Contoh: Jakarta"
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Jenis Kelamin</Label>
                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                      gender === 'male'
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                      gender === 'female'
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    Perempuan
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Dokumen</h2>
              <p className="text-slate-500">Upload dokumen verifikasi</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Foto KTP</Label>
                <div className="mt-2">
                  {idCardPreview ? (
                    <div className="relative">
                      <img src={idCardPreview} alt="KTP Preview" className="w-full h-48 object-cover rounded-xl" />
                      <button
                        onClick={() => { setIdCardFile(null); setIdCardPreview(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">Klik untuk upload KTP</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleIdCardChange} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label>Foto Diri (Pas Foto)</Label>
                <div className="mt-2">
                  {selfiePreview ? (
                    <div className="relative">
                      <img src={selfiePreview} alt="Selfie Preview" className="w-full h-48 object-cover rounded-xl" />
                      <button
                        onClick={() => { setSelfieFile(null); setSelfiePreview(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">Klik untuk upload foto diri</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleSelfieChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Kontak & Lokasi</h2>
              <p className="text-slate-500">Informasi kontak dan lokasi mengajar</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="08123456789"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Alamat Lengkap</Label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Mawar No. 123, Kelurahan..., Kecamatan..., Kota..."
                  className="w-full p-3 border border-slate-200 rounded-xl min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <Label>Pin Lokasi Anda</Label>
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  variant="outline"
                  className="w-full mt-2 h-12"
                >
                  {locationLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <MapPin className="w-5 h-5 mr-2" />
                  )}
                  {lat && lng ? 'Lokasi Tersimpan ✓' : 'Dapatkan Lokasi Saat Ini'}
                </Button>
                {lat && lng && (
                  <p className="text-sm text-slate-500 mt-2">
                    Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Jadwal Ketersediaan</h2>
              <p className="text-slate-500">Tentukan kapan Anda tersedia mengajar</p>
            </div>

            <div className="space-y-4">
              {availability.map((slot, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Jadwal {index + 1}</span>
                    <button
                      onClick={() => removeAvailabilitySlot(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Hapus
                    </button>
                  </div>

                  <div>
                    <Label className="text-sm">Hari</Label>
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => updateAvailabilitySlot(index, 'dayOfWeek', parseInt(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg mt-1"
                    >
                      {daysOfWeek.map(day => (
                        <option key={day.id} value={day.id}>{day.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Mulai</Label>
                      <select
                        value={slot.startTime}
                        onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg mt-1"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm">Selesai</Label>
                      <select
                        value={slot.endTime}
                        onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg mt-1"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={addAvailabilitySlot}
                variant="outline"
                className="w-full h-12 border-dashed"
              >
                + Tambah Jadwal
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pendidikan & Mengajar</h2>
              <p className="text-slate-500">Informasi pendidikan dan mengajar</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Pendidikan Terakhir</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {educationOptions.map((edu) => (
                    <button
                      key={edu}
                      type="button"
                      onClick={() => setLastEducation(edu)}
                      className={cn(
                        "py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                        lastEducation === edu
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {edu}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="schoolName">Nama Sekolah/Universitas</Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Contoh: Universitas Indonesia"
                />
              </div>

              <div>
                <Label>Mata Pelajaran yang Diajarkan</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={cn(
                        "px-3 py-2 rounded-full text-sm font-medium border-2 transition-all",
                        selectedSubjects.includes(subject)
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {selectedSubjects.includes(subject) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="hourlyRate">Tarif per Jam (Rp)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="50000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-slate-900">Lengkapi Profil Tutor</h1>
          <div className="text-sm text-slate-500">
            Langkah {step} dari 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white">
        <div className="max-w-lg mx-auto">
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              className="flex-1 h-12"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Kembali
            </Button>
          )}

          {step < 5 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700"
            >
              Lanjut
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Kirim untuk Verifikasi
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
