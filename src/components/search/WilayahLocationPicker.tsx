'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, Navigation, AlertCircle, MapPin, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Province, City, District, Village, SelectedLocation } from '@/types/wilayah';

interface WilayahLocationPickerProps {
  onChange: (location: SelectedLocation & { coords?: { lat: number; lng: number }; address?: string }) => void;
  value?: SelectedLocation & { coords?: { lat: number; lng: number }; address?: string };
}

export function WilayahLocationPicker({ onChange, value }: WilayahLocationPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Province | undefined>(value?.province);
  const [selectedCity, setSelectedCity] = useState<City | undefined>(value?.city);
  const [selectedDistrict, setSelectedDistrict] = useState<District | undefined>(value?.district);
  const [selectedVillage, setSelectedVillage] = useState<Village | undefined>(value?.village);

  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(value?.address || null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(value?.coords || null);
  const [showGpsBanner, setShowGpsBanner] = useState(!!value?.coords);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    setLoading(prev => ({ ...prev, provinces: true }));
    setError(null);
    fetch('/api/wilayah/provinces')
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load provinces');
        }
        return data;
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProvinces(data);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(err => {
        setError(err.message);
        console.error('Error loading provinces:', err);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, provinces: false }));
      });
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      return;
    }
    setLoading(prev => ({ ...prev, cities: true }));
    fetch(`/api/wilayah/cities?provinceId=${selectedProvince.id}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load cities');
        }
        return data;
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCities(data);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(err => {
        console.error('Error loading cities:', err);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, cities: false }));
      });
  }, [selectedProvince]);

  // Load districts when city changes
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      return;
    }
    setLoading(prev => ({ ...prev, districts: true }));
    fetch(`/api/wilayah/districts?cityId=${selectedCity.id}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load districts');
        }
        return data;
      })
      .then(data => {
        if (Array.isArray(data)) {
          setDistricts(data);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(err => {
        console.error('Error loading districts:', err);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, districts: false }));
      });
  }, [selectedCity]);

  // Load villages when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setVillages([]);
      return;
    }
    setLoading(prev => ({ ...prev, villages: true }));
    fetch(`/api/wilayah/villages?districtId=${selectedDistrict.id}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load villages');
        }
        return data;
      })
      .then(data => {
        if (Array.isArray(data)) {
          setVillages(data);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(err => {
        console.error('Error loading villages:', err);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, villages: false }));
      });
  }, [selectedDistrict]);

  // Notify parent of changes
  useEffect(() => {
    onChange({
      province: selectedProvince,
      city: selectedCity,
      district: selectedDistrict,
      village: selectedVillage,
      coords: coords || undefined,
      address: detectedAddress || undefined,
    });
  }, [selectedProvince, selectedCity, selectedDistrict, selectedVillage, coords, detectedAddress, onChange]);

  const clearManualSelection = () => {
    setSelectedProvince(undefined);
    setSelectedCity(undefined);
    setSelectedDistrict(undefined);
    setSelectedVillage(undefined);
  };

  const handleProvinceChange = (value: string) => {
    // Clear GPS when user selects manual location
    clearGpsLocation();
    const province = provinces.find(p => p.id === value);
    setSelectedProvince(province);
    setSelectedCity(undefined);
    setSelectedDistrict(undefined);
    setSelectedVillage(undefined);
  };

  const handleCityChange = (value: string) => {
    const city = cities.find(c => c.id === value);
    setSelectedCity(city);
    setSelectedDistrict(undefined);
    setSelectedVillage(undefined);
  };

  const handleDistrictChange = (value: string) => {
    const district = districts.find(d => d.id === value);
    setSelectedDistrict(district);
    setSelectedVillage(undefined);
  };

  const handleVillageChange = (value: string) => {
    const village = villages.find(v => v.id === value);
    setSelectedVillage(village);
  };

  const openPermissionDialog = async () => {
    // Check if permission API is supported
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });

        if (result.state === 'granted') {
          // Permission already granted, get location directly
          getCurrentLocation();
        } else if (result.state === 'prompt') {
          // Permission not asked yet, show custom dialog
          setShowPermissionDialog(true);
        } else if (result.state === 'denied') {
          // Permission denied, show alert
          alert('Akses lokasi ditolak. Silakan aktifkan izin lokasi di pengaturan browser Anda.');
        }
      } catch {
        // Fallback: just show the dialog
        setShowPermissionDialog(true);
      }
    } else {
      // Permission API not supported, show dialog
      setShowPermissionDialog(true);
    }
  };

  const confirmGpsPermission = () => {
    setShowPermissionDialog(false);
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    setGpsLoading(true);
    // Clear manual selection when using GPS
    clearManualSelection();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          const address = data.results[0]?.formatted_address || 'Lokasi saat ini';
          setDetectedAddress(address);
          setShowGpsBanner(true);
        } catch {
          setDetectedAddress('Lokasi saat ini');
          setShowGpsBanner(true);
        }
        setGpsLoading(false);
      },
      (error) => {
        alert('Gagal mendapatkan lokasi: ' + error.message);
        setGpsLoading(false);
      }
    );
  };

  const clearGpsLocation = () => {
    setCoords(null);
    setDetectedAddress(null);
    setShowGpsBanner(false);
  };

  const isComplete = selectedProvince && selectedCity && selectedDistrict && selectedVillage;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Navigation className="w-5 h-5 text-indigo-600" />
        <label className="font-semibold text-slate-900">Lokasi</label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Gagal memuat data lokasi</p>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Pastikan database migrations sudah dijalankan. Jalankan: npm run import:wilayah
            </p>
          </div>
        </div>
      )}

      {/* GPS Location Button */}
      <Button
        onClick={openPermissionDialog}
        disabled={gpsLoading}
        variant="outline"
        className={cn(
          "w-full h-14 justify-start gap-3 text-left border-2 border-slate-200 hover:border-indigo-400",
          "rounded-xl transition-all duration-200"
        )}
      >
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          {gpsLoading ? (
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          ) : (
            <Crosshair className="w-5 h-5 text-indigo-600" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-900">Gunakan Lokasi Saat Ini</p>
          <p className="text-xs text-slate-500">Deteksi otomatis GPS</p>
        </div>
      </Button>

      {/* GPS Detected Location Banner */}
      {showGpsBanner && detectedAddress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">Lokasi terdeteksi</p>
            <p className="text-sm text-blue-700 truncate">{detectedAddress}</p>
            <p className="text-xs text-blue-600 mt-1">
              Anda bisa langsung mencari guru terdekat
            </p>
          </div>
          <button
            onClick={clearGpsLocation}
            className="text-sm text-blue-700 hover:text-blue-800 font-medium"
          >
            Hapus
          </button>
        </div>
      )}

      {/* Divider - Hidden when GPS is active */}
      {!coords && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-slate-500">atau pilih manual</span>
          </div>
        </div>
      )}

      {/* GPS Active Indicator */}
      {coords && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-900">Menggunakan lokasi GPS</p>
            <p className="text-sm text-emerald-700">Anda bisa langsung mencari guru</p>
          </div>
        </div>
      )}

      {/* Manual Selection - Hidden when GPS is active */}
      {!coords && (
        <>
          {/* Province */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Provinsi
        </label>
        <Select
          value={selectedProvince?.id}
          onValueChange={handleProvinceChange}
          disabled={loading.provinces}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={loading.provinces ? 'Memuat...' : 'Pilih Provinsi'} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map(province => (
              <SelectItem key={province.id} value={province.id}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Kota/Kabupaten
        </label>
        <Select
          value={selectedCity?.id}
          onValueChange={handleCityChange}
          disabled={!selectedProvince || loading.cities}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={
              !selectedProvince ? 'Pilih provinsi dulu' :
              loading.cities ? 'Memuat...' :
              'Pilih Kota/Kabupaten'
            } />
          </SelectTrigger>
          <SelectContent>
            {cities.map(city => (
              <SelectItem key={city.id} value={city.id}>
                {city.type === 'city' ? 'Kota ' : 'Kabupaten '}{city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Kecamatan
        </label>
        <Select
          value={selectedDistrict?.id}
          onValueChange={handleDistrictChange}
          disabled={!selectedCity || loading.districts}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={
              !selectedCity ? 'Pilih kota dulu' :
              loading.districts ? 'Memuat...' :
              'Pilih Kecamatan'
            } />
          </SelectTrigger>
          <SelectContent>
            {districts.map(district => (
              <SelectItem key={district.id} value={district.id}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Village */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Kelurahan/Desa
        </label>
        <Select
          value={selectedVillage?.id}
          onValueChange={handleVillageChange}
          disabled={!selectedDistrict || loading.villages}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={
              !selectedDistrict ? 'Pilih kecamatan dulu' :
              loading.villages ? 'Memuat...' :
              'Pilih Kelurahan/Desa'
            } />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {villages.map(village => (
              <SelectItem key={village.id} value={village.id}>
                {village.type === 'urban' ? 'Kel. ' : 'Desa '}{village.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

          {/* Selected Summary - Manual */}
          {isComplete && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-900">Lokasi lengkap dipilih</p>
                <p className="text-sm text-emerald-700">
                  {selectedVillage?.name}, {selectedDistrict?.name}
                </p>
                <p className="text-xs text-emerald-600">
                  {selectedCity?.type === 'city' ? 'Kota ' : 'Kabupaten '}{selectedCity?.name}, {selectedProvince?.name}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Izin Akses Lokasi
            </DialogTitle>
            <DialogDescription className="pt-2">
              LesGo membutuhkan akses lokasi Anda untuk menemukan guru les terdekat di area Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 rounded-lg p-4 mt-2">
            <p className="text-sm text-slate-600">
              Data lokasi Anda digunakan untuk:
            </p>
            <ul className="text-sm text-slate-600 mt-2 space-y-1 list-disc list-inside">
              <li>Mencari guru les di sekitar Anda</li>
              <li>Menghitung jarak antara Anda dan tutor</li>
              <li>Memberikan rekomendasi tutor terdekat</li>
            </ul>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowPermissionDialog(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={confirmGpsPermission}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Izinkan Akses Lokasi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
