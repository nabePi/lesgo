'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilitySlot {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const daysOfWeek = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

interface AvailabilityManagerProps {
  tutorId: string;
}

export function AvailabilityManager({ tutorId }: AvailabilityManagerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '08:00',
    end_time: '10:00',
  });

  useEffect(() => {
    loadAvailability();
  }, [tutorId]);

  const loadAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = async () => {
    if (newSlot.start_time >= newSlot.end_time) {
      alert('Waktu mulai harus lebih awal dari waktu selesai');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('tutor_availability').insert({
        tutor_id: tutorId,
        day_of_week: newSlot.day_of_week,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        is_active: true,
      });

      if (error) throw error;

      await loadAvailability();
      setShowAddForm(false);
      setNewSlot({ day_of_week: 1, start_time: '08:00', end_time: '10:00' });
    } catch (error) {
      console.error('Error adding slot:', error);
      alert('Gagal menambahkan jadwal');
    } finally {
      setSaving(false);
    }
  };

  const removeSlot = async (slotId: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tutor_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      await loadAvailability();
    } catch (error) {
      console.error('Error removing slot:', error);
      alert('Gagal menghapus jadwal');
    } finally {
      setSaving(false);
    }
  };

  const toggleSlot = async (slotId: string, currentStatus: boolean) => {
    console.log('Toggling slot:', slotId, 'from', currentStatus, 'to', !currentStatus);
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('tutor_availability')
        .update({ is_active: !currentStatus })
        .eq('id', slotId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Toggle success:', data);
      await loadAvailability();
    } catch (error) {
      console.error('Error updating slot:', error);
      alert('Gagal mengubah status jadwal');
    } finally {
      setSaving(false);
    }
  };

  const groupSlotsByDay = () => {
    const grouped: Record<number, AvailabilitySlot[]> = {};
    slots.forEach((slot) => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = [];
      }
      grouped[slot.day_of_week].push(slot);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const groupedSlots = groupSlotsByDay();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Jadwal Ketersediaan</h3>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <h4 className="font-medium text-indigo-900 mb-3">Tambah Jadwal Baru</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Hari</label>
              <select
                value={newSlot.day_of_week}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })
                }
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
              >
                {daysOfWeek.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Mulai</label>
              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, start_time: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Selesai</label>
              <input
                type="time"
                value={newSlot.end_time}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, end_time: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-slate-200"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={addSlot}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Simpan
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(false)}
              disabled={saving}
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Slots List */}
      {slots.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Belum ada jadwal</p>
          <p className="text-sm text-slate-500 mt-1">
            Tambahkan jadwal ketersediaan Anda
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {daysOfWeek.map((dayName, dayIndex) => {
            const daySlots = groupedSlots[dayIndex];
            if (!daySlots || daySlots.length === 0) return null;

            return (
              <div key={dayIndex} className="bg-white rounded-lg border border-slate-200 p-4">
                <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  {dayName}
                </h4>
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        slot.is_active
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-900">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </span>
                        {!slot.is_active && (
                          <span className="text-xs text-slate-500">(Non-aktif)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Toggle clicked:', slot.id, 'current status:', slot.is_active);
                            toggleSlot(slot.id, slot.is_active);
                          }}
                          disabled={saving}
                          className="p-2 hover:bg-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
                          title={slot.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          type="button"
                        >
                          {slot.is_active ? (
                            <ToggleRight className="w-8 h-8 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeSlot(slot.id);
                          }}
                          disabled={saving}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus"
                          type="button"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 text-sm text-slate-500 bg-blue-50 p-3 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p>
          Jadwal yang aktif akan terlihat oleh orang tua saat mencari tutor.
          Nonaktifkan jadwal jika Anda sedang tidak tersedia.
        </p>
      </div>
    </div>
  );
}
