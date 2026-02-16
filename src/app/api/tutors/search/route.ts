import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get('subject');
  const villageId = searchParams.get('villageId');
  const districtId = searchParams.get('districtId');

  if (!subject || !villageId) {
    return NextResponse.json(
      { error: 'subject and villageId are required' },
      { status: 400 }
    );
  }

  // Step 1: Search for tutors in the same village
  let { data: tutors, error } = await supabaseServer
    .from('tutor_profiles')
    .select('*, user:profiles(*)')
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
      .select('*, user:profiles(*)')
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
