'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { BookOpen, Calendar, Clock, MapPin, Clock3, Loader2, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [error, setError] = useState<string | null>(null);

  const totalAmount = hourlyRate * duration;
  const commission = Math.round(totalAmount * 0.15);
  const tutorEarnings = totalAmount - commission;

  const validateForm = () => {
    if (!subject.trim()) return 'Mata pelajaran wajib diisi';
    if (!date) return 'Tanggal wajib diisi';
    if (!time) return 'Waktu wajib diisi';
    if (!address.trim()) return 'Alamat wajib diisi';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Silakan login terlebih dahulu');
        setLoading(false);
        return;
      }

      const { data, error: bookingError } = await supabase.from('bookings').insert({
        parent_id: user.id,
        tutor_id: tutorId,
        subject,
        session_date: date,
        session_time: time,
        duration_hours: duration,
        address,
        hourly_rate: hourlyRate,
        total_amount: totalAmount,
        commission_amount: commission,
        tutor_earnings: tutorEarnings,
      }).select().single();

      if (bookingError) {
        setError(bookingError.message);
      } else {
        window.location.href = `/parent/payment/${data.id}`;
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4];

  return (
    <div className="space-y-6">
      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="flex items-center gap-2 text-slate-700">
          <BookOpen className="w-4 h-4" />
          Mata Pelajaran
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setError(null); }}
          placeholder="Contoh: Matematika"
          className="h-11"
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4" />
            Tanggal
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setError(null); }}
            className="h-11"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4" />
            Waktu
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => { setTime(e.target.value); setError(null); }}
            className="h-11"
          />
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700">
          <Clock3 className="w-4 h-4" />
          Durasi
        </Label>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDuration(option)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                duration === option
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-400'
              )}
            >
              {option} jam
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2 text-slate-700">
          <MapPin className="w-4 h-4" />
          Alamat Lengkap
        </Label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setError(null); }}
          placeholder="Jl. Mawar No. 123, Kelurahan..., Kecamatan..., Kota..."
          className={cn(
            "w-full p-4 border-2 border-slate-200 rounded-xl transition-all duration-200",
            "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            "min-h-[100px] resize-none"
          )}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="bg-slate-50 rounded-xl p-5 space-y-3">
        <h4 className="font-semibold text-slate-900">Rincian Biaya</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Tarif per jam</span>
            <span>Rp {hourlyRate.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Durasi</span>
            <span>{duration} jam</span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between text-slate-900 font-semibold text-base">
            <span>Total</span>
            <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Biaya platform (15%)</span>
            <span>Rp {commission.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-600 font-medium">
            <span>Pendapatan tutor</span>
            <span>Rp {tutorEarnings.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-14 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            Lanjut ke Pembayaran
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-slate-400">
        Pembayaran aman melalui Midtrans
      </p>
    </div>
  );
}
