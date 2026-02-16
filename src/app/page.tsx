import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Search,
  MapPin,
  CreditCard,
  Star,
  CheckCircle,
  Shield,
  Users,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">LesGo</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Masuk
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5">
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-background">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-indigo-600" />
              Platform Les Private #1 di Indonesia
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Cari Guru Les Private{' '}
              <span className="text-indigo-600">Terdekat</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Temukan tutor berkualitas berdasarkan lokasi Anda. Les privat matematika,
              fisika, kimia, bahasa Inggris, dan banyak lagi.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/parent/search" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Cari Guru Sekarang
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base font-semibold border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600"
                >
                  Daftar sebagai Guru
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Guru Terverifikasi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Pembayaran Aman</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Jaminan Kepuasan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Cara Kerja LesGo
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Temukan tutor terbaik dalam 3 langkah mudah
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto -mt-12 mb-4 border-4 border-background">
                1
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Cari Guru</h3>
              <p className="text-slate-600 text-sm">
                Pilih mata pelajaran dan masukkan lokasi Anda untuk menemukan tutor terdekat
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto -mt-12 mb-4 border-4 border-background">
                2
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Booking & Bayar</h3>
              <p className="text-slate-600 text-sm">
                Pilih jadwal yang sesuai dan lakukan pembayaran aman melalui Midtrans
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-amber-600" />
              </div>
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto -mt-12 mb-4 border-4 border-background">
                3
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Mulai Belajar</h3>
              <p className="text-slate-600 text-sm">
                Guru akan datang ke lokasi Anda. Nikmati sesi les privat yang efektif
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Berbasis Lokasi
              </h3>
              <p className="text-sm text-slate-600">
                Temukan tutor terdekat dari lokasi Anda dengan fitur pencarian geospasial
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Guru Terverifikasi
              </h3>
              <p className="text-sm text-slate-600">
                Semua guru telah melalui proses verifikasi identitas dan kualifikasi
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Pembayaran Aman
              </h3>
              <p className="text-sm text-slate-600">
                Sistem pembayaran terintegrasi dengan Midtrans untuk keamanan transaksi
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Rating & Review
              </h3>
              <p className="text-sm text-slate-600">
                Lihat rating dan ulasan dari orang tua lain sebelum memilih guru
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Tutors */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-indigo-600 to-indigo-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Daftar sebagai Guru LesGo
              </h2>
              <p className="text-indigo-100 mb-8">
                Jadilah bagian dari komunitas tutor terbaik di Indonesia. Dapatkan penghasilan
                tambahan dengan mengajar sesuai keahlian Anda.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  'Fleksibel - Atur jadwal sesuai waktu luang Anda',
                  'Penghasilan kompetitif - Tarif per jam yang fair',
                  'Jangkauan luas - Temukan siswa di sekitar Anda',
                  'Aman - Sistem pembayaran terjamin'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 font-semibold"
                >
                  Gabung Sekarang
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="hidden sm:block">
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Penghasilan</p>
                      <p className="text-2xl font-bold text-slate-900">Rp 2.500.000</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Sesi Bulan Ini</span>
                      <span className="font-semibold text-slate-900">12 sesi</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Rating</span>
                      <span className="font-semibold text-slate-900">4.9 ⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">LesGo</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm">
                Platform marketplace les private Indonesia yang menghubungkan orang tua
                dengan guru les berkualitas terdekat.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Untuk Orang Tua</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/parent/search" className="hover:text-white transition-colors">
                    Cari Guru
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Daftar
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Untuk Guru</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Daftar sebagai Guru
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Dashboard Guru
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500">
            © 2026 LesGo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
