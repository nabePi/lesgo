import { supabaseServer } from '@/lib/supabase-server';
import { BookingForm } from '@/components/booking/BookingForm';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function TutorProfilePage({ params }: { params: { id: string } }) {
  const { data: tutor } = await supabaseServer.from('tutor_profiles').select('*, user:profiles(*)').eq('user_id', params.id).single();
  if (!tutor) notFound();
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 bg-gray-200 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold">{tutor.user.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{tutor.rating || 'Baru'}</span>
            <span className="text-gray-500">({tutor.total_reviews} ulasan)</span>
          </div>
          {tutor.is_verified && <div className="flex items-center gap-1 text-green-600 mt-1"><CheckCircle className="w-4 h-4" /><span className="text-sm">Guru Terverifikasi</span></div>}
        </div>
      </div>
      <div><h2 className="font-semibold mb-2">Tentang</h2><p className="text-gray-600">{tutor.bio || 'Belum ada deskripsi'}</p></div>
      <div><h2 className="font-semibold mb-2">Mata Pelajaran</h2><div className="flex flex-wrap gap-2">{tutor.subjects.map((s: string) => <span key={s} className="bg-gray-100 px-3 py-1 rounded-full">{s}</span>)}</div></div>
      <div><h2 className="font-semibold mb-2">Lokasi</h2><div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" /><span>{tutor.address}</span></div></div>
      <div className="border-t pt-6"><div className="flex items-center justify-between mb-4"><div><span className="text-2xl font-bold">Rp {tutor.hourly_rate.toLocaleString()}</span><span className="text-gray-500">/jam</span></div></div><BookingForm tutorId={tutor.user_id} hourlyRate={tutor.hourly_rate} /></div>
    </div>
  );
}
