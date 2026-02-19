'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Users,
  ArrowRight,
  Quote,
  Clock,
  Shield,
  ChevronDown,
  Award,
  BookOpen,
  Phone,
  GraduationCap,
  Heart,
  Zap,
} from 'lucide-react';

// Testimonials data
const testimonials = [
  {
    name: 'Dewi Susanti',
    role: 'Ibu dari Kelas 6 SD',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dewi',
    content: 'Anak saya naik 3 peringkat setelah 2 bulan les dengan tutor dari LesGo. Guru yang datang sangat sabar dan metode mengajarnya mudah dipahami.',
    rating: 5,
    subject: 'Matematika',
  },
  {
    name: 'Ahmad Rizki',
    role: 'Siswa SMA Kelas 12',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmad',
    content: 'Persiapan UTBK jadi lebih tenang berkat tutor LesGo. Belajar privat di rumah lebih fokus dan hasilnya UTBK saya lolos di PTN impian!',
    rating: 5,
    subject: 'Fisika & Kimia',
  },
  {
    name: 'Siti Rahayu',
    role: 'Ibu dari Kelas 9 SMP',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=siti',
    content: 'Sangat praktis! Tidak perlu antar-jemput anak ke bimbel. Tutor datang tepat waktu dan lokasinya benar-benar terdekat dari rumah.',
    rating: 5,
    subject: 'Bahasa Inggris',
  },
  {
    name: 'Budi Santoso',
    role: 'Ayah dari Kelas 3 SD',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi',
    content: 'Harga terjangkau dengan kualitas terbaik. Sistem rating membantu saya memilih tutor yang tepat untuk anak saya.',
    rating: 5,
    subject: 'IPA',
  },
];

// FAQ data
const faqs = [
  {
    question: 'Bagaimana cara mencari tutor di LesGo?',
    answer: 'Cukup masukkan mata pelajaran dan lokasi Anda, sistem akan menampilkan tutor terdekat dengan profil lengkap, rating, dan ulasan. Pilih tutor yang sesuai dan booking jadwal yang Anda inginkan.',
  },
  {
    question: 'Apakah semua tutor di LesGo terverifikasi?',
    answer: 'Ya, semua tutor telah melalui proses verifikasi identitas yang ketat. Kami memeriksa KTP, ijazah, dan melakukan wawancara untuk memastikan kualitas pengajar.',
  },
  {
    question: 'Berapa biaya les privat di LesGo?',
    answer: 'Biaya les mulai dari Rp 50.000/jam tergantung kualifikasi tutor dan jenjang pendidikan. Tidak ada biaya tambahan atau biaya pendaftaran.',
  },
  {
    question: 'Bagaimana sistem pembayarannya?',
    answer: 'Pembayaran dilakukan secara online melalui Midtrans yang aman dan terpercaya. Anda membayar ke platform, dan kami akan mentransfer ke tutor setelah sesi les selesai.',
  },
  {
    question: 'Apakah bisa mengganti tutor jika tidak cocok?',
    answer: 'Tentu! Jika Anda merasa tidak cocok dengan tutor, Anda dapat mencari tutor lain. Kami juga memiliki garansi kepuasan untuk sesi pertama.',
  },
  {
    question: 'Area mana saja yang dicakup LesGo?',
    answer: 'LesGo tersedia di seluruh Indonesia, terutama di kota-kota besar seperti Jakarta, Surabaya, Bandung, Yogyakarta, Medan, dan Makassar.',
  },
];

// Stats
const stats = [
  { value: '10.000+', label: 'Tutor Aktif', icon: Users },
  { value: '50.000+', label: 'Sesi Les', icon: Clock },
  { value: '100+', label: 'Kota', icon: MapPin },
  { value: '4.8', label: 'Rating', icon: Star },
];

// Subjects
const subjects = [
  { name: 'Matematika', icon: '📐', color: 'bg-blue-100 text-blue-600' },
  { name: 'Fisika', icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Kimia', icon: '⚗️', color: 'bg-purple-100 text-purple-600' },
  { name: 'Biologi', icon: '🧬', color: 'bg-green-100 text-green-600' },
  { name: 'Bahasa Inggris', icon: '🌐', color: 'bg-red-100 text-red-600' },
  { name: 'Bahasa Indonesia', icon: '📚', color: 'bg-orange-100 text-orange-600' },
];

// Features
const features = [
  {
    icon: MapPin,
    title: 'Tutor Terdekat',
    description: 'Temukan tutor dalam radius 15km dari lokasi Anda dengan mudah',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Shield,
    title: 'Terverifikasi',
    description: 'Semua tutor telah melalui proses verifikasi ketat dan berkualitas',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Star,
    title: 'Rating Transparan',
    description: 'Lihat ulasan dan rating dari siswa lain sebelum memilih',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Clock,
    title: 'Fleksibel',
    description: 'Atur jadwal les sesuai waktu yang Anda inginkan',
    color: 'bg-blue-100 text-blue-600',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E85D4C] to-[#F97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">LesGo</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {['Cara Kerja', 'Keunggulan', 'Testimoni', 'FAQ'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-gray-600 hover:text-[#E85D4C] transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <Link href="/parent/search">
            <Button className="bg-[#E85D4C] hover:bg-[#C94A3B] text-white font-semibold px-6 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all">
              Cari Guru
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FEF2F0] via-[#FDFCFB] to-[#F0FDFA]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#E85D4C]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-sm font-medium text-gray-600">10.000+ tutor aktif di seluruh Indonesia</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Temukan Guru Les{' '}
                <span className="text-[#E85D4C]">Private Terbaik</span>{' '}
                di Sekitar Anda
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Tingkatkan prestasi akademik dengan tutor privat terverifikasi yang datang ke rumah Anda.
                Belajar jadi lebih fokus dan nyaman.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/parent/search">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-[#E85D4C] hover:bg-[#C94A3B] text-white font-bold text-lg rounded-xl shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:-translate-y-1 transition-all"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Cari Guru Sekarang
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-gray-500">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  <span className="text-sm font-medium">Gratis mencari</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8 pt-8 border-t border-gray-200">
                {[
                  { value: '10.000+', label: 'Tutor Aktif' },
                  { value: '4.8/5', label: 'Rating' },
                  { value: '100+', label: 'Kota' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Image/Card */}
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200 p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E85D4C] to-[#F97316] rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Cari Guru Les</h3>
                    <p className="text-sm text-gray-500">Temukan tutor terbaik</p>
                  </div>
                </div>

                {/* Subject grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {subjects.map((subject) => (
                    <Link
                      key={subject.name}
                      href={`/parent/search?subject=${encodeURIComponent(subject.name)}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#FEF2F0] border border-gray-100 hover:border-[#E85D4C]/30 transition-all group"
                    >
                      <span className="text-2xl">{subject.icon}</span>
                      <span className="font-semibold text-gray-700 group-hover:text-[#E85D4C] text-sm">{subject.name}</span>
                    </Link>
                  ))}
                </div>

                <Link href="/parent/search">
                  <Button className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl">
                    Lihat Semua Pelajaran
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Floating card - Rating */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-bounce-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">4.8/5</div>
                    <div className="text-xs text-gray-500">Rating Rata-rata</div>
                  </div>
                </div>
              </div>

              {/* Floating card - Tutor */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Terverifikasi</div>
                    <div className="text-xs text-gray-500">Semua Tutor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#FEF2F0] text-[#E85D4C] font-semibold text-sm rounded-full mb-4">
              Cara Kerja
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cari Guru Les dalam 3 Langkah Mudah
            </h2>
            <p className="text-gray-600">
              Tidak perlu repot antar-jemput. Cukup pesan dari rumah, tutor berkualitas akan datang ke Anda.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Cari Tutor',
                description: 'Masukkan mata pelajaran dan lokasi Anda. Sistem akan menampilkan tutor terdekat dengan profil lengkap.',
                icon: Search,
                color: 'bg-[#E85D4C]',
              },
              {
                step: '02',
                title: 'Pilih Jadwal',
                description: 'Lihat rating dan ulasan, pilih tutor yang cocok, tentukan jadwal les yang Anda inginkan.',
                icon: Clock,
                color: 'bg-[#0D9488]',
              },
              {
                step: '03',
                title: 'Mulai Belajar',
                description: 'Tutor datang ke lokasi Anda. Nikmati sesi les privat yang fokus dan efektif.',
                icon: BookOpen,
                color: 'bg-[#F59E0B]',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded-3xl p-8 h-full hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all border border-gray-100 hover:border-gray-200">
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-gray-200 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="keunggulan" className="py-20 bg-gradient-to-b from-[#FDFCFB] to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#F0FDFA] text-[#0D9488] font-semibold text-sm rounded-full mb-4">
              Keunggulan
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih LesGo?
            </h2>
            <p className="text-gray-600">
              Kami memahami kebutuhan Anda. LesGo dirancang untuk memberikan pengalaman les privat terbaik.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all group"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 font-semibold text-sm rounded-full mb-4">
              Testimoni
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="text-gray-600">
              Ribuan siswa dan orang tua telah merasakan manfaat les privat dengan tutor LesGo.
            </p>
          </div>

          {/* Testimonial grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full bg-white"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>

                {/* Subject tag */}
                <div className="mt-4">
                  <span className="inline-block px-3 py-1 bg-[#FEF2F0] text-[#E85D4C] text-xs font-semibold rounded-full">
                    {testimonial.subject}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gradient-to-b from-[#FDFCFB] to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-semibold text-sm rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pertanyaan Umum
            </h2>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#E85D4C] to-[#F97316] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Siap Meningkatkan Prestasi?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Jangan biarkan anak Anda tertinggal. Temukan tutor terbaik di area Anda sekarang.
              </p>
              <Link href="/parent/search">
                <Button
                  size="lg"
                  className="h-14 px-10 bg-white text-[#E85D4C] hover:bg-gray-100 font-bold text-lg rounded-xl shadow-xl"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Cari Tutor Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E85D4C] to-[#F97316] rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">LesGo</span>
              </Link>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Platform les private terbesar di Indonesia. Menghubungkan siswa dengan tutor berkualitas terdekat.
              </p>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-white font-bold">4.8</span>
                <span className="text-gray-400">dari 10.000+ ulasan</span>
              </div>
            </div>

            {/* For Tutors */}
            <div>
              <h4 className="font-bold text-lg mb-4">Untuk Tutor</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/register?tutor=true" className="hover:text-white transition-colors">
                    Daftar sebagai Tutor
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Login Tutor
                  </Link>
                </li>
                <li>
                  <Link href="/tutor/dashboard" className="hover:text-white transition-colors">
                    Dashboard Tutor
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-lg mb-4">Bantuan</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Hubungi Kami
                  </a>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    FAQ
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Syarat & Ketentuan
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© 2026 LesGo. All rights reserved.</p>
            <p>Platform Les Private Terpercaya Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
