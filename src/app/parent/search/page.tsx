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
import { Search, Loader2, MapPin, ArrowRight, Users, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header - Warm Modern */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[#1F2937] tracking-tight">
              LesGo
            </span>
            <span className="text-[#E85D4C] text-xs font-medium tracking-wide uppercase">
              Les Privat
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        {!searched && (
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEF2F0] rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#E85D4C]" />
              <span className="text-[#E85D4C] text-sm font-medium">
                Cari Guru Les Private
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-4 leading-tight">
              Temukan Guru
              <span className="text-[#E85D4C]"> Berkualitas</span>
            </h1>
            <p className="font-body text-[#6B7280] text-lg max-w-2xl mx-auto">
              Pilih mata pelajaran dan lokasi, kami akan mencarikan guru les terdekat yang berkualitas dan terverifikasi.
            </p>
          </div>
        )}

        {/* Search Form - Modern Card */}
        <div className={cn(
          "bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden",
          searched ? "mb-8" : "mb-10"
        )}>
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#E85D4C] to-[#F97316] px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  {searched ? 'Cari Guru Lainnya' : 'Cari Guru Les'}
                </h2>
                <p className="text-white/80 text-sm">
                  {searched ? 'Ubah pilihan untuk mencari guru lain' : 'Temukan tutor terbaik di sekitar Anda'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-8 space-y-6">
            {/* Quick Stats - Only show before search */}
            {!searched && (
              <div className="grid grid-cols-3 gap-4 mb-2">
                {[
                  { value: '500+', label: 'Guru Aktif', color: 'bg-[#FEF2F0] text-[#E85D4C]' },
                  { value: '15+', label: 'Mata Pelajaran', color: 'bg-[#F0FDFA] text-[#0D9488]' },
                  { value: '4.8', label: 'Rating', color: 'bg-[#FFFBEB] text-[#D97706]' },
                ].map((stat) => (
                  <div key={stat.label} className={cn("p-4 rounded-xl text-center", stat.color)}>
                    <div className="font-display text-2xl sm:text-3xl font-bold">{stat.value}</div>
                    <div className="font-body text-xs font-medium mt-1 opacity-80">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            <SubjectSelector value={subject} onChange={setSubject} />

            <WilayahLocationPicker
              onChange={setLocation}
              value={location || undefined}
            />

            {/* Search Button - Modern */}
            <Button
              onClick={searchTutors}
              disabled={loading || !isReadyToSearch}
              className={cn(
                "w-full h-14 sm:h-16 font-body font-semibold text-base transition-all duration-200 rounded-xl",
                !isReadyToSearch
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#E85D4C] hover:bg-[#C94A3B] text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-200 hover:-translate-y-0.5"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E85D4C] to-[#F97316] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#1F2937]">
                    {tutors.length > 0 ? `${tutors.length} Guru Ditemukan` : 'Hasil Pencarian'}
                  </h3>
                  <p className="font-body text-sm text-[#6B7280]">
                    {tutors.length > 0
                      ? `Untuk mata pelajaran ${subject}`
                      : 'Tidak ada guru yang ditemukan'}
                  </p>
                </div>
              </div>
              {tutors.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280] bg-gray-50 px-4 py-2 rounded-xl">
                  <MapPin className="w-4 h-4 text-[#E85D4C]" />
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
              <div className="bg-[#F0FDFA] border border-[#0D9488]/20 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#0D9488] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[#1F2937]">
                      Menampilkan tutor dalam radius <span className="text-[#0D9488]">{gpsSearchInfo.maxDistance} km</span>
                    </p>
                    <p className="font-body text-sm text-[#6B7280] mt-1">
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
              <div className="bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-2xl p-5">
                <p className="font-body text-sm text-[#92400E]">
                  <span className="font-semibold">Tidak ada guru di kelurahan/desa Anda.</span> Menampilkan guru di kecamatan terdekat.
                </p>
              </div>
            )}

            {/* Tutor Cards */}
            {tutors.length > 0 ? (
              <div className="grid gap-5">
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
              <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#1F2937] mb-2">
                  Belum Ada Guru di Area Ini
                </h3>
                <p className="font-body text-[#6B7280] max-w-md mx-auto mb-6 px-4">
                  Coba ubah lokasi atau pilih mata pelajaran lain. Anda juga bisa memperluas radius pencarian.
                </p>
                <Button
                  onClick={() => {
                    setSubject('');
                    setLocation(null);
                    setSearched(false);
                  }}
                  variant="outline"
                  className="rounded-xl px-6 border-[#E85D4C] text-[#E85D4C] hover:bg-[#E85D4C] hover:text-white"
                >
                  Coba Lagi
                </Button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
