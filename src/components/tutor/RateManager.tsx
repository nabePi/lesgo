'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, Pencil } from 'lucide-react';

interface RateManagerProps {
  tutorId: string;
  currentRate: number;
  onUpdate: (rate: number) => void;
}

export function RateManager({ tutorId, currentRate, onUpdate }: RateManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rate, setRate] = useState(currentRate.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const newRate = parseInt(rate);
    if (isNaN(newRate) || newRate < 10000) {
      alert('Tarif minimal Rp 10,000');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tutor_profiles')
        .update({ hourly_rate: newRate })
        .eq('user_id', tutorId);

      if (error) throw error;
      onUpdate(newRate);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating rate:', error);
      alert('Gagal menyimpan tarif');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRate(currentRate.toString());
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Tarif per Jam</h3>
            <p className="text-sm text-slate-500">Atur harga les per jam</p>
          </div>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Ubah
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tarif (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                Rp
              </span>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="50000"
                min="10000"
                step="1000"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Minimal Rp 10,000 per jam
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
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
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-3xl font-bold text-emerald-700">
            Rp {currentRate.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-emerald-600 mt-1">per jam</p>
        </div>
      )}
    </div>
  );
}
