'use client';

import { UserRole } from '@/types';
import { UserCircle2, GraduationCap, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Parent Option */}
      <button
        type="button"
        onClick={() => onChange('parent')}
        className={cn(
          "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200",
          value === 'parent'
            ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        {value === 'parent' && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
          value === 'parent' ? 'bg-indigo-200' : 'bg-slate-100'
        )}>
          <UserCircle2 className={cn(
            "w-6 h-6",
            value === 'parent' ? 'text-indigo-700' : 'text-slate-500'
          )} />
        </div>
        <div className="text-center">
          <div className="font-semibold text-sm">Siswa</div>
          <div className="text-xs text-slate-500 mt-0.5">Cari guru les private</div>
        </div>
      </button>

      {/* Tutor Option */}
      <button
        type="button"
        onClick={() => onChange('tutor')}
        className={cn(
          "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200",
          value === 'tutor'
            ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        {value === 'tutor' && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
          value === 'tutor' ? 'bg-indigo-200' : 'bg-slate-100'
        )}>
          <GraduationCap className={cn(
            "w-6 h-6",
            value === 'tutor' ? 'text-indigo-700' : 'text-slate-500'
          )} />
        </div>
        <div className="text-center">
          <div className="font-semibold text-sm">Guru</div>
          <div className="text-xs text-slate-500 mt-0.5">Daftar sebagai pengajar</div>
        </div>
      </button>
    </div>
  );
}
