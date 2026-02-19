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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md hover:border-[#E85D4C]/30 transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FEF2F0] to-[#F0FDFA] rounded-2xl flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-[#1F2937]">
              {tutor.user?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          {tutor.is_verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-xl font-bold text-[#1F2937] leading-tight">
                {tutor.user?.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-body font-semibold text-[#1F2937]">
                    {tutor.rating ? tutor.rating.toFixed(1) : 'Baru'}
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="font-body text-[#6B7280] text-sm">
                  {tutor.total_reviews || 0} ulasan
                </span>
              </div>
            </div>
            {distance !== undefined && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[#FEF2F0] rounded-full flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#E85D4C]" />
                <span className="font-body text-xs font-semibold text-[#E85D4C]">
                  {distance.toFixed(1)} km
                </span>
              </div>
            )}
          </div>

          {/* Verification Badge */}
          {tutor.is_verified && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF5] text-[#059669] text-xs font-semibold rounded-full">
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
          <BookOpen className="w-4 h-4 text-[#6B7280]" />
          <span className="font-body text-xs font-semibold text-[#6B7280]">Mata Pelajaran</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tutor.subjects.slice(0, 4).map((subject) => (
            <span
              key={subject}
              className="px-3 py-1 bg-gray-50 text-[#1F2937] text-xs font-body font-medium rounded-lg border border-gray-100"
            >
              {subject}
            </span>
          ))}
          {tutor.subjects.length > 4 && (
            <span className="px-3 py-1 bg-gray-50 text-[#6B7280] text-xs font-body font-medium rounded-lg">
              +{tutor.subjects.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {tutor.bio && (
        <p className="mt-3 font-body text-sm text-[#6B7280] line-clamp-2">
          {tutor.bio}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="font-display text-2xl font-bold text-[#1F2937]">
            Rp {tutor.hourly_rate.toLocaleString('id-ID')}
          </span>
          <span className="font-body text-[#6B7280] text-sm">/jam</span>
        </div>
        <Link href={`/parent/tutor/${tutor.user_id}`}>
          <Button
            className={cn(
              "bg-[#E85D4C] hover:bg-[#C94A3B] text-white px-6 rounded-xl font-semibold",
              "transition-all duration-200 hover:shadow-lg hover:shadow-orange-200"
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
