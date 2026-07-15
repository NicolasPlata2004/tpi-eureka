'use client';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface SustituidorProps {
  reto: any;
  onCorrectAction?: () => void;
  onErrorAction?: () => void;
}

export default function Sustituidor({ reto, onCorrectAction, onErrorAction }: SustituidorProps) {
  const [answer, setAnswer] = useState('');
  const [appState, setAppState] = useState<'playing' | 'error' | 'success'>('playing');

  const handleComprobar = () => {
    const num = parseInt(answer.trim(), 10);
    if (num === reto.respuestaCorrecta) {
      setAppState('success');
    } else {
      setAppState('error');
      if (onErrorAction) onErrorAction();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[500px] mx-auto pb-4">
      <div className="w-full bg-white border border-tinta/10 rounded-3xl p-8 flex flex-col items-center shadow-sm">
        <h2 className="text-xl font-bold text-tinta mb-4 text-center">
          {reto.pregunta}
        </h2>
        
        <div className="bg-slate-50 p-6 rounded-2xl w-full flex flex-col items-center justify-center border border-slate-100 mb-6">
          <div className="text-3xl text-tinta mb-4">
            <BlockMath math={reto.expresion} />
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xl font-semibold text-slate-600">=</span>
            <input
              type="number"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (appState === 'error') setAppState('playing');
              }}
              placeholder="?"
              className="w-24 h-14 text-center text-2xl font-bold rounded-xl border-2 border-blue-action/30 focus:border-blue-action focus:outline-none transition-all"
              disabled={appState === 'success'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleComprobar();
              }}
            />
          </div>
        </div>

        {appState === 'error' && (
          <div className="bg-[#FDF1DC] border border-amber-revisar/40 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn w-full mb-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#8A5B10]">Respuesta incorrecta</p>
              <p className="text-xs text-[#7A5310] leading-relaxed">{reto.pista}</p>
            </div>
          </div>
        )}

        <div className="w-full">
          {appState === 'success' ? (
            <button
              onClick={() => {
                if (onCorrectAction) onCorrectAction();
              }}
              className="w-full bg-green-logro hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Siguiente Reto</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleComprobar}
              className="w-full bg-blue-action hover:bg-blue-action/90 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
            >
              Comprobar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
