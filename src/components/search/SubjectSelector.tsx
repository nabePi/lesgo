import { SUBJECTS } from '@/types';

interface SubjectSelectorProps {
  value: string;
  onChange: (subject: string) => void;
}

export function SubjectSelector({ value, onChange }: SubjectSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="font-medium">Mata Pelajaran</label>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => onChange(subject)}
            className={`px-4 py-2 rounded-full border text-sm ${
              value === subject
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
}
