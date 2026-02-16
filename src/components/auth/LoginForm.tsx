'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) {
      alert(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });
    if (error) {
      alert(error.message);
    } else {
      window.location.href = '/onboarding';
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          <div>
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+6281234567890"
            />
          </div>
          <Button onClick={sendOtp} disabled={loading} className="w-full">
            {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
          </Button>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="otp">Kode OTP</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
            />
          </div>
          <Button onClick={verifyOtp} disabled={loading} className="w-full">
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>
        </>
      )}
    </div>
  );
}
