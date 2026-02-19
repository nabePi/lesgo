'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { BookOpen, Calendar, Clock, MapPin, Clock3, Loader2, ArrowRight, Info, User, Phone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  tutorId: string;
  hourlyRate: number;
  tutorName?: string;
}

export function BookingForm({ tutorId, hourlyRate, tutorName }: BookingFormProps) {
  const [parentName, setParentName] = useState('');
  const [parentWhatsApp, setParentWhatsApp] = useState('');
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
    if (!parentName.trim()) return 'Nama wajib diisi';
    if (!parentWhatsApp.trim()) return 'Nomor WhatsApp wajib diisi';
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
      const { data, error: bookingError } = await supabase.from('bookings').insert({
        tutor_id: tutorId,
        parent_name: parentName,
        parent_whatsapp: parentWhatsApp,
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
    <div className="space-y-5">
      {/* Progress Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E85D4C] text-white flex items-center justify-center text-sm font-bold">
            1
          </div>
          <span className="text-sm font-semibold text-[#E85D4C]">Data Diri</span>
        </div>
        <div className="w-12 h-px bg-[#E85D4C]" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
            2
          </div>
          <span className="text-sm text-gray-500">Pembayaran</span>
        </div>
      </div>

      {/* Welcome Message */}
      {tutorName && (
        <div className="bg-[#FEF2F0] rounded-xl p-4 border border-[#E85D4C]/20">
          <p className="text-sm text-[#E85D4C]">
            <span className="font-semibold">Booking Sesi dengan {tutorName}</span>
          </p>
          <p className="text-xs text-[#E85D4C]/80 mt-1">
            Isi data Anda di bawah ini untuk memesan sesi les
          </p>
        </div>
      )}

      {/* Parent Contact Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="parentName" className="flex items-center gap-2 text-[#1F2937]">
            <User className="w-4 h-4 text-[#E85D4C]" />
            Nama Anda <span className="text-red-500">*</span>
          </Label>
          <Input
            id="parentName"
            value={parentName}
            onChange={(e) => { setParentName(e.target.value); setError(null); }}
            placeholder="Contoh: Budi Santoso"
            className="h-11 rounded-xl border-gray-200 focus:border-[#E85D4C] focus:ring-[#E85D4C]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentWhatsApp" className="flex items-center gap-2 text-[#1F2937]">
            <Phone className="w-4 h-4 text-[#E85D4C]" />
            Nomor WhatsApp <span className="text-red-500">*</span>
          </Label>
          <Input
            id="parentWhatsApp"
            type="tel"
            value={parentWhatsApp}
            onChange={(e) => { setParentWhatsApp(e.target.value); setError(null); }}
            placeholder="Contoh: 08123456789"
            className="h-11 rounded-xl border-gray-200 focus:border-[#E85D4C] focus:ring-[#E85D4C]"
          />
          <p className="text-xs text-[#6B7280]">
            Nomor ini akan digunakan untuk komunikasi dan login di masa depan
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="flex items-center gap-2 text-[#1F2937]">
          <BookOpen className="w-4 h-4 text-[#E85D4C]" />
          Mata Pelajaran
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setError(null); }}
          placeholder="Contoh: Matematika"
          className="h-11 rounded-xl border-gray-200 focus:border-[#E85D4C] focus:ring-[#E85D4C]"
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2 text-[#1F2937]">
            <Calendar className="w-4 h-4 text-[#E85D4C]" />
            Tanggal
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setError(null); }}
            className="h-11 rounded-xl border-gray-200 focus:border-[#E85D4C] focus:ring-[#E85D4C]"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2 text-[#1F2937]">
            <Clock className="w-4 h-4 text-[#E85D4C]" />
            Waktu
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => { setTime(e.target.value); setError(null); }}
            className="h-11 rounded-xl border-gray-200 focus:border-[#E85D4C] focus:ring-[#E85D4C]"
          />
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-[#1F2937]">
          <Clock3 className="w-4 h-4 text-[#E85D4C]" />
          Durasi
        </Label>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDuration(option)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                duration === option
                  ? 'bg-[#E85D4C] text-white shadow-md'
                  : 'bg-white text-[#1F2937] border border-gray-200 hover:border-[#E85D4C] hover:text-[#E85D4C]'
              )}
            >
              {option} jam
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2 text-[#1F2937]">
          <MapPin className="w-4 h-4 text-[#E85D4C]" />
          Alamat Lengkap
        </Label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setError(null); }}
          placeholder="Jl. Mawar No. 123, Kelurahan..., Kecamatan..., Kota..."
          className={cn(
            "w-full p-4 border-2 border-gray-200 rounded-xl transition-all duration-200",
            "focus:border-[#E85D4C] focus:ring-2 focus:ring-[#E85D4C]/20 focus:outline-none",
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
      <div className="bg-gray-50 rounded-xl p-5 space-y-3">
        <h4 className="font-semibold text-[#1F2937]">Rincian Biaya</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[#6B7280]">
            <span>Tarif per jam</span>
            <span>Rp {hourlyRate.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-[#6B7280]">
            <span>Durasi</span>
            <span>{duration} jam</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between text-[#1F2937] font-semibold text-base">
            <span>Total</span>
            <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xs text-[#9CA3AF]">
            <span>Biaya platform (15%)</span>
            <span>Rp {commission.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xs text-[#0D9488] font-medium">
            <span>Pendapatan tutor</span>
            <span>Rp {tutorEarnings.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-14 text-base font-semibold bg-[#E85D4C] hover:bg-[#C94A3B] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200 rounded-xl"
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

      <p className="text-xs text-center text-[#9CA3AF]">
        Pembayaran aman melalui Midtrans
      </p>
    </div>
  );
}
