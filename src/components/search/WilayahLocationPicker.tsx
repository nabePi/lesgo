'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, Navigation } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Province, City, District, Village, SelectedLocation } from '@/types/wilayah';

interface WilayahLocationPickerProps {
  onChange: (location: SelectedLocation) => void;
  value?: SelectedLocation;
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

  // Load provinces on mount
  useEffect(() => {
    setLoading(prev => ({ ...prev, provinces: true }));
    fetch('/api/wilayah/provinces')
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
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
      .then(res => res.json())
      .then(data => {
        setCities(data);
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
      .then(res => res.json())
      .then(data => {
        setDistricts(data);
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
      .then(res => res.json())
      .then(data => {
        setVillages(data);
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
    });
  }, [selectedProvince, selectedCity, selectedDistrict, selectedVillage, onChange]);

  const handleProvinceChange = (value: string) => {
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

  const isComplete = selectedProvince && selectedCity && selectedDistrict && selectedVillage;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Navigation className="w-5 h-5 text-indigo-600" />
        <label className="font-semibold text-slate-900">Lokasi</label>
      </div>

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

      {/* Selected Summary */}
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
    </div>
  );
}
