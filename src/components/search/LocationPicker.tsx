'use client';

import { useState } from 'react';
import { MapPin, Loader2, Navigation, Home, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
}

export function LocationPicker({ onLocationSelect, selectedLocation }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showManual, setShowManual] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          const address = data.results[0]?.formatted_address || 'Lokasi saat ini';
          onLocationSelect(latitude, longitude, address);
        } catch {
          onLocationSelect(latitude, longitude, 'Lokasi saat ini');
        }
        setLoading(false);
      },
      (error) => {
        alert('Gagal mendapatkan lokasi: ' + error.message);
        setLoading(false);
      }
    );
  };

  const handleManualSubmit = async () => {
    if (manualAddress.trim()) {
      setGeocoding(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(manualAddress.trim())}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const formattedAddress = data.results[0].formatted_address;
          onLocationSelect(location.lat, location.lng, formattedAddress);
        } else {
          // Fallback: use Jakarta coordinates if geocoding fails
          onLocationSelect(-6.2088, 106.8456, manualAddress.trim());
        }
      } catch {
        // Fallback: use Jakarta coordinates if geocoding fails
        onLocationSelect(-6.2088, 106.8456, manualAddress.trim());
      } finally {
        setGeocoding(false);
      }
    }
  };

  if (selectedLocation) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-indigo-600" />
          <label className="font-semibold text-slate-900">Lokasi</label>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900">Lokasi terpilih</p>
            <p className="text-sm text-emerald-700 truncate">{selectedLocation.address}</p>
          </div>
          <button
            onClick={() => onLocationSelect(0, 0, '')}
            className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
          >
            Ubah
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Navigation className="w-5 h-5 text-indigo-600" />
        <label className="font-semibold text-slate-900">Lokasi</label>
      </div>

      <div className="space-y-3">
        {/* GPS Location Button */}
        <Button
          onClick={getCurrentLocation}
          disabled={loading}
          variant="outline"
          className={cn(
            "w-full h-14 justify-start gap-3 text-left border-2 border-slate-200 hover:border-indigo-400",
            "rounded-xl transition-all duration-200"
          )}
        >
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">Gunakan Lokasi Saat Ini</p>
            <p className="text-xs text-slate-500">Deteksi otomatis GPS</p>
          </div>
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-background text-slate-500">atau</span>
          </div>
        </div>

        {/* Manual Address Input */}
        {!showManual ? (
          <Button
            onClick={() => setShowManual(true)}
            variant="outline"
            className="w-full h-14 justify-start gap-3 text-left border-2 border-slate-200 hover:border-indigo-400 rounded-xl"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <Home className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Masukkan Alamat Manual</p>
              <p className="text-xs text-slate-500">Ketik alamat lengkap</p>
            </div>
          </Button>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <textarea
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className={cn(
                "w-full p-4 border-2 border-slate-200 rounded-xl transition-all duration-200",
                "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
                "min-h-[100px] resize-none"
              )}
              placeholder="Jl. Mawar No. 123, Kelurahan..., Kecamatan..., Kota..."
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowManual(false)}
                className="flex-1 h-11"
              >
                Batal
              </Button>
              <Button
                onClick={handleManualSubmit}
                disabled={!manualAddress.trim() || geocoding}
                className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
              >
                {geocoding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Simpan Alamat'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
