'use client';

import { useState } from 'react';
import { SubjectSelector } from '@/components/search/SubjectSelector';
import { WilayahLocationPicker } from '@/components/search/WilayahLocationPicker';
import { TutorCard } from '@/components/search/TutorCard';
import { TutorProfile } from '@/types';
import type { SelectedLocation } from '@/types/wilayah';
import { Button } from '@/components/ui/button';
import { Search, Loader2, GraduationCap, Users, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SearchPage() {
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const searchTutors = async () => {
    if (!subject || !location?.village) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(
        `/api/tutors/search?subject=${encodeURIComponent(subject)}&villageId=${location.village.id}&districtId=${location.district?.id}`
      );
      const data = await response.json();
      setTutors(data.tutors || []);
      setExpanded(data.expanded || false);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Search Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Cari Guru Les</h1>
              <p className="text-sm text-slate-500">Temukan tutor terdekat berdasarkan lokasi Anda</p>
            </div>
          </div>

          <div className="space-y-5">
            <SubjectSelector value={subject} onChange={setSubject} />
            <WilayahLocationPicker
              onChange={setLocation}
              value={location || undefined}
            />

            <Button
              onClick={searchTutors}
              disabled={loading || !subject || !location?.village}
              className={cn(
                "w-full h-14 text-base font-semibold transition-all duration-200",
                !subject || !location?.village
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-lg"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mencari guru...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Cari Guru
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {tutors.length > 0 ? `${tutors.length} guru ditemukan` : 'Hasil pencarian'}
              </h2>
              {tutors.length > 0 && (
                <span className="text-sm text-slate-500">
                  {expanded ? 'Dalam kecamatan yang sama' : 'Dalam kelurahan/desa yang sama'}
                </span>
              )}
            </div>

            {/* Expanded search indicator */}
            {expanded && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Tidak ada guru di kelurahan/desa Anda. Menampilkan guru di kecamatan terdekat.
                </p>
              </div>
            )}

            {tutors.length > 0 ? (
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Tidak ada guru ditemukan
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Coba ubah lokasi atau pilih mata pelajaran lain.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searched && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Siap mencari guru?
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Pilih mata pelajaran dan lokasi Anda untuk menemukan tutor terdekat
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
