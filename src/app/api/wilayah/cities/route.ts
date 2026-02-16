import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceId = searchParams.get('provinceId');

  if (!provinceId) {
    return NextResponse.json(
      { error: 'provinceId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('cities')
    .select('*')
    .eq('province_id', provinceId)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
