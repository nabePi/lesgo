'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, X, BookOpen, Loader2 } from 'lucide-react';
import { SUBJECTS } from '@/types';
import { cn } from '@/lib/utils';

interface SubjectManagerProps {
  tutorId: string;
  subjects: string[];
  onUpdate: (subjects: string[]) => void;
}

export function SubjectManager({ tutorId, subjects, onUpdate }: SubjectManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(subjects);
  const [saving, setSaving] = useState(false);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tutor_profiles')
        .update({ subjects: selectedSubjects })
        .eq('user_id', tutorId);

      if (error) throw error;
      onUpdate(selectedSubjects);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating subjects:', error);
      alert('Gagal menyimpan mata pelajaran');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedSubjects(subjects);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Mata Pelajaran</h3>
            <p className="text-sm text-slate-500">Pilih pelajaran yang bisa Anda ajar</p>
          </div>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            Kelola
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg">
            {SUBJECTS.map((subject) => {
              const isSelected = selectedSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    'border-2 flex items-center gap-1',
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                  )}
                >
                  {isSelected && <X className="w-3 h-3" />}
                  {subject}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Simpan'
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <span
                key={subject}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full"
              >
                {subject}
              </span>
            ))
          ) : (
            <p className="text-slate-400 text-sm italic">Belum ada mata pelajaran dipilih</p>
          )}
        </div>
      )}
    </div>
  );
}
