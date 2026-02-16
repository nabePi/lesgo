-- Add location hierarchy fields to tutor_profiles
ALTER TABLE tutor_profiles
ADD COLUMN province_id CHAR(2) REFERENCES provinces(id),
ADD COLUMN city_id CHAR(5) REFERENCES cities(id),
ADD COLUMN district_id CHAR(8) REFERENCES districts(id),
ADD COLUMN village_id CHAR(13) REFERENCES villages(id);

-- Create indexes for efficient searching
CREATE INDEX idx_tutor_profiles_village ON tutor_profiles(village_id);
CREATE INDEX idx_tutor_profiles_district ON tutor_profiles(district_id);
CREATE INDEX idx_tutor_profiles_city ON tutor_profiles(city_id);
CREATE INDEX idx_tutor_profiles_province ON tutor_profiles(province_id);

-- Create composite index for common search pattern
CREATE INDEX idx_tutor_profiles_location_search ON tutor_profiles(village_id, district_id, is_active, is_verified);
