CREATE OR REPLACE FUNCTION search_tutors(
  p_subject TEXT,
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius DECIMAL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  bio TEXT,
  subjects TEXT[],
  hourly_rate INTEGER,
  is_verified BOOLEAN,
  rating DECIMAL,
  total_reviews INTEGER,
  location_lat DECIMAL,
  location_lng DECIMAL,
  address TEXT,
  distance DECIMAL,
  user JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.user_id,
    tp.bio,
    tp.subjects,
    tp.hourly_rate,
    tp.is_verified,
    tp.rating,
    tp.total_reviews,
    tp.location_lat,
    tp.location_lng,
    tp.address,
    (ST_Distance(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(tp.location_lng, tp.location_lat), 4326)::geography
    ) / 1000)::DECIMAL as distance,
    jsonb_build_object(
      'name', p.name,
      'avatar_url', p.avatar_url
    ) as user
  FROM tutor_profiles tp
  JOIN profiles p ON p.id = tp.user_id
  WHERE 
    tp.is_active = true
    AND (p_subject IS NULL OR p_subject = ANY(tp.subjects))
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(tp.location_lng, tp.location_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius * 1000
    )
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
