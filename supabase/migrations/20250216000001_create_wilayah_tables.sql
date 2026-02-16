-- Provinces (Level 1) - 2 digits
CREATE TABLE provinces (
    id CHAR(2) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Cities/Regencies (Level 2) - 5 digits (XX.XX)
CREATE TABLE cities (
    id CHAR(5) PRIMARY KEY,
    province_id CHAR(2) REFERENCES provinces(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('city', 'regency'))
);

-- Districts (Kecamatan) (Level 3) - 8 digits (XX.XX.XX)
CREATE TABLE districts (
    id CHAR(8) PRIMARY KEY,
    city_id CHAR(5) REFERENCES cities(id),
    name VARCHAR(255) NOT NULL
);

-- Villages (Desa/Kelurahan) (Level 4) - 13 digits (XX.XX.XX.XXXX)
CREATE TABLE villages (
    id CHAR(13) PRIMARY KEY,
    district_id CHAR(8) REFERENCES districts(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('urban', 'rural', 'customary'))
);

-- Indexes for performance
CREATE INDEX idx_cities_province ON cities(province_id);
CREATE INDEX idx_districts_city ON districts(city_id);
CREATE INDEX idx_villages_district ON villages(district_id);

-- Enable RLS
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON provinces FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON villages FOR SELECT USING (true);
