'use client';

import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Reverse geocode to get address
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        const address = data.results[0]?.formatted_address || '';
        onLocationSelect(latitude, longitude, address);
        setLoading(false);
      },
      (error) => {
        alert('Gagal mendapatkan lokasi: ' + error.message);
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={getCurrentLocation}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="mr-2 h-4 w-4" />
        )}
        Gunakan Lokasi Saat Ini
      </Button>
      
      <div className="text-center text-gray-500">atau</div>
      
      <div>
        <label className="font-medium">Masukkan Alamat Manual</label>
        <textarea
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          className="w-full p-3 border rounded-lg mt-1"
          rows={3}
          placeholder="Jl. Mawar No. 123, Jakarta Selatan"
        />
      </div>
    </div>
  );
}
