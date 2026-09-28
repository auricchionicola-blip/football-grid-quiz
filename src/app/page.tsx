'use client';

import React, { useState } from 'react';

const ROW_CRITERIA = [
  { id: 'r1', label: 'Juventus', type: 'club', value: 'juventus' },
  { id: 'r2', label: 'Real Madrid', type: 'club', value: 'real_madrid' },
  { id: 'r3', label: 'Inter', type: 'club', value: 'inter' },
];

const COL_CRITERIA = [
  { id: 'c1', label: 'PSG', type: 'club', value: 'psg' },
  { id: 'c2', label: 'Argentina', type: 'nationality', value: 'Argentina' },
  { id: 'c3', label: 'Portogallo', type: 'nationality', value: 'Portugal' },
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
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <h1 className="text-2xl font-bold text-emerald-400">Footy Grid Quiz</h1>
        <div className="flex gap-6 text-sm font-semibold">
          <div>Punteggio: <span className="text-emerald-400">{score}/9</span></div>
          <div>Vite rimaste: <span className="text-rose-400">{lives}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full max-w-xl aspect-square bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-center bg-slate-950/50 rounded-lg"></div>

        {COL_CRITERIA.map((col) => (
          <div key={col.id} className="flex items-center justify-center font-bold text-center text-xs sm:text-sm p-2 bg-slate-800/80 rounded-lg border border-slate-700/50 text-slate-200">
            {col.label}
          </div>
        ))}

        {ROW_CRITERIA.map((row, rIdx) => (
          <React.Fragment key={row.id}>
            <div className="flex items-center justify-center font-bold text-center text-xs sm:text-sm p-2 bg-slate-800/80 rounded-lg border border-slate-700/50 text-slate-200">
              {row.label}
            </div>

            {[0, 1, 2].map((cIdx) => {
              const cellValue = grid[rIdx][cIdx];
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  disabled={!!cellValue || lives <= 0}
                  onClick={() => setActiveCell({ row: rIdx, col: cIdx })}
                  className={`flex flex-col items-center justify-center rounded-lg border text-center p-2 transition-all duration-200 font-semibold text-xs sm:text-sm ${
                    cellValue
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                  }`}
                >
                  {cellValue ? cellValue : <span className="text-slate-600">+ Seleziona</span>}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {activeCell && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-1">Seleziona un calciatore</h3>
            <p className="text-xs text-slate-400 mb-4">
              Deve aver giocato sia per <span className="text-emerald-400">{ROW_CRITERIA[activeCell.row].label}</span> che per <span className="text-emerald-400">{COL_CRITERIA[activeCell.col].label}</span>.
            </p>

            <input
              type="text"
              placeholder="Cerca nome calciatore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500 mb-4"
            />

            <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
              {playersList
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:bg-emerald-950/50 hover:border-emerald-500/50 transition-colors text-sm font-medium"
                  >
                    {player.name}
                  </button>
                ))}
            </div>

            <button
              onClick={() => setActiveCell(null)}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
