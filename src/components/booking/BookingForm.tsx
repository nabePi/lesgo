'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface BookingFormProps {
  tutorId: string;
  hourlyRate: number;
}

export function BookingForm({ tutorId, hourlyRate }: BookingFormProps) {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const totalAmount = hourlyRate * duration;
  const commission = Math.round(totalAmount * 0.15);
  const tutorEarnings = totalAmount - commission;

  const handleSubmit = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Silakan login'); setLoading(false); return; }

    const { data, error } = await supabase.from('bookings').insert({
      parent_id: user.id, tutor_id: tutorId, subject, session_date: date,
      session_time: time, duration_hours: duration, address, hourly_rate: hourlyRate,
      total_amount: totalAmount, commission_amount: commission, tutor_earnings: tutorEarnings,
    }).select().single();

    if (error) alert(error.message);
    else window.location.href = `/parent/payment/${data.id}`;
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div><Label>Mata Pelajaran</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Tanggal</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div><Label>Waktu</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
      </div>
      <div><Label>Durasi (jam)</Label><Input type="number" min={1} max={4} value={duration} onChange={e => setDuration(parseInt(e.target.value))} /></div>
      <div><Label>Alamat Lengkap</Label><textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 border rounded-lg" rows={3} /></div>
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between"><span>Tarif per jam</span><span>Rp {hourlyRate.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Durasi</span><span>{duration} jam</span></div>
        <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>Rp {totalAmount.toLocaleString()}</span></div>
        <div className="text-xs text-gray-500">(Termasuk biaya platform Rp {commission.toLocaleString()})</div>
      </div>
      <Button onClick={handleSubmit} disabled={loading} className="w-full">{loading ? 'Memproses...' : 'Lanjut ke Pembayaran'}</Button>
    </div>
  );
}
