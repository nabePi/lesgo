'use client';

import { UserRole } from '@/types';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => onChange('parent')}
        className={`flex-1 p-4 border rounded-lg transition-colors ${
          value === 'parent' 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="font-semibold">Orang Tua</div>
        <div className="text-sm text-gray-500">Cari guru untuk anak</div>
      </button>
      <button
        type="button"
        onClick={() => onChange('tutor')}
        className={`flex-1 p-4 border rounded-lg transition-colors ${
          value === 'tutor' 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="font-semibold">Guru</div>
        <div className="text-sm text-gray-500">Daftar sebagai pengajar</div>
      </button>
    </div>
  );
}
