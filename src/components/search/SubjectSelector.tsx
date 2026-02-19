import { SUBJECTS } from '@/types';
import { BookOpen, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectSelectorProps {
  value: string;
  onChange: (subject: string) => void;
}

export function SubjectSelector({ value, onChange }: SubjectSelectorProps) {
  // Prioritize popular subjects
  const popularSubjects = ['Matematika', 'Bahasa Inggris', 'Fisika', 'Kimia'];
  const otherSubjects = SUBJECTS.filter(s => !popularSubjects.includes(s));

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-[#FEF2F0] to-[#FEF2F0] rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#E85D4C]" />
        </div>
        <div>
          <label className="font-bold text-[#1F2937] text-lg">Mata Pelajaran</label>
          <p className="text-sm text-[#6B7280]">Pilih pelajaran yang ingin dipelajari</p>
        </div>
      </div>

      {/* Popular Subjects - Quick Select */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          Paling Populer
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {popularSubjects.map((subject) => (
            <button
              key={subject}
              onClick={() => onChange(subject)}
              className={cn(
                "relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                "border-2 flex items-center justify-center gap-2",
                value === subject
                  ? 'bg-[#E85D4C] text-white border-[#E85D4C] shadow-lg shadow-orange-200/50 scale-[1.02]'
                  : 'bg-white text-[#1F2937] border-gray-200 hover:border-[#E85D4C] hover:text-[#E85D4C] hover:shadow-md'
              )}
            >
              {value === subject && (
                <Check className="w-4 h-4" />
              )}
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* All Other Subjects */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[#6B7280]">
          Semua Pelajaran
        </div>
        <div className="flex flex-wrap gap-2">
          {otherSubjects.map((subject) => (
            <button
              key={subject}
              onClick={() => onChange(subject)}
              className={cn(
                "relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border-2 flex items-center gap-1.5",
                value === subject
                  ? 'bg-[#E85D4C] text-white border-[#E85D4C] shadow-md'
                  : 'bg-white text-[#6B7280] border-gray-200 hover:border-[#E85D4C] hover:text-[#E85D4C]'
              )}
            >
              {value === subject && (
                <Check className="w-3.5 h-3.5" />
              )}
              {subject}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
