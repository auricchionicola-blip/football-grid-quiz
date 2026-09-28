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
      console.error("Variabili d'ambiente Supabase mancanti!");
      return NextResponse.json({ players: [], error: 'Missing env vars' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cerca nella colonna 'player' del CSV
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .ilike('player', `%${query}%`)
      .limit(10);

    if (error) {
      console.error('Errore Supabase:', error.message);
      return NextResponse.json({ players: [], error: error.message }, { status: 500 });
    }

    const players = (data || []).map((p: Record<string, string>) => ({
      id: p.tmid || p.player_id || String(p.id),
      name: p.player || p.name || 'Sconosciuto',
      nationality: p.nationality || '',
    }));

    return NextResponse.json({ players });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('API Route Error:', errorMessage);
    return NextResponse.json({ players: [], error: errorMessage }, { status: 500 });
  }
}
