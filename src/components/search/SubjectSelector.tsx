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
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <label className="font-bold text-slate-900 text-lg">Mata Pelajaran</label>
          <p className="text-sm text-slate-500">Pilih pelajaran yang ingin dipelajari</p>
        </div>
      </div>

      {/* Popular Subjects - Quick Select */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Sparkles className="w-4 h-4 text-amber-500" />
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
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md'
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
        <div className="text-sm font-medium text-slate-600">
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
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
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
