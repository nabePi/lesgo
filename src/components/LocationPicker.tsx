'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Village {
  id: string;
  name: string;
}

interface LocationPickerProps {
  onChange: (location: {
    provinceId: string;
    cityId: string;
    districtId: string;
    villageId: string;
    fullAddress: string;
  }) => void;
  defaultValues?: {
    provinceId?: string;
    cityId?: string;
    districtId?: string;
    villageId?: string;
  };
}

export function LocationPicker({ onChange, defaultValues }: LocationPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedProvince, setSelectedProvince] = useState(defaultValues?.provinceId || '');
  const [selectedCity, setSelectedCity] = useState(defaultValues?.cityId || '');
  const [selectedDistrict, setSelectedDistrict] = useState(defaultValues?.districtId || '');
  const [selectedVillage, setSelectedVillage] = useState(defaultValues?.villageId || '');

  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false,
  });

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadCities(selectedProvince);
      setSelectedCity('');
      setSelectedDistrict('');
      setSelectedVillage('');
      setDistricts([]);
      setVillages([]);
    }
  }, [selectedProvince]);

  // Load districts when city changes
  useEffect(() => {
    if (selectedCity) {
      loadDistricts(selectedCity);
      setSelectedDistrict('');
      setSelectedVillage('');
      setVillages([]);
    }
  }, [selectedCity]);

  // Load villages when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadVillages(selectedDistrict);
      setSelectedVillage('');
    }
  }, [selectedDistrict]);

  // Notify parent when selection changes
  useEffect(() => {
    if (selectedProvince && selectedCity && selectedDistrict && selectedVillage) {
      const provinceName = provinces.find(p => p.id === selectedProvince)?.name || '';
      const cityName = cities.find(c => c.id === selectedCity)?.name || '';
      const districtName = districts.find(d => d.id === selectedDistrict)?.name || '';
      const villageName = villages.find(v => v.id === selectedVillage)?.name || '';

      onChange({
        provinceId: selectedProvince,
        cityId: selectedCity,
        districtId: selectedDistrict,
        villageId: selectedVillage,
        fullAddress: `${villageName}, ${districtName}, ${cityName}, ${provinceName}`,
      });
    }
  }, [selectedProvince, selectedCity, selectedDistrict, selectedVillage]);

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const res = await fetch('/api/wilayah/provinces');
      const data = await res.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadCities = async (provinceId: string) => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      const res = await fetch(`/api/wilayah/cities?provinceId=${provinceId}`);
      const data = await res.json();
      setCities(data);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const loadDistricts = async (cityId: string) => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const res = await fetch(`/api/wilayah/districts?cityId=${cityId}`);
      const data = await res.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const loadVillages = async (districtId: string) => {
    setLoading(prev => ({ ...prev, villages: true }));
    try {
      const res = await fetch(`/api/wilayah/villages?districtId=${districtId}`);
      const data = await res.json();
      setVillages(data);
    } catch (error) {
      console.error('Error loading villages:', error);
    } finally {
      setLoading(prev => ({ ...prev, villages: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Provinsi
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className={cn(
              "w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "appearance-none cursor-pointer"
            )}
            disabled={loading.provinces}
          >
            <option value="">Pilih Provinsi</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
          {loading.provinces && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Kota/Kabupaten
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className={cn(
              "w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "appearance-none cursor-pointer",
              !selectedProvince && "bg-slate-50 text-slate-400"
            )}
            disabled={!selectedProvince || loading.cities}
          >
            <option value="">
              {loading.cities ? 'Memuat...' : 'Pilih Kota/Kabupaten'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {loading.cities && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Kecamatan
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className={cn(
              "w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "appearance-none cursor-pointer",
              !selectedCity && "bg-slate-50 text-slate-400"
            )}
            disabled={!selectedCity || loading.districts}
          >
            <option value="">
              {loading.districts ? 'Memuat...' : 'Pilih Kecamatan'}
            </option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
          {loading.districts && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Village */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Kelurahan/Desa
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className={cn(
              "w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "appearance-none cursor-pointer",
              !selectedDistrict && "bg-slate-50 text-slate-400"
            )}
            disabled={!selectedDistrict || loading.villages}
          >
            <option value="">
              {loading.villages ? 'Memuat...' : 'Pilih Kelurahan/Desa'}
            </option>
            {villages.map((village) => (
              <option key={village.id} value={village.id}>
                {village.name}
              </option>
            ))}
          </select>
          {loading.villages && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Summary */}
      {selectedProvince && selectedCity && selectedDistrict && selectedVillage && (
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <p className="text-sm text-indigo-900 font-medium">Lokasi Terpilih:</p>
          <p className="text-sm text-indigo-700 mt-1">
            {villages.find(v => v.id === selectedVillage)?.name},{' '}
            {districts.find(d => d.id === selectedDistrict)?.name},{' '}
            {cities.find(c => c.id === selectedCity)?.name},{' '}
            {provinces.find(p => p.id === selectedProvince)?.name}
          </p>
        </div>
      )}
    </div>
  );
}
