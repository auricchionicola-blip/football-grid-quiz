import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ players: [] });
    }

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cerca tra i calciatori importati dal CSV
    const { data, error } = await supabase
      .from('players')
      .select('tmid, player, nationality')
      .ilike('player', `%${query}%`)
      .limit(10);

    if (error) throw error;

    // Formattazione coerente per il frontend
    const players = (data || []).map((p) => ({
      id: p.tmid,
      name: p.player,
      nationality: p.nationality
    }));

    return NextResponse.json({ players });
  } catch {
    return NextResponse.json({ players: [] }, { status: 500 });
  }
}
