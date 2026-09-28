import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ players: [] });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase keys missing!");
      return NextResponse.json({ players: [], error: "Missing env vars" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cerca la stringa sia nella colonna 'player' che nella colonna 'name'
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .or(`player.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    const players = (data || []).map((p) => ({
      id: p.tmid || p.player_id || p.id,
      name: p.player || p.name || 'Sconosciuto',
      nationality: p.nationality || ''
    }));

    return NextResponse.json({ players });
  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ players: [] }, { status: 500 });
  }
}
