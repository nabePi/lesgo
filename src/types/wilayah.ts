export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  province_id: string;
  name: string;
  type: 'city' | 'regency';
}

export interface District {
  id: string;
  city_id: string;
  name: string;
}

export interface Village {
  id: string;
  district_id: string;
  name: string;
  type: 'urban' | 'rural' | 'customary';
}

export interface SelectedLocation {
  province?: Province;
  city?: City;
  district?: District;
  village?: Village;
}
