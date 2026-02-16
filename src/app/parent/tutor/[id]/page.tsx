import { supabaseServer } from '@/lib/supabase-server';
import { BookingForm } from '@/components/booking/BookingForm';
import { Star, MapPin, CheckCircle, BookOpen, ArrowLeft, User, GraduationCap, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: tutor } = await supabaseServer.from('tutor_profiles').select('*, user:profiles(*)').eq('user_id', id).single();
  if (!tutor) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href="/parent/search"
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          {/* Cover / Header */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-indigo-600" />

          {/* Profile Info */}
          <div className="px-5 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-12 mb-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl p-1.5 shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                    <span className="text-3xl font-bold text-indigo-600">
                      {tutor.user?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                </div>
                {tutor.is_verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Name & Rating */}
              <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
                <h1 className="text-2xl font-bold text-slate-900">{tutor.user?.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">
                      {tutor.rating ? tutor.rating.toFixed(1) : 'Baru'}
                    </span>
                    <span className="text-slate-500 text-sm">
                      ({tutor.total_reviews || 0} ulasan)
                    </span>
                  </div>
                  {tutor.is_verified && (
                    <span className="badge-verified">
                      <Shield className="w-3 h-3" />
                      Terverifikasi
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-500 text-sm mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Mata Pelajaran</span>
                </div>
                <p className="font-semibold text-slate-900">{tutor.subjects?.length || 0}</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <div className="flex items-center justify-center gap-1 text-slate-500 text-sm mb-1">
                  <User className="w-4 h-4" />
                  <span>Siswa</span>
                </div>
                <p className="font-semibold text-slate-900">{tutor.total_reviews || 0}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-500 text-sm mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>Pengalaman</span>
                </div>
                <p className="font-semibold text-slate-900">{tutor.is_verified ? 'Terverifikasi' : 'Baru'}</p>
              </div>
            </div>

            {/* About */}
            <div className="mt-5">
              <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Tentang
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {tutor.bio || 'Belum ada deskripsi. Tutor ini baru bergabung di LesGo.'}
              </p>
            </div>

            {/* Subjects */}
            <div className="mt-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Mata Pelajaran
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects?.map((s: string) => (
                  <span key={s} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mt-5">
              <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lokasi
              </h2>
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 rounded-lg p-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span>{tutor.address || 'Alamat belum ditambahkan'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Booking Sesi</h2>
              <p className="text-sm text-slate-500">Isi detail untuk memesan sesi les</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-600">
                Rp {tutor.hourly_rate.toLocaleString('id-ID')}
              </span>
              <span className="text-slate-500 text-sm">/jam</span>
            </div>
          </div>

          <BookingForm tutorId={tutor.user_id} hourlyRate={tutor.hourly_rate} />
        </div>
      </main>
    </div>
  );
}
