'use client';

import { useState } from 'react';
import { SubjectSelector } from '@/components/search/SubjectSelector';
import { WilayahLocationPicker } from '@/components/search/WilayahLocationPicker';
import { TutorCard } from '@/components/search/TutorCard';
import { TutorProfile } from '@/types';
import type { SelectedLocation } from '@/types/wilayah';

import { Button } from '@/components/ui/button';

interface LocationWithGps extends SelectedLocation {
  coords?: { lat: number; lng: number };
  address?: string;
}

interface TutorWithDistance extends TutorProfile {
  distance?: number;
}
import { Search, Loader2, GraduationCap, MapPin, Sparkles, ArrowRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SearchPage() {
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState<LocationWithGps | null>(null);
  const [tutors, setTutors] = useState<TutorWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [gpsSearchInfo, setGpsSearchInfo] = useState<{ maxDistance: number; totalFound: number } | null>(null);

  const searchTutors = async () => {
    // Allow search if subject AND (village OR coords) are available
    if (!subject || (!location?.village && !location?.coords)) return;

    setLoading(true);
    setSearched(true);
    try {
      let url = `/api/tutors/search?subject=${encodeURIComponent(subject)}`;

      if (location?.village) {
        // Manual location search
        url += `&villageId=${location.village.id}&districtId=${location.district?.id}`;
      } else if (location?.coords) {
        // GPS location search with 15km radius
        url += `&lat=${location.coords.lat}&lng=${location.coords.lng}&maxDistance=15`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setTutors(data.tutors || []);
      setExpanded(data.expanded || false);

      // Capture GPS search info
      if (data.gpsSearch) {
        setGpsSearchInfo({
          maxDistance: data.maxDistance,
          totalFound: data.totalFound
        });
      } else {
        setGpsSearchInfo(null);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isReadyToSearch = subject && (location?.village || location?.coords);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">LesGo</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-full hover:bg-indigo-50"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Hero Section */}
        {!searched && (
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Temukan guru les terbaik di sekitar Anda
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              Guru Les Private
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Langsung ke Rumah Anda
              </span>
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Pilih mata pelajaran dan lokasi, kami akan mencarikan guru les terdekat yang berkualitas dan terverifikasi.
            </p>
          </div>
        )}

        {/* Search Form */}
        <div className={cn(
          "bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden",
          searched ? "mb-6" : "mb-8"
        )}>
          {/* Form Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 sm:px-8 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {searched ? 'Cari Guru Lainnya' : 'Cari Guru Les'}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {searched ? 'Ubah pilihan untuk mencari guru lain' : 'Temukan tutor terbaik di sekitar Anda'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-8 space-y-6">
            {/* Quick Stats - Only show before search */}
            {!searched && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-2">
                <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">500+</div>
                  <div className="text-xs sm:text-sm text-slate-600">Guru Aktif</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">15+</div>
                  <div className="text-xs sm:text-sm text-slate-600">Mata Pelajaran</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">4.8</div>
                  <div className="text-xs sm:text-sm text-slate-600">Rating Rata-rata</div>
                </div>
              </div>
            )}

            <SubjectSelector value={subject} onChange={setSubject} />

            <WilayahLocationPicker
              onChange={setLocation}
              value={location || undefined}
            />

            {/* Search Button */}
            <Button
              onClick={searchTutors}
              disabled={loading || !isReadyToSearch}
              className={cn(
                "w-full h-14 sm:h-16 text-base sm:text-lg font-bold transition-all duration-300 rounded-2xl",
                !isReadyToSearch
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mencari guru terdekat...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {!subject ? (
                    <>Pilih Mata Pelajaran Dulu</>
                  ) : (!location?.village && !location?.coords) ? (
                    <>Pilih Lokasi Dulu</>
                  ) : (
                    <>
                      Cari Guru Sekarang
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="space-y-5">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {tutors.length > 0 ? `${tutors.length} Guru Ditemukan` : 'Hasil Pencarian'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {tutors.length > 0
                      ? `Untuk mata pelajaran ${subject}`
                      : 'Tidak ada guru yang ditemukan'}
                  </p>
                </div>
              </div>
              {tutors.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  {expanded
                    ? 'Dalam kecamatan yang sama'
                    : gpsSearchInfo
                      ? `Radius ${gpsSearchInfo.maxDistance} km`
                      : 'Dalam kelurahan/desa yang sama'}
                </div>
              )}
            </div>

            {/* GPS Search Info */}
            {gpsSearchInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Menampilkan tutor dalam radius <span className="text-blue-600">{gpsSearchInfo.maxDistance} km</span>
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {gpsSearchInfo.totalFound === 0
                        ? 'Tidak ada tutor ditemukan dalam jarak ini. Coba perluas radius pencarian atau pilih lokasi manual.'
                        : `Ditemukan ${gpsSearchInfo.totalFound} tutor terdekat dari lokasi Anda`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Expanded search indicator */}
            {expanded && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Tidak ada guru di kelurahan/desa Anda.</span> Menampilkan guru di kecamatan terdekat.
                </p>
              </div>
            )}

            {/* Tutor Cards */}
            {tutors.length > 0 ? (
              <div className="grid gap-4 sm:gap-5">
                {tutors.map((tutor, index) => (
                  <div
                    key={tutor.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TutorCard
                      tutor={tutor}
                      distance={tutor.distance}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12 sm:py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-900 text-xl mb-2">
                  Belum Ada Guru di Area Ini
                </h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6 px-4">
                  Coba ubah lokasi atau pilih mata pelajaran lain. Anda juga bisa memperluas radius pencarian.
                </p>
                <Button
                  onClick={() => {
                    setSubject('');
                    setLocation(null);
                    setSearched(false);
                  }}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  Coba Lagi
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Features Section - Only show before search */}
        {!searched && (
          <div className="mt-12 sm:mt-16">
            <h2 className="text-center font-bold text-2xl sm:text-3xl text-slate-900 mb-8">
              Kenapa Pilih <span className="text-indigo-600">LesGo</span>?
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Tutor Terdekat</h3>
                <p className="text-slate-600 text-sm">Cari guru les dalam radius 15km dari lokasi Anda dengan mudah</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Guru Terverifikasi</h3>
                <p className="text-slate-600 text-sm">Semua tutor telah melalui proses verifikasi ketat dan berkualitas</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Rating Transparan</h3>
                <p className="text-slate-600 text-sm">Lihat ulasan dan rating dari orang tua lain sebelum memilih</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
