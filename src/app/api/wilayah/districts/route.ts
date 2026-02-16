import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('cityId');

  if (!cityId) {
    return NextResponse.json(
      { error: 'cityId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('districts')
    .select('*')
    .eq('city_id', cityId)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
