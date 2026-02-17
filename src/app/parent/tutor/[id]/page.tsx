import { supabaseServer } from '@/lib/supabase-server';
import { BookingForm } from '@/components/booking/BookingForm';
import { Star, MapPin, CheckCircle, BookOpen, ArrowLeft, User, GraduationCap, Shield, Clock, Award, MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: tutor } = await supabaseServer.from('tutor_profiles').select('*, user:profiles(*)').eq('user_id', id).single();
  if (!tutor) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link
            href="/parent/search"
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-full hover:bg-indigo-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Kembali ke Pencarian</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/parent/search" className="hover:text-indigo-600 transition-colors">Cari Guru</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Profil Tutor</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Tutor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Cover */}
              <div className="h-40 sm:h-48 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              </div>

              {/* Profile Info */}
              <div className="px-5 sm:px-8 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20 mb-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-3xl p-2 shadow-xl">
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center">
                        <span className="text-4xl sm:text-5xl font-bold text-indigo-600">
                          {tutor.user?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    {tutor.is_verified && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name & Rating */}
                  <div className="mt-4 sm:mt-0 sm:ml-5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{tutor.user?.name}</h1>
                      {tutor.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                          <Shield className="w-3 h-3" />
                          TERVERIFIKASI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-900 text-lg">
                          {tutor.rating ? tutor.rating.toFixed(1) : 'Baru'}
                        </span>
                        <span className="text-slate-500">
                          ({tutor.total_reviews || 0} ulasan)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-xl font-bold text-slate-900">{tutor.subjects?.length || 0}</p>
                    <p className="text-xs text-slate-500">Mata Pelajaran</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <User className="w-5 h-5 text-violet-600" />
                    </div>
                    <p className="text-xl font-bold text-slate-900">{tutor.total_reviews || 0}</p>
                    <p className="text-xs text-slate-500">Siswa Dibantu</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-xl font-bold text-slate-900">{tutor.is_verified ? 'Pro' : 'Baru'}</p>
                    <p className="text-xs text-slate-500">Status Tutor</p>
                  </div>
                </div>

                {/* About */}
                <div className="mt-8">
                  <h2 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    Tentang Tutor
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-base">
                    {tutor.bio || 'Tutor ini baru bergabung di LesGo dan belum menambahkan deskripsi. Hubungi tutor untuk informasi lebih lanjut.'}
                  </p>
                </div>

                {/* Subjects */}
                <div className="mt-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-violet-600" />
                    </div>
                    Mata Pelajaran
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects?.map((s: string) => (
                      <span key={s} className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="mt-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    Lokasi
                  </h2>
                  <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{tutor.address || 'Alamat belum ditambahkan'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-amber-600" />
                </div>
                Ulasan ({tutor.total_reviews || 0})
              </h2>
              {tutor.total_reviews === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">Belum ada ulasan untuk tutor ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Placeholder for reviews */}
                  <p className="text-slate-500 text-center py-4">Ulasan akan ditampilkan di sini</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* Price Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                  <p className="text-emerald-100 text-sm font-medium mb-1">Tarif per Jam</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold">
                      Rp {tutor.hourly_rate.toLocaleString('id-ID')}
                    </span>
                    <span className="text-emerald-100">/jam</span>
                  </div>
                  <p className="text-emerald-100 text-xs mt-2">Harga bersih, sudah termasuk biaya platform</p>
                </div>

                {/* Booking Form */}
                <div className="p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Booking Sesi</h2>
                  <p className="text-sm text-slate-500 mb-5">Isi data Anda untuk memesan sesi les</p>

                  <BookingForm tutorId={tutor.user_id} hourlyRate={tutor.hourly_rate} tutorName={tutor.user?.name} />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Pembayaran Aman</p>
                    <p className="text-xs text-slate-500">Dilindungi Midtrans</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Refund Mudah</p>
                    <p className="text-xs text-slate-500">Batalkan 24 jam sebelumnya</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
