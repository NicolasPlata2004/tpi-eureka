'use client';

import React, { useState, useEffect } from 'react';
import { InlineMath } from 'react-katex';

interface LadderModelProps {
  reto: any;
  onCorrectAction?: () => void;
  onErrorAction?: () => void;
}

export default function LadderModel({ reto, onCorrectAction, onErrorAction }: LadderModelProps) {
  const [answer, setAnswer] = useState('');
  const [appState, setAppState] = useState<'playing' | 'error' | 'success'>('playing');
  const [animationState, setAnimationState] = useState<'idle' | 'climbing_success' | 'climbing_fail' | 'ladder_slip'>('idle');

  const { a, b, c } = reto.valores;

  // SVG dimensions
  const W_view = 550;
  const H_view = 350;

  // Scale based on values (make sure the wall and ground base fit)
  const scale = Math.min(220 / a, 220 / b);

  // Position coordinates
  const wallX = 420;
  const groundY = 280;

  const baseLineX = wallX - a * scale;
  const topWallY = groundY - b * scale;

  // Animate values
  const [t, setT] = useState(0); // position along ladder (0 to 1)
  const [topY, setTopY] = useState(topWallY);
  const [topX, setTopX] = useState(wallX);
  const [charYOffset, setCharYOffset] = useState(-15);
  const [charRotation, setCharRotation] = useState(0);

  useEffect(() => {
    // Reset state on new question
    setAnswer('');
    setAppState('playing');
    setAnimationState('idle');
    setT(0);
    setTopY(topWallY);
    setTopX(wallX);
    setCharYOffset(-15);
    setCharRotation(0);
  }, [reto]);

  const handleComprobar = () => {
    const num = parseInt(answer.trim(), 10);
    if (num === c) {
      setAppState('success');
      setAnimationState('climbing_success');

      // Animate climbing to the top
      let start: number | null = null;
      const duration = 1800;

      const animateClimb = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        setT(progress);

        if (progress < 1) {
          requestAnimationFrame(animateClimb);
        } else {
          setTimeout(() => {
            if (onCorrectAction) onCorrectAction();
          }, 500);
        }
      };
      requestAnimationFrame(animateClimb);
    } else {
      setAppState('error');
      setAnimationState('climbing_fail');

      // Animate climb halfway, then slip and fall
      let start: number | null = null;
      const durationHalf = 800;

      const animateHalf = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / durationHalf, 1);

        setT(progress * 0.5); // climb to 0.5

        if (progress < 1) {
          requestAnimationFrame(animateHalf);
        } else {
          // Ladder slips!
          setAnimationState('ladder_slip');
          let slipStart: number | null = null;
          const durationSlip = 600;

          const animateSlip = (slipTimestamp: number) => {
            if (!slipStart) slipStart = slipTimestamp;
            const slipElapsed = slipTimestamp - slipStart;
            const slipProgress = Math.min(slipElapsed / durationSlip, 1);

            // Ladder top falls to the ground
            setTopY(topWallY + (groundY - topWallY) * slipProgress);
            setTopX(wallX - (a * scale * 0.3) * slipProgress); // slide left slightly

            // Character falls off ladder to the ground
            setT(0.5 - 0.5 * slipProgress);
            setCharYOffset(-15 + (groundY - (topWallY + (groundY - topWallY) * 0.5)) * slipProgress);
            setCharRotation(180 * slipProgress);

            if (slipProgress < 1) {
              requestAnimationFrame(animateSlip);
            } else {
              if (onErrorAction) onErrorAction();
            }
          };
          requestAnimationFrame(animateSlip);
        }
      };
      requestAnimationFrame(animateHalf);
    }
  };

  // Calculate current ladder coordinates
  const currentTopX = topX;
  const currentTopY = topY;

  // Calculate character position
  const charX = baseLineX + t * (currentTopX - baseLineX);
  const charY = groundY + t * (currentTopY - groundY) + charYOffset;

  // Ladder rungs (10 rungs evenly spaced)
  const rungs = [];
  const numRungs = 8;
  for (let i = 1; i < numRungs; i++) {
    const ratio = i / numRungs;
    const rx1 = baseLineX + ratio * (currentTopX - baseLineX);
    const ry1 = groundY + ratio * (currentTopY - groundY);
    // Draw perpendicular rung offset
    const dx = currentTopX - baseLineX;
    const dy = currentTopY - groundY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const px = (-dy / len) * 6;
    const py = (dx / len) * 6;

    rungs.push({
      x1: rx1 - px,
      y1: ry1 - py,
      x2: rx1 + px,
      y2: ry1 + py,
    });
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[700px] mx-auto pb-4">
      <div className="w-full bg-white border border-tinta/10 rounded-3xl p-8 flex flex-col items-center shadow-sm">
        <h2 className="text-xl font-bold text-tinta mb-2 text-center">
          {reto.pregunta}
        </h2>
        <p className="text-sm text-slate-500 mb-6 text-center">{reto.pista}</p>

        {/* Input variables */}
        <div className="flex gap-4 justify-center items-center mb-6">
          <span className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm border border-slate-200">
            Distancia base (a) = {a} m
          </span>
          <span className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm border border-slate-200">
            Altura pared (b) = {b} m
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold text-sm">Longitud escalera (c) =</span>
            <input
              type="number"
              value={answer}
              onChange={(e) => {
                if (animationState !== 'idle') return;
                setAnswer(e.target.value);
                if (appState === 'error') {
                  setAppState('playing');
                  setAnimationState('idle');
                  setT(0);
                  setTopY(topWallY);
                  setTopX(wallX);
                  setCharYOffset(-15);
                  setCharRotation(0);
                }
              }}
              placeholder="?"
              className="w-20 h-10 text-center font-bold text-lg rounded-xl border-2 border-blue-action/30 focus:border-blue-action focus:outline-none transition-all"
              disabled={appState === 'success' || animationState !== 'idle'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleComprobar();
              }}
            />
          </div>
        </div>

        {/* Interactive SVG visualization */}
        <div className="relative w-full max-w-[550px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 flex justify-center items-center mb-6 shadow-inner">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${W_view} ${H_view}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none"
          >
            {/* Ground line */}
            <line
              x1="30"
              y1={groundY}
              x2="520"
              y2={groundY}
              className="stroke-slate-600 stroke-2"
            />
            {/* Ground grid lines */}
            <line
              x1={baseLineX}
              y1={groundY}
              x2={wallX}
              y2={groundY}
              className="stroke-amber-500/40 stroke-[3] stroke-dasharray-[4,4]"
              strokeDasharray="4 4"
            />

            {/* Wall */}
            <rect
              x={wallX}
              y="40"
              width="35"
              height={groundY - 40}
              className="fill-slate-700 stroke-slate-600 stroke-2"
              rx="2"
            />
            {/* Brick pattern lines on wall */}
            <line x1={wallX} y1="90" x2={wallX + 35} y2="90" className="stroke-slate-600 stroke-1" />
            <line x1={wallX} y1="140" x2={wallX + 35} y2="140" className="stroke-slate-600 stroke-1" />
            <line x1={wallX} y1="190" x2={wallX + 35} y2="190" className="stroke-slate-600 stroke-1" />
            <line x1={wallX} y1="240" x2={wallX + 35} y2="240" className="stroke-slate-600 stroke-1" />

            {/* Right angle indicator */}
            <rect
              x={wallX - 12}
              y={groundY - 12}
              width="12"
              height="12"
              className="stroke-slate-500/50 stroke-1 fill-none"
            />
            <circle cx={wallX - 6} cy={groundY - 6} r="1.5" className="fill-slate-500/50" />

            {/* Ladder rails */}
            {/* Left rail */}
            <line
              x1={baseLineX - 4}
              y1={groundY}
              x2={currentTopX - 4}
              y2={currentTopY}
              className="stroke-amber-700 stroke-[5]"
              strokeLinecap="round"
            />
            {/* Right rail */}
            <line
              x1={baseLineX + 4}
              y1={groundY}
              x2={currentTopX + 4}
              y2={currentTopY}
              className="stroke-amber-700 stroke-[5]"
              strokeLinecap="round"
            />

            {/* Ladder rungs */}
            {rungs.map((rung, index) => (
              <line
                key={index}
                x1={rung.x1}
                y1={rung.y1}
                x2={rung.x2}
                y2={rung.y2}
                className="stroke-amber-600 stroke-[3]"
              />
            ))}

            {/* Helper measurement tags */}
            {/* base tag a */}
            <text
              x={(baseLineX + wallX) / 2}
              y={groundY + 25}
              className="fill-slate-400 font-bold text-xs font-mono"
              textAnchor="middle"
            >
              a = {a} m
            </text>
            <path
              d={`M ${baseLineX} ${groundY + 12} L ${wallX} ${groundY + 12}`}
              className="stroke-slate-500 stroke-1 marker-start-[url(#arrow)] marker-end-[url(#arrow)]"
              strokeDasharray="3 3"
            />

            {/* height tag b */}
            <text
              x={wallX + 50}
              y={(groundY + topWallY) / 2}
              className="fill-slate-400 font-bold text-xs font-mono"
              textAnchor="start"
            >
              b = {b} m
            </text>

            {/* hypotenuse tag c */}
            <text
              x={(baseLineX + currentTopX) / 2 - 25}
              y={(groundY + currentTopY) / 2 - 15}
              className="fill-blue-400 font-bold text-sm font-mono"
              textAnchor="end"
            >
              c = ?
            </text>

            {/* Climber Character (Emoji) */}
            <text
              x={charX}
              y={charY}
              className="text-2xl select-none"
              textAnchor="middle"
              transform={`rotate(${charRotation} ${charX} ${charY})`}
              style={{ transition: 'transform 0.1s ease-out' }}
            >
              {animationState === 'ladder_slip' ? '💥' : animationState === 'climbing_success' ? '🧗' : '🏃'}
            </text>
          </svg>
        </div>

        {appState === 'error' && animationState === 'ladder_slip' && (
          <div className="bg-[#FDF1DC] border border-amber-revisar/40 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn w-full mb-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#8A5B10]">¡Oh no, se cayó la escalera! 😱</p>
              <p className="text-xs text-[#7A5310] leading-relaxed">{reto.pista}</p>
            </div>
          </div>
        )}

        <div className="w-full">
          {appState === 'success' && animationState === 'climbing_success' && t >= 1 ? (
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
          ) : (
            <button
              onClick={handleComprobar}
              disabled={!answer || animationState !== 'idle'}
              className={`w-full font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 ${
                answer && animationState === 'idle'
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
