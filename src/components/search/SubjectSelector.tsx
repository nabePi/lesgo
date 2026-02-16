import { SUBJECTS } from '@/types';
import { BookOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectSelectorProps {
  value: string;
  onChange: (subject: string) => void;
}

export function SubjectSelector({ value, onChange }: SubjectSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        <label className="font-semibold text-slate-900">Mata Pelajaran</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => onChange(subject)}
            className={cn(
              "relative px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              "border-2 flex items-center gap-1.5",
              value === subject
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
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
  );
}
