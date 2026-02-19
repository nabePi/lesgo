'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SUBJECTS } from '@/types';
import { LocationPicker } from '@/components/LocationPicker';
import {
  User,
  Upload,
  MapPin,
  Clock,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  BookOpen,
  Wallet,
  Camera,
  FileText,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const daysOfWeek = [
  { id: 1, name: 'Senin', short: 'Sen' },
  { id: 2, name: 'Selasa', short: 'Sel' },
  { id: 3, name: 'Rabu', short: 'Rab' },
  { id: 4, name: 'Kamis', short: 'Kam' },
  { id: 5, name: 'Jumat', short: 'Jum' },
  { id: 6, name: 'Sabtu', short: 'Sab' },
  { id: 0, name: 'Minggu', short: 'Min' },
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
];

const educationOptions = [
  { value: 'SMA/SMK', label: 'SMA/SMK' },
  { value: 'D1', label: 'D1' },
  { value: 'D2', label: 'D2' },
  { value: 'D3', label: 'D3' },
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
];

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [villageId, setVillageId] = useState('');

  // Step 4: Availability
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  // Step 5: Teaching Info
  const [lastEducation, setLastEducation] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

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
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }
      setIdCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIdCardPreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }
      setSelfieFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelfiePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
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
        setError('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
        setLocationLoading(false);
      }
    );
  };

  const toggleAvailability = (dayId: number) => {
    const existing = availability.find(a => a.dayOfWeek === dayId);
    if (existing) {
      setAvailability(availability.filter(a => a.dayOfWeek !== dayId));
    } else {
      setAvailability([...availability, { dayOfWeek: dayId, startTime: '08:00', endTime: '17:00' }]);
    }
  };

  const updateAvailabilityTime = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(availability.map(a =>
      a.dayOfWeek === dayId ? { ...a, [field]: value } : a
    ));
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
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let idCardUrl = '';
      let selfieUrl = '';

      if (idCardFile) {
        idCardUrl = await uploadFile(idCardFile, `ktp/${user.id}`);
      }
      if (selfieFile) {
        selfieUrl = await uploadFile(selfieFile, `selfie/${user.id}`);
      }

      await supabase
        .from('profiles')
        .update({
          name: fullName,
          birth_place: birthPlace,
          birth_date: birthDate,
          gender,
          whatsapp,
        })
        .eq('id', user.id);

      await supabase
        .from('tutor_profiles')
        .update({
          address,
          location_lat: lat,
          location_lng: lng,
          province_id: provinceId,
          city_id: cityId,
          district_id: districtId,
          village_id: villageId,
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

      if (availability.length > 0) {
        const availabilityData = availability.map(slot => ({
          tutor_id: user.id,
          day_of_week: slot.dayOfWeek,
          start_time: slot.startTime,
          end_time: slot.endTime,
          is_active: true,
        }));

        await supabase.from('tutor_availability').insert(availabilityData);
      }

      router.push('/tutor/pending-approval');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsSubmitting(false);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!fullName.trim()) {
          setError('Nama lengkap wajib diisi');
          return false;
        }
        if (!birthPlace.trim()) {
          setError('Tempat lahir wajib diisi');
          return false;
        }
        if (!birthDate) {
          setError('Tanggal lahir wajib diisi');
          return false;
        }
        break;
      case 2:
        if (!idCardFile) {
          setError('Foto KTP wajib diupload');
          return false;
        }
        if (!selfieFile) {
          setError('Foto diri wajib diupload');
          return false;
        }
        break;
      case 3:
        if (!whatsapp.trim()) {
          setError('Nomor WhatsApp wajib diisi');
          return false;
        }
        if (!provinceId || !cityId || !districtId || !villageId) {
          setError('Lokasi domisili lengkap wajib dipilih');
          return false;
        }
        if (!address.trim()) {
          setError('Alamat lengkap wajib diisi');
          return false;
        }
        break;
      case 4:
        if (availability.length === 0) {
          setError('Pilih minimal 1 hari ketersediaan');
          return false;
        }
        break;
      case 5:
        if (!lastEducation) {
          setError('Pendidikan terakhir wajib dipilih');
          return false;
        }
        if (!schoolName.trim()) {
          setError('Nama sekolah/universitas wajib diisi');
          return false;
        }
        if (selectedSubjects.length === 0) {
          setError('Pilih minimal 1 mata pelajaran');
          return false;
        }
        if (!hourlyRate || parseInt(hourlyRate) < 10000) {
          setError('Tarif minimal Rp 10.000 per jam');
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Data Diri', icon: User },
      { num: 2, label: 'Dokumen', icon: FileText },
      { num: 3, label: 'Lokasi', icon: MapPin },
      { num: 4, label: 'Jadwal', icon: Clock },
      { num: 5, label: 'Mengajar', icon: GraduationCap },
    ];

    return (
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isCompleted = step > s.num;

              return (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                        isActive && 'bg-indigo-600 text-white ring-4 ring-indigo-100',
                        isCompleted && 'bg-emerald-500 text-white',
                        !isActive && !isCompleted && 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-1 font-medium hidden sm:block',
                        isActive && 'text-indigo-600',
                        isCompleted && 'text-emerald-600',
                        !isActive && !isCompleted && 'text-slate-400'
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        'w-8 sm:w-12 h-0.5 mx-1 sm:mx-2',
                        step > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Data Pribadi</h2>
              <p className="text-slate-500 mt-1">Lengkapi informasi dasar Anda</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="fullName" className="text-slate-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="mt-1.5 h-12"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthPlace" className="text-slate-700">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthPlace"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Contoh: Jakarta"
                    className="mt-1.5 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate" className="text-slate-700">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="mt-1.5 h-12 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Jenis Kelamin <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                      gender === 'male'
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:border-indigo-300 text-slate-600"
                    )}
                  >
                    <User className="w-5 h-5" />
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                      gender === 'female'
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:border-indigo-300 text-slate-600"
                    )}
                  >
                    <User className="w-5 h-5" />
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
              <h2 className="text-2xl font-bold text-slate-900">Dokumen Verifikasi</h2>
              <p className="text-slate-500 mt-1">Upload dokumen untuk verifikasi identitas</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* KTP Upload */}
              <div>
                <Label className="text-slate-700">
                  Foto KTP <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5">
                  {idCardPreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-indigo-200">
                      <img src={idCardPreview} alt="KTP Preview" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => { setIdCardFile(null); setIdCardPreview(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all">
                      <FileText className="w-10 h-10 text-slate-400 mb-3" />
                      <span className="text-sm font-medium text-slate-600">Upload KTP</span>
                      <span className="text-xs text-slate-400 mt-1">Maks 5MB</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleIdCardChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* Selfie Upload */}
              <div>
                <Label className="text-slate-700">
                  Foto Diri <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5">
                  {selfiePreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-indigo-200">
                      <img src={selfiePreview} alt="Selfie Preview" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => { setSelfieFile(null); setSelfiePreview(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all">
                      <Upload className="w-10 h-10 text-slate-400 mb-3" />
                      <span className="text-sm font-medium text-slate-600">Upload Foto Diri</span>
                      <span className="text-xs text-slate-400 mt-1">Maks 5MB</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleSelfieChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Tips Upload Dokumen</p>
                <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                  <li>Pastikan foto KTP terbaca jelas</li>
                  <li>Foto diri dengan pencahayaan terang</li>
                  <li>Wajah terlihat jelas tanpa penutup</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Kontak & Lokasi</h2>
              <p className="text-slate-500 mt-1">Informasi untuk komunikasi dengan siswa</p>
            </div>

            <div className="space-y-5">
              {/* WhatsApp */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <Label htmlFor="whatsapp" className="text-indigo-900 font-medium">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-indigo-600 mb-2">Siswa akan menghubungi Anda melalui WhatsApp</p>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="08123456789"
                    className="pl-10 h-12 bg-white"
                  />
                </div>
              </div>

              {/* Location Picker */}
              <div>
                <Label className="text-slate-700">
                  Lokasi Domisili <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5 bg-white rounded-xl border border-slate-200 p-4">
                  <LocationPicker
                    onChange={(location) => {
                      setProvinceId(location.provinceId);
                      setCityId(location.cityId);
                      setDistrictId(location.districtId);
                      setVillageId(location.villageId);
                    }}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-slate-700">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Mawar No. 123, RT 01/RW 02, dekat sekolah..."
                  className="w-full p-3 mt-1.5 border border-slate-200 rounded-xl min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tambahkan nomor rumah, RT/RW, atau patokan agar mudah ditemukan
                </p>
              </div>

              {/* GPS Location (Optional) */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <Label className="text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Pin Lokasi (Opsional)
                </Label>
                <p className="text-sm text-slate-500 mb-3">
                  Membantu siswa menemukan lokasi Anda dengan lebih akurat
                </p>
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  variant="outline"
                  className="w-full h-11"
                >
                  {locationLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <MapPin className="w-5 h-5 mr-2" />
                  )}
                  {lat && lng ? 'Lokasi Tersimpan ✓' : 'Dapatkan Lokasi Saat Ini'}
                </Button>
                {lat && lng && (
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
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
              <h2 className="text-2xl font-bold text-slate-900">Jadwal Ketersediaan</h2>
              <p className="text-slate-500 mt-1">Pilih hari dan jam Anda tersedia untuk mengajar</p>
            </div>

            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const isSelected = availability.some(a => a.dayOfWeek === day.id);
                const slot = availability.find(a => a.dayOfWeek === day.id);

                return (
                  <div
                    key={day.id}
                    className={cn(
                      "rounded-xl border-2 transition-all overflow-hidden",
                      isSelected
                        ? "border-indigo-200 bg-indigo-50/50"
                        : "border-slate-200 hover:border-indigo-200"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAvailability(day.id)}
                      className="w-full flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-medium",
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {day.short}
                        </div>
                        <span className={cn("font-medium", isSelected ? "text-indigo-900" : "text-slate-700")}>
                          {day.name}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                          isSelected
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-slate-300"
                        )}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </button>

                    {isSelected && slot && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-slate-500">Jam Mulai</Label>
                            <select
                              value={slot.startTime}
                              onChange={(e) => updateAvailabilityTime(day.id, 'startTime', e.target.value)}
                              className="w-full p-2.5 mt-1 border border-slate-200 rounded-lg bg-white"
                            >
                              {timeSlots.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Jam Selesai</Label>
                            <select
                              value={slot.endTime}
                              onChange={(e) => updateAvailabilityTime(day.id, 'endTime', e.target.value)}
                              className="w-full p-2.5 mt-1 border border-slate-200 rounded-lg bg-white"
                            >
                              {timeSlots.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {availability.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">{availability.length} hari</span> dipilih sebagai jadwal mengajar
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Informasi Mengajar</h2>
              <p className="text-slate-500 mt-1">Lengkapi data pendidikan dan mengajar Anda</p>
            </div>

            <div className="space-y-5">
              {/* Education */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Label className="text-slate-700">
                  Pendidikan Terakhir <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                  {educationOptions.map((edu) => (
                    <button
                      key={edu.value}
                      type="button"
                      onClick={() => setLastEducation(edu.value)}
                      className={cn(
                        "py-2 px-1 rounded-lg border-2 text-sm font-medium transition-all",
                        lastEducation === edu.value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-indigo-300 text-slate-600"
                      )}
                    >
                      {edu.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* School Name */}
              <div>
                <Label htmlFor="schoolName" className="text-slate-700">
                  Nama Sekolah/Universitas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Contoh: Universitas Indonesia"
                  className="mt-1.5 h-12"
                />
              </div>

              {/* Subjects */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Label className="text-slate-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Mata Pelajaran <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-slate-500 mb-3">Pilih semua pelajaran yang bisa Anda ajar</p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                        selectedSubjects.includes(subject)
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-indigo-300 text-slate-600"
                      )}
                    >
                      {selectedSubjects.includes(subject) && (
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      )}
                      {subject}
                    </button>
                  ))}
                </div>
                {selectedSubjects.length > 0 && (
                  <p className="text-sm text-emerald-600 mt-3">
                    <span className="font-medium">{selectedSubjects.length}</span> mata pelajaran dipilih
                  </p>
                )}
              </div>

              {/* Hourly Rate */}
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                <Label htmlFor="hourlyRate" className="text-emerald-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Tarif per Jam <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-emerald-700 mb-2">Tentukan tarif les Anda per jam</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="50000"
                    className="pl-12 h-14 text-lg bg-white border-emerald-200"
                    min="10000"
                    step="5000"
                  />
                </div>
                <p className="text-xs text-emerald-600 mt-2">Minimal Rp 10.000 per jam</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-slate-900">Pendaftaran Tutor</h1>
          <div className="text-sm text-slate-500">
            Langkah <span className="font-semibold text-indigo-600">{step}</span> dari 5
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {renderStep()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 1 ? (
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              className="h-12 px-6"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Kembali
            </Button>
          ) : (
            <div className="w-24" />
          )}

          <div className="flex-1" />

          {step < 5 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700"
            >
              Lanjut
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Kirim Pendaftaran
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
