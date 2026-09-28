import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Forza la route ad essere eseguita sempre sul server dinamicamente
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Variabili di ambiente Supabase non configurate' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { playerId, rowCriteria, colCriteria } = await request.json();

    const checkCriterion = async (type: string, value: string) => {
      if (type === 'club') {
        const { data } = await supabase
          .from('player_careers')
          .select('id')
          .eq('player_id', playerId)
          .eq('club_id', value);
        return data && data.length > 0;
      } else if (type === 'nationality') {
        const { data } = await supabase
          .from('players')
          .select('id')
          .eq('id', playerId)
          .eq('nationality', value);
        return data && data.length > 0;
      }
      return false;
    };

    const satisfiesRow = await checkCriterion(rowCriteria.type, rowCriteria.value);
    const satisfiesCol = await checkCriterion(colCriteria.type, colCriteria.value);

    return NextResponse.json({ success: true, valid: satisfiesRow && satisfiesCol });
  } catch {
    return NextResponse.json({ success: false, error: 'Errore durante la verifica' }, { status: 500 });
  }
}
