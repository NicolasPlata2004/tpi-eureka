'use client';

import React, { useState, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface AreaModelProps {
  reto: any;
  onCorrectAction?: () => void;
  onErrorAction?: () => void;
}

interface Piece {
  id: string;
  math: string;
  inTarget: boolean;
  color: string;
}

export default function AreaModel({ reto, onCorrectAction, onErrorAction }: AreaModelProps) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [appState, setAppState] = useState<'playing' | 'error' | 'success'>('playing');

  const colors = ['bg-blue-100', 'bg-red-100', 'bg-green-100', 'bg-yellow-100'];

  useEffect(() => {
    if (reto && reto.piezas) {
      setPieces(reto.piezas.map((p: string, idx: number) => ({
        id: `piece-${idx}`,
        math: p,
        inTarget: false,
        color: colors[idx % colors.length]
      })));
      setAppState('playing');
    }
  }, [reto]);

  const handlePieceClick = (clickedId: string) => {
    if (appState === 'success') return;
    
    setPieces(prev => {
      const newPieces = prev.map(p => p.id === clickedId ? { ...p, inTarget: !p.inTarget } : p);
      
      // Si todas las piezas están en el target, gana.
      const allInTarget = newPieces.every(p => p.inTarget);
      if (allInTarget) {
        setAppState('success');
      }
      return newPieces;
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[600px] mx-auto pb-4">
      <div className="w-full bg-white border border-tinta/10 rounded-3xl p-8 flex flex-col items-center shadow-sm">
        <h2 className="text-xl font-bold text-tinta mb-2 text-center">
          {reto.pregunta}
        </h2>
        <p className="text-sm text-slate-500 mb-6 text-center">{reto.pista}</p>
        
        <div className="text-3xl text-tinta mb-6">
          <BlockMath math={reto.expresion} />
        </div>

        {/* Zona del Target */}
        <div className="w-full min-h-[160px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-center mb-6 transition-all">
          {pieces.filter(p => p.inTarget).length === 0 && (
            <span className="text-slate-400 font-medium">Lleva las piezas aquí</span>
          )}
          {pieces.filter(p => p.inTarget).map(p => (
            <button
              key={p.id}
              onClick={() => handlePieceClick(p.id)}
              className={`${p.color} border-2 border-black/10 px-6 py-4 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all`}
            >
              <InlineMath math={p.math} />
            </button>
          ))}
        </div>

        {/* Zona de piezas disponibles */}
        <div className="w-full flex flex-wrap gap-3 items-center justify-center mb-6">
          {pieces.filter(p => !p.inTarget).map(p => (
            <button
              key={p.id}
              onClick={() => handlePieceClick(p.id)}
              className={`${p.color} border-2 border-black/10 px-6 py-4 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all animate-scaleIn`}
            >
              <InlineMath math={p.math} />
            </button>
          ))}
        </div>

        <div className="w-full">
          {appState === 'success' && (
            <button
              onClick={() => {
                if (onCorrectAction) onCorrectAction();
              }}
              className="w-full bg-green-logro hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 animate-scaleIn"
            >
              <span>Siguiente Reto</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
