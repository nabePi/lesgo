'use client';

import { useState } from 'react';
import { SubjectSelector } from '@/components/search/SubjectSelector';
import { LocationPicker } from '@/components/search/LocationPicker';
import { TutorCard } from '@/components/search/TutorCard';
import { TutorProfile } from '@/types';
import { Button } from '@/components/ui/button';

export default function SearchPage() {
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchTutors = async () => {
    if (!subject || !location) {
      alert('Pilih mata pelajaran dan lokasi');
      return;
    }
    
    setLoading(true);
    const response = await fetch(
      `/api/tutors/search?subject=${subject}&lat=${location.lat}&lng=${location.lng}&radius=10`
    );
    const data = await response.json();
    setTutors(data.tutors || []);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Cari Guru Les</h1>
      
      <SubjectSelector value={subject} onChange={setSubject} />
      
      <LocationPicker 
        onLocationSelect={(lat, lng, address) => setLocation({ lat, lng, address })} 
      />
      
      <Button 
        onClick={searchTutors} 
        disabled={loading || !subject || !location}
        className="w-full"
      >
        {loading ? 'Mencari...' : 'Cari Guru'}
      </Button>
      
      {tutors.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">{tutors.length} guru ditemukan</h2>
          {tutors.map((tutor) => (
            <TutorCard 
              key={tutor.id} 
              tutor={tutor} 
              distance={tutor.distance}
            />
          ))}
        </div>
      )}
    </div>
  );
}
