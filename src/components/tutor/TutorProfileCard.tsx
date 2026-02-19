'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, MapPin, BookOpen, DollarSign, Star, Info, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorData {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  bio: string;
  subjects: string[];
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  address: string;
  is_verified: boolean;
  is_active: boolean;
}

interface TutorProfileCardProps {
  tutorId: string;
}

export function TutorProfileCard({ tutorId }: TutorProfileCardProps) {
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutorData();
  }, [tutorId]);

  const loadTutorData = async () => {
    try {
      // Load profile and tutor profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, whatsapp')
        .eq('id', tutorId)
        .single();

      if (profileError) throw profileError;

      const { data: tutorProfileData, error: tutorError } = await supabase
        .from('tutor_profiles')
        .select('bio, subjects, hourly_rate, rating, total_reviews, address, is_verified, is_active')
        .eq('user_id', tutorId)
        .single();

      if (tutorError) throw tutorError;

      setTutor({
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        whatsapp: profileData.whatsapp,
        bio: tutorProfileData?.bio || '',
        subjects: tutorProfileData?.subjects || [],
        hourly_rate: tutorProfileData?.hourly_rate || 0,
        rating: tutorProfileData?.rating || 0,
        total_reviews: tutorProfileData?.total_reviews || 0,
        address: tutorProfileData?.address || '',
        is_verified: tutorProfileData?.is_verified || false,
        is_active: tutorProfileData?.is_active || false,
      });
    } catch (error) {
      console.error('Error loading tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{tutor.name}</h2>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  tutor.is_active
                    ? 'bg-emerald-400/20 text-emerald-100'
                    : 'bg-amber-400/20 text-amber-100'
                )}
              >
                {tutor.is_active ? 'Aktif' : 'Menunggu Verifikasi'}
              </span>
              {tutor.is_verified && (
                <span className="text-xs bg-blue-400/20 text-blue-100 px-2 py-0.5 rounded-full">
                  Terverifikasi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tutor.whatsapp && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{tutor.whatsapp}</span>
            </div>
          )}
          {tutor.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{tutor.email}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {tutor.bio && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-700">{tutor.bio}</p>
          </div>
        )}

        {/* Subjects */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Mata Pelajaran
          </h3>
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.length > 0 ? (
              tutor.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"
                >
                  {subject}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">Belum ada mata pelajaran</span>
            )}
          </div>
        </div>

        {/* Rate & Rating */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-emerald-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Tarif per Jam
            </h3>
            <p className="text-lg font-semibold text-emerald-700">
              Rp {tutor.hourly_rate.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-amber-900 mb-1 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Rating
            </h3>
            <p className="text-lg font-semibold text-amber-700">
              {tutor.rating > 0 ? `${tutor.rating} / 5` : 'Belum ada'}
            </p>
            {tutor.total_reviews > 0 && (
              <p className="text-xs text-amber-600">{tutor.total_reviews} ulasan</p>
            )}
          </div>
        </div>

        {/* Address */}
        {tutor.address && (
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Alamat
            </h3>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              {tutor.address}
            </p>
          </div>
        )}

        {/* Note for Admin */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Perubahan Data</h4>
              <p className="text-sm text-blue-700 mt-1">
                Jika ingin mengubah data profil, silakan hubungi admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
