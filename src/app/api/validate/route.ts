import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: 'Variabili d\'ambiente mancanti' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { playerId, rowCriteria, colCriteria } = await request.json();

    const checkCriterion = async (criterion: { type: string; value: string }) => {
      if (criterion.type === 'club') {
        // Cerca se il giocatore ha giocato per il club nei trasferimenti (sia da che verso il club)
        const { data, error } = await supabase
          .from('player_careers')
          .select('id')
          .eq('player_id', playerId)
          .or(`from_club_name.ilike.%${criterion.value}%,to_club_name.ilike.%${criterion.value}%`)
          .limit(1);

        if (error) console.error(error);
        return data && data.length > 0;
      } 
      
      if (criterion.type === 'nationality') {
        const { data, error } = await supabase
          .from('players')
          .select('id')
          .eq('tmid', playerId)
          .ilike('nationality', `%${criterion.value}%`)
          .limit(1);

        if (error) console.error(error);
        return data && data.length > 0;
      }

      return false;
    };

    const satisfiesRow = await checkCriterion(rowCriteria);
    const satisfiesCol = await checkCriterion(colCriteria);

    return NextResponse.json({ 
      success: true, 
      valid: satisfiesRow && satisfiesCol 
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Errore interno del server' }, { status: 500 });
  }
}
