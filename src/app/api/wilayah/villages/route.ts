import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get('districtId');

  if (!districtId) {
    return NextResponse.json(
      { error: 'districtId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('villages')
    .select('*')
    .eq('district_id', districtId)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
