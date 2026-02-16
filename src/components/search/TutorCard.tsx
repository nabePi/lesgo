import { TutorProfile } from '@/types';
import { Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TutorCardProps {
  tutor: TutorProfile;
  distance?: number;
}

export function TutorCard({ tutor, distance }: TutorCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{tutor.user?.name}</h3>
            {tutor.is_verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Terverifikasi
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{tutor.rating || 'Baru'}</span>
            <span>({tutor.total_reviews || 0} ulasan)</span>
          </div>
          {distance && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {tutor.subjects.slice(0, 3).map((subject) => (
          <span
            key={subject}
            className="text-xs bg-gray-100 px-2 py-1 rounded"
          >
            {subject}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold">Rp {tutor.hourly_rate.toLocaleString()}</span>
          <span className="text-gray-500">/jam</span>
        </div>
        <Link href={`/parent/tutor/${tutor.user_id}`}>
          <Button>Lihat Profil</Button>
        </Link>
      </div>
    </div>
  );
}
