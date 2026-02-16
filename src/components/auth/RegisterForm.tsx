'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleSelector } from './RoleSelector';
import { UserRole } from '@/types';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    // Create auth user with phone
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone,
      password: Math.random().toString(36).slice(-8),
    });
    
    if (authError || !authData.user) {
      alert(authError?.message || 'Failed to create user');
      setLoading(false);
      return;
    }
    
    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name,
      email,
      phone,
      role,
    });
    
    if (profileError) {
      alert(profileError.message);
    } else {
      if (role === 'tutor') {
        window.location.href = '/tutor/onboarding';
      } else {
        window.location.href = '/parent/dashboard';
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <RoleSelector value={role} onChange={setRole} />
      
      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Anda"
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Nomor WhatsApp</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+6281234567890"
        />
      </div>
      
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? 'Mendaftar...' : 'Daftar'}
      </Button>
    </div>
  );
}
