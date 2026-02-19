import { supabaseServer } from '@/lib/supabase-server';
import { BookingForm } from '@/components/booking/BookingForm';
import { Star, MapPin, CheckCircle, BookOpen, ArrowLeft, User, GraduationCap, Shield, Clock, Award, MessageCircle, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: tutor } = await supabaseServer.from('tutor_profiles').select('*, user:profiles!tutor_profiles_user_id_fkey(*)').eq('user_id', id).single();
  if (!tutor) notFound();

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link
            href="/parent/search"
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#E85D4C] transition-colors px-3 py-2 rounded-xl hover:bg-[#FEF2F0]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Kembali ke Pencarian</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
          <Link href="/" className="hover:text-[#E85D4C] transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/parent/search" className="hover:text-[#E85D4C] transition-colors">Cari Guru</Link>
          <span>/</span>
          <span className="text-[#1F2937] font-semibold">Profil Tutor</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Tutor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Cover */}
              <div className="h-40 sm:h-48 bg-gradient-to-r from-[#E85D4C] via-[#F97316] to-[#0D9488] relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              </div>

              {/* Profile Info */}
              <div className="px-5 sm:px-8 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20 mb-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-2xl p-2 shadow-xl">
                      <div className="w-full h-full bg-gradient-to-br from-[#FEF2F0] to-[#F0FDFA] rounded-xl flex items-center justify-center">
                        <span className="text-4xl sm:text-5xl font-bold text-[#1F2937]">
                          {tutor.user?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    {tutor.is_verified && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name & Rating */}
                  <div className="mt-4 sm:mt-0 sm:ml-5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">{tutor.user?.name}</h1>
                      {tutor.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ECFDF5] text-[#059669] text-xs font-bold rounded-full">
                          <Shield className="w-3 h-3" />
                          TERVERIFIKASI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="font-bold text-[#1F2937] text-lg">
                          {tutor.rating ? tutor.rating.toFixed(1) : 'Baru'}
                        </span>
                        <span className="text-[#6B7280]">
                          ({tutor.total_reviews || 0} ulasan)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-[#FEF2F0] rounded-xl flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-5 h-5 text-[#E85D4C]" />
                    </div>
                    <p className="text-xl font-bold text-[#1F2937]">{tutor.subjects?.length || 0}</p>
                    <p className="text-xs text-[#6B7280]">Mata Pelajaran</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-[#F0FDFA] rounded-xl flex items-center justify-center mx-auto mb-2">
                      <User className="w-5 h-5 text-[#0D9488]" />
                    </div>
                    <p className="text-xl font-bold text-[#1F2937]">{tutor.total_reviews || 0}</p>
                    <p className="text-xs text-[#6B7280]">Siswa Dibantu</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-[#FFFBEB] rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Award className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <p className="text-xl font-bold text-[#1F2937]">{tutor.is_verified ? 'Pro' : 'Baru'}</p>
                    <p className="text-xs text-[#6B7280]">Status Tutor</p>
                  </div>
                </div>

                {/* About */}
                <div className="mt-8">
                  <h2 className="font-bold text-[#1F2937] text-lg mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#FEF2F0] rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-[#E85D4C]" />
                    </div>
                    Tentang Tutor
                  </h2>
                  <p className="text-[#6B7280] leading-relaxed text-base">
                    {tutor.bio || 'Tutor ini baru bergabung di LesGo dan belum menambahkan deskripsi. Hubungi tutor untuk informasi lebih lanjut.'}
                  </p>
                </div>

                {/* Subjects */}
                <div className="mt-6">
                  <h2 className="font-bold text-[#1F2937] text-lg mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#F0FDFA] rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#0D9488]" />
                    </div>
                    Mata Pelajaran
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects?.map((s: string) => (
                      <span key={s} className="px-4 py-2 bg-[#FEF2F0] text-[#E85D4C] text-sm font-semibold rounded-xl border border-[#E85D4C]/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="mt-6">
                  <h2 className="font-bold text-[#1F2937] text-lg mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#FFFBEB] rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#D97706]" />
                    </div>
                    Lokasi
                  </h2>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <MapPin className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                    <span className="text-[#1F2937]">{tutor.address || 'Alamat belum ditambahkan'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="font-bold text-[#1F2937] text-lg mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FFFBEB] rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#D97706]" />
                </div>
                Ulasan ({tutor.total_reviews || 0})
              </h2>
              {tutor.total_reviews === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-[#6B7280]">Belum ada ulasan untuk tutor ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Placeholder for reviews */}
                  <p className="text-[#6B7280] text-center py-4">Ulasan akan ditampilkan di sini</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                {/* Price Header */}
                <div className="bg-gradient-to-r from-[#E85D4C] to-[#F97316] p-6 text-white">
                  <p className="text-white/80 text-sm font-medium mb-1">Tarif per Jam</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold">
                      Rp {tutor.hourly_rate.toLocaleString('id-ID')}
                    </span>
                    <span className="text-white/80">/jam</span>
                  </div>
                  <p className="text-white/80 text-xs mt-2">Harga bersih, sudah termasuk biaya platform</p>
                </div>

                {/* Booking Form */}
                <div className="p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-[#1F2937] mb-1">Booking Sesi</h2>
                  <p className="text-sm text-[#6B7280] mb-5">Isi data Anda untuk memesan sesi les</p>

                  <BookingForm tutorId={tutor.user_id} hourlyRate={tutor.hourly_rate} tutorName={tutor.user?.name} />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] text-sm">Pembayaran Aman</p>
                    <p className="text-xs text-[#6B7280]">Dilindungi Midtrans</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F0FDFA] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#0D9488]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] text-sm">Refund Mudah</p>
                    <p className="text-xs text-[#6B7280]">Batalkan 24 jam sebelumnya</p>
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
