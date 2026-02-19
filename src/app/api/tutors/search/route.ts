import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get('subject');
  const villageId = searchParams.get('villageId');
  const districtId = searchParams.get('districtId');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!subject) {
    return NextResponse.json(
      { error: 'subject is required' },
      { status: 400 }
    );
  }

  // GPS-based search (when coordinates provided)
  if (lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistanceParam = searchParams.get('maxDistance');
    const MAX_DISTANCE_KM = maxDistanceParam ? parseFloat(maxDistanceParam) : 15; // Default 15km, configurable

    // Search all active tutors with subjects, then sort by distance
    let { data: tutors, error } = await supabaseServer
      .from('tutor_profiles')
      .select('*, user:profiles!tutor_profiles_user_id_fkey(*)')
      .eq('is_active', true)
      .contains('subjects', [subject])
      .order('rating', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate distance, filter by max distance, and sort by nearest
    const tutorsWithDistance = (tutors || [])
      .filter(t => t.location_lat && t.location_lng)
      .map(tutor => {
        const distance = calculateDistance(
          latitude,
          longitude,
          tutor.location_lat,
          tutor.location_lng
        );
        return { ...tutor, distance };
      })
      .filter(tutor => tutor.distance <= MAX_DISTANCE_KM) // Only tutors within max distance
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      tutors: tutorsWithDistance,
      expanded: false,
      gpsSearch: true,
      maxDistance: MAX_DISTANCE_KM,
      totalFound: tutorsWithDistance.length
    });
  }

  // Manual village selection search
  if (!villageId) {
    return NextResponse.json(
      { error: 'villageId or coordinates are required' },
      { status: 400 }
    );
  }

  // Step 1: Search for tutors in the same village
  let { data: tutors, error } = await supabaseServer
    .from('tutor_profiles')
    .select('*, user:profiles!tutor_profiles_user_id_fkey(*)')
    .eq('village_id', villageId)
    .eq('is_active', true)
    .contains('subjects', [subject])
    .order('rating', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Step 2: If no tutors found in village, expand to district
  if ((!tutors || tutors.length === 0) && districtId) {
    const { data: districtTutors, error: districtError } = await supabaseServer
      .from('tutor_profiles')
      .select('*, user:profiles!tutor_profiles_user_id_fkey(*)')
      .eq('district_id', districtId)
      .eq('is_active', true)
      .contains('subjects', [subject])
      .order('rating', { ascending: false });

    if (districtError) {
      return NextResponse.json({ error: districtError.message }, { status: 500 });
    }

    tutors = districtTutors || [];

    // Mark these as "nearby" (expanded search)
    if (tutors.length > 0) {
      tutors = tutors.map(t => ({ ...t, isExpandedSearch: true }));
    }
  }

  return NextResponse.json({
    tutors: tutors || [],
    expanded: tutors?.some((t: any) => t.isExpandedSearch) || false
  });
}

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
