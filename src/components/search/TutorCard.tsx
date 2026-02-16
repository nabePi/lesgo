import { TutorProfile } from '@/types';
import { Star, MapPin, CheckCircle, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TutorCardProps {
  tutor: TutorProfile;
  distance?: number;
}

export function TutorCard({ tutor, distance }: TutorCardProps) {
  return (
    <div className="card-elevated p-4 sm:p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {tutor.user?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          {tutor.is_verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                {tutor.user?.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-900">
                    {tutor.rating ? tutor.rating.toFixed(1) : 'Baru'}
                  </span>
                </div>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 text-sm">
                  {tutor.total_reviews || 0} ulasan
                </span>
              </div>
            </div>
            {distance !== undefined && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 rounded-full flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">
                  {distance.toFixed(1)} km
                </span>
              </div>
            )}
          </div>

          {/* Verification Badge */}
          {tutor.is_verified && (
            <div className="mt-2">
              <span className="badge-verified">
                <CheckCircle className="w-3 h-3" />
                Terverifikasi
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subjects */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Mata Pelajaran</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects.slice(0, 4).map((subject) => (
            <span
              key={subject}
              className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
            >
              {subject}
            </span>
          ))}
          {tutor.subjects.length > 4 && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
              +{tutor.subjects.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {tutor.bio && (
        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
          {tutor.bio}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-slate-900">
            Rp {tutor.hourly_rate.toLocaleString('id-ID')}
          </span>
          <span className="text-slate-500 text-sm">/jam</span>
        </div>
        <Link href={`/parent/tutor/${tutor.user_id}`}>
          <Button
            className={cn(
              "bg-indigo-600 hover:bg-indigo-700 text-white px-5",
              "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            )}
          >
            Lihat Profil
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
