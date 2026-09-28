'use client';

import React, { useState } from 'react';

const ROW_CRITERIA = [
  { id: 'r1', label: 'Juventus', type: 'club', value: 'juventus', logo: '⚽' },
  { id: 'r2', label: 'Real Madrid', type: 'club', value: 'real_madrid', logo: '👑' },
  { id: 'r3', label: 'Inter', type: 'club', value: 'inter', logo: '⚫🔵' },
];

const COL_CRITERIA = [
  { id: 'c1', label: 'PSG', type: 'club', value: 'psg', logo: '🔴🔵' },
  { id: 'c2', label: 'Argentina', type: 'nationality', value: 'Argentina', logo: '🇦🇷' },
  { id: 'c3', label: 'Portogallo', type: 'nationality', value: 'Portugal', logo: '🇵🇹' },
];

export default function FootballGridGame() {
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array(3).fill(null).map(() => Array(3).fill(null))
  );
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lives, setLives] = useState(9);
  const [score, setScore] = useState(0);

  const playersList = [
    { id: 'dybala', name: 'Paulo Dybala' },
    { id: 'hakimi', name: 'Achraf Hakimi' },
    { id: 'ronaldo_cr7', name: 'Cristiano Ronaldo' },
    { id: 'zlatan', name: 'Zlatan Ibrahimović' },
  ];

  const handleSelectPlayer = async (player: { id: string; name: string }) => {
    if (!activeCell || lives <= 0) return;

    const rowCrit = ROW_CRITERIA[activeCell.row];
    const colCrit = COL_CRITERIA[activeCell.col];

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          rowCriteria: rowCrit,
          colCriteria: colCrit,
        }),
      });
      const data = await res.json();

      if (data.valid) {
        const newGrid = [...grid.map((r) => [...r])];
        newGrid[activeCell.row][activeCell.col] = player.name;
        setGrid(newGrid);
        setScore((prev) => prev + 1);
      } else {
        setLives((prev) => prev - 1);
        alert(`Sbagliato! ${player.name} non soddisfa entrambi i criteri.`);
      }
    } catch {
      alert('Errore di connessione');
    }

    setActiveCell(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Header Verde Smeraldo stile Lega Pronostici */}
      <header className="bg-emerald-700 text-white px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <h1 className="text-base font-bold leading-none">Footy Grid Quiz</h1>
              <span className="text-[10px] text-emerald-200">MODALITÀ PROVA</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-emerald-800/60 hover:bg-emerald-800 p-2 rounded-full transition-colors text-sm"
          >
            🔄
          </button>
        </div>
      </header>

      {/* Contenuto Principale */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-center items-center">
        
        {/* Card Statistiche BIANCA */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 mb-5 shadow-sm flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Punteggio</span>
            <span className="text-2xl font-black text-emerald-600">{score} <span className="text-sm font-normal text-slate-400">/ 9</span></span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Vite Rimaste</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xl font-black text-amber-500">{lives}</span>
              <span className="text-xs">❤️</span>
            </div>
          </div>
        </div>

        {/* Tabellone Griglia Chiaro */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-3 shadow-md">
          <div className="grid grid-cols-4 gap-2 aspect-square">
            
            {/* Cella Angolare */}
            <div className="bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
              <span className="text-slate-400 font-black text-[11px]">GRID</span>
            </div>

            {/* Intestazioni Colonne */}
            {COL_CRITERIA.map((col) => (
              <div key={col.id} className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow-2xs">
                <span className="text-base">{col.logo}</span>
                <span className="text-[11px] font-bold leading-tight mt-0.5 text-slate-700">{col.label}</span>
              </div>
            ))}

            {/* Righe e Celle di Gioco */}
            {ROW_CRITERIA.map((row, rIdx) => (
              <React.Fragment key={row.id}>
                {/* Intestazione Riga */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow-2xs">
                  <span className="text-base">{row.logo}</span>
                  <span className="text-[11px] font-bold leading-tight mt-0.5 text-slate-700">{row.label}</span>
                </div>

                {/* 3 Celle Interactive */}
                {[0, 1, 2].map((cIdx) => {
                  const cellValue = grid[rIdx][cIdx];
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      disabled={!!cellValue || lives <= 0}
                      onClick={() => setActiveCell({ row: rIdx, col: cIdx })}
                      className={`rounded-xl border flex flex-col items-center justify-center p-2 transition-all text-center ${
                        cellValue
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 active:scale-95'
                      }`}
                    >
                      {cellValue ? (
                        <span className="text-xs font-bold leading-tight text-emerald-700">{cellValue}</span>
                      ) : (
                        <span className="text-slate-400 text-lg font-light">+</span>
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

      </main>

      {/* Popup / Modal di Selezione Calciatore */}
      {activeCell && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white border border-slate-200 p-5 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-slate-800">Seleziona Calciatore</h3>
              <button onClick={() => setActiveCell(null)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              Deve aver giocato sia per <span className="text-emerald-700 font-bold">{ROW_CRITERIA[activeCell.row].label}</span> che per <span className="text-emerald-700 font-bold">{COL_CRITERIA[activeCell.col].label}</span>.
            </p>

            <input
              type="text"
              placeholder="Cerca calciatore (es. Dybala)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 mb-3"
            />

            <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-1">
              {playersList
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors text-sm font-semibold text-slate-700 flex justify-between items-center"
                  >
                    <span>{player.name}</span>
                    <span className="text-emerald-600 text-xs">Seleziona ➔</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar Bianca in stile App */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2 flex justify-around items-center text-xs text-slate-400 shadow-lg">
        <div className="flex flex-col items-center text-emerald-600 font-bold">
          <span className="text-base">🎮</span>
          <span>Griglia</span>
        </div>
        <div className="flex flex-col items-center hover:text-slate-600 cursor-pointer">
          <span className="text-base">🏆</span>
          <span>Classifica</span>
        </div>
        <div className="flex flex-col items-center hover:text-slate-600 cursor-pointer">
          <span className="text-base">⚙️</span>
          <span>Info</span>
        </div>
      </footer>
    </div>
  );
}
