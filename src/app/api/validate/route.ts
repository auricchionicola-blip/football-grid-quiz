import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
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
