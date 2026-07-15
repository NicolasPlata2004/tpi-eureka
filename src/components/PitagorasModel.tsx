'use client';

import React, { useState, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface PitagorasModelProps {
  reto: any;
  onCorrectAction?: () => void;
  onErrorAction?: () => void;
}

interface Dot {
  id: string;
  color: 'red' | 'blue';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function PitagorasModel({ reto, onCorrectAction, onErrorAction }: PitagorasModelProps) {
  const [answer, setAnswer] = useState('');
  const [appState, setAppState] = useState<'playing' | 'error' | 'success'>('playing');
  const [dots, setDots] = useState<Dot[]>([]);
  const [animate, setAnimate] = useState(false);

  const { a, b, c } = reto.valores;
  const a2 = a * a;
  const b2 = b * b;
  const c2 = c * c;

  // SVG canvas dimensions
  const W_view = 550;
  const H_view = 450;

  // Bounding box size: width = (b + 2a)*s, height = (a + 2b)*s
  // We want to fit it inside 400x320
  const scale = Math.min(400 / (b + 2 * a), 320 / (a + 2 * b));

  // Right angle coordinates (C_right)
  const X_right = ((W_view - (b + 2 * a) * scale) / 2) + a * scale;
  const Y_right = ((H_view - (a + 2 * b) * scale) / 2) + (a + b) * scale;

  // Triangle vertices
  const A = { x: X_right, y: Y_right - a * scale };
  const B = { x: X_right + b * scale, y: Y_right };
  const C_right = { x: X_right, y: Y_right };

  // Hypotenuse square coordinates (outward)
  const A_prime = { x: A.x + a * scale, y: A.y - b * scale };
  const B_prime = { x: B.x + a * scale, y: B.y - b * scale };

  useEffect(() => {
    // Generate dots
    const tempDots: Dot[] = [];

    // Red dots (a^2) inside red square (extending left)
    // x range: [X_right - a*scale, X_right], y range: [Y_right - a*scale, Y_right]
    let dotId = 0;
    for (let row = 0; row < a; row++) {
      for (let col = 0; col < a; col++) {
        const startX = X_right - a * scale + (col + 0.5) * scale;
        const startY = Y_right - a * scale + (row + 0.5) * scale;

        // End position in hypotenuse square (index = dotId)
        const idx = dotId;
        const row_c = Math.floor(idx / c);
        const col_c = idx % c;
        const u_local = (col_c + 0.5) * scale;
        const v_local = (row_c + 0.5) * scale;

        const endX = A.x + u_local * (b / c) + v_local * (a / c);
        const endY = A.y + u_local * (a / c) - v_local * (b / c);

        tempDots.push({
          id: `red-${row}-${col}`,
          color: 'red',
          startX,
          startY,
          endX,
          endY,
        });
        dotId++;
      }
    }

    // Blue dots (b^2) inside blue square (extending down)
    // x range: [X_right, X_right + b*scale], y range: [Y_right, Y_right + b*scale]
    let blueId = 0;
    for (let row = 0; row < b; row++) {
      for (let col = 0; col < b; col++) {
        const startX = X_right + (col + 0.5) * scale;
        const startY = Y_right + (row + 0.5) * scale;

        // End position in hypotenuse square (index = a2 + blueId)
        const idx = a2 + blueId;
        const row_c = Math.floor(idx / c);
        const col_c = idx % c;
        const u_local = (col_c + 0.5) * scale;
        const v_local = (row_c + 0.5) * scale;

        const endX = A.x + u_local * (b / c) + v_local * (a / c);
        const endY = A.y + u_local * (a / c) - v_local * (b / c);

        tempDots.push({
          id: `blue-${row}-${col}`,
          color: 'blue',
          startX,
          startY,
          endX,
          endY,
        });
        blueId++;
      }
    }

    setDots(tempDots);
    setAnimate(false);
    setAppState('playing');
    setAnswer('');
  }, [reto]);

  const handleComprobar = () => {
    const num = parseInt(answer.trim(), 10);
    if (num === c) {
      setAppState('success');
      setAnimate(true);
    } else {
      setAppState('error');
      if (onErrorAction) onErrorAction();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[700px] mx-auto pb-4">
      <div className="w-full bg-white border border-tinta/10 rounded-3xl p-8 flex flex-col items-center shadow-sm">
        <h2 className="text-xl font-bold text-tinta mb-2 text-center">
          {reto.pregunta}
        </h2>
        <p className="text-sm text-slate-500 mb-6 text-center">{reto.pista}</p>

        {/* Input section styled like the design */}
        <div className="flex gap-4 justify-center items-center mb-6">
          <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl text-sm border border-red-200">
            a = {a}
          </span>
          <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-xl text-sm border border-blue-200">
            b = {b}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold text-sm">c =</span>
            <input
              type="number"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (appState === 'error') setAppState('playing');
              }}
              placeholder="?"
              className="w-20 h-10 text-center font-bold text-lg rounded-xl border-2 border-green-logro/30 focus:border-green-logro focus:outline-none transition-all"
              disabled={appState === 'success'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleComprobar();
              }}
            />
          </div>
        </div>

        {/* SVG Drawing of the Pythagorean model */}
        <div className="relative w-full max-w-[550px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 flex justify-center items-center mb-6 shadow-inner">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${W_view} ${H_view}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none"
          >
            {/* 1. Squares on legs */}
            {/* Red square (cateto a) */}
            <rect
              x={X_right - a * scale}
              y={Y_right - a * scale}
              width={a * scale}
              height={a * scale}
              className="stroke-red-500 fill-red-500/5 stroke-2"
            />
            {/* Blue square (cateto b) */}
            <rect
              x={X_right}
              y={Y_right}
              width={b * scale}
              height={b * scale}
              className="stroke-blue-500 fill-blue-500/5 stroke-2"
            />

            {/* 2. Hypotenuse square (rotated) */}
            <polygon
              points={`
                ${A.x},${A.y}
                ${A_prime.x},${A_prime.y}
                ${B_prime.x},${B_prime.y}
                ${B.x},${B.y}
              `}
              className="stroke-green-500 fill-green-500/5 stroke-2"
            />

            {/* 3. Right Triangle (center) */}
            <polygon
              points={`
                ${A.x},${A.y}
                ${B.x},${B.y}
                ${C_right.x},${C_right.y}
              `}
              className="fill-slate-700/60 stroke-slate-500 stroke-1"
            />

            {/* 4. Labels */}
            <text
              x={X_right - a * scale - 12}
              y={Y_right - (a * scale) / 2 + 4}
              className="fill-red-400 font-bold text-xs font-mono"
              textAnchor="end"
            >
              a² = {a2}
            </text>
            <text
              x={X_right + (b * scale) / 2}
              y={Y_right + b * scale + 20}
              className="fill-blue-400 font-bold text-xs font-mono"
              textAnchor="middle"
            >
              b² = {b2}
            </text>
            <text
              x={(A_prime.x + B_prime.x) / 2 + 10}
              y={(A_prime.y + B_prime.y) / 2 - 10}
              className="fill-green-400 font-bold text-xs font-mono"
              textAnchor="middle"
            >
              c² = {c2}
            </text>

            {/* 5. Animated Dots */}
            {dots.map((dot) => {
              const cx = animate ? dot.endX : dot.startX;
              const cy = animate ? dot.endY : dot.startY;
              const fill = dot.color === 'red' ? '#EF4444' : '#3B82F6';

              return (
                <circle
                  key={dot.id}
                  cx={cx}
                  cy={cy}
                  r={Math.max(2, scale * 0.15)}
                  fill={fill}
                  className="transition-all duration-1000 ease-in-out"
                />
              );
            })}
          </svg>
        </div>

        {appState === 'error' && (
          <div className="bg-[#FDF1DC] border border-amber-revisar/40 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn w-full mb-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#8A5B10]">Casi lo tienes</p>
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
              disabled={!answer}
              className={`w-full font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 ${
                answer
                  ? 'bg-blue-action hover:bg-blue-action/90 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              Comprobar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
