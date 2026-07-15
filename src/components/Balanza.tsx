'use client';

import React, { useState, useRef, useEffect } from 'react';

type ItemType = 'box' | 'ball';
type Side = 'left' | 'right' | 'table';

interface Item {
  id: string;
  type: ItemType;
  side: Side;
}

type AppState = 'playing' | 'error_tilt' | 'error_mixed' | 'error_not_isolated' | 'success';

interface BalanzaProps {
  onCorrectAction?: () => void;
  resuelto?: boolean;
}

export default function Balanza({ onCorrectAction, resuelto }: BalanzaProps) {
  const [equation, setEquation] = useState({ a: 2, b: 2, c: 8, x: 3 });
  const [items, setItems] = useState<Item[]>([]);
  const [appState, setAppState] = useState<AppState>('playing');
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  // Generar nueva ecuación
  const generateEquation = () => {
    const x = Math.floor(Math.random() * 4) + 2; // 2 to 5
    const a = Math.floor(Math.random() * 3) + 1; // 1 to 3
    const b = Math.floor(Math.random() * 6) + 1; // 1 to 6
    const c = a * x + b;
    setEquation({ a, b, c, x });
    
    const newItems: Item[] = [];
    for(let i = 0; i < a; i++) newItems.push({ id: `box-L${i}-${Date.now()}`, type: 'box', side: 'left' });
    for(let i = 0; i < b; i++) newItems.push({ id: `ball-L${i}-${Date.now()}`, type: 'ball', side: 'left' });
    for(let i = 0; i < c; i++) newItems.push({ id: `ball-R${i}-${Date.now()}`, type: 'ball', side: 'right' });
    setItems(newItems);
    setAppState('playing');
  };

  useEffect(() => {
    if (items.length === 0) {
      generateEquation();
    }
  }, []);

  // Calcular pesos
  const leftWeight = items.filter(i => i.side === 'left').reduce((acc, curr) => acc + (curr.type === 'box' ? equation.x : 1), 0);
  const rightWeight = items.filter(i => i.side === 'right').reduce((acc, curr) => acc + (curr.type === 'box' ? equation.x : 1), 0);
  
  const diff = rightWeight - leftWeight;
  const rotation = Math.max(-15, Math.min(15, diff * 4)); 
  const rad = (rotation * Math.PI) / 180;
  const leftPanY = -170 * Math.sin(rad); 
  const rightPanY = 170 * Math.sin(rad);  

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, item: Item) => {
    if (appState === 'success') return;
    setDraggedItemId(item.id);
    setStartPos({ x: e.clientX, y: e.clientY });
    setPointerPos({ x: 0, y: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
    if (appState !== 'playing') setAppState('playing'); // reset error states
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedItemId) return;
    setPointerPos({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, item: Item) => {
    if (!draggedItemId) return;
    setDraggedItemId(null);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    
    // Determinar zona de drop
    // Mesa: Y > 240
    // Izquierda: Y < 240, X < 250
    // Derecha: Y < 240, X >= 250
    let targetSide: Side = 'table';
    if (relativeY < 240) {
      targetSide = relativeX < rect.width / 2 ? 'left' : 'right';
    }

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, side: targetSide } : i));
  };

  const handleComprobar = () => {
    if (leftWeight !== rightWeight) {
      setAppState('error_tilt');
      return;
    }
    const leftBoxes = items.filter(i => i.side === 'left' && i.type === 'box').length;
    const rightBoxes = items.filter(i => i.side === 'right' && i.type === 'box').length;
    const leftBalls = items.filter(i => i.side === 'left' && i.type === 'ball').length;
    const rightBalls = items.filter(i => i.side === 'right' && i.type === 'ball').length;

    const leftIsIsolated = leftBoxes > 0 && leftBalls === 0 && rightBalls > 0 && rightBoxes === 0;
    const rightIsIsolated = rightBoxes > 0 && rightBalls === 0 && leftBalls > 0 && leftBoxes === 0;

    if (leftIsIsolated || rightIsIsolated) {
      const boxesCount = leftIsIsolated ? leftBoxes : rightBoxes;
      if (boxesCount === 1) {
        setAppState('success');
      } else {
        setAppState('error_not_isolated');
      }
    } else {
      setAppState('error_mixed');
    }
  };

  const springTransition = draggedItemId ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  const renderItem = (item: Item, absolutePositioning: boolean = false) => {
    const isDragging = draggedItemId === item.id;
    const transform = isDragging ? `translate(${pointerPos.x}px, ${pointerPos.y}px) scale(1.2)` : 'translate(0px, 0px) scale(1)';
    const zIndex = isDragging ? 50 : 10;
    const cursor = isDragging ? 'grabbing' : 'grab';

    const baseClass = absolutePositioning ? "relative" : "";

    if (item.type === 'box') {
      return (
        <div
          key={item.id}
          onPointerDown={(e) => handlePointerDown(e, item)}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => handlePointerUp(e, item)}
          style={{ transform, zIndex, cursor, touchAction: 'none' }}
          className={`${baseClass} w-8 h-8 bg-blue-100 border-2 border-blue-500 rounded flex items-center justify-center font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-200`}
        >
          x
        </div>
      );
    } else {
      return (
        <div
          key={item.id}
          onPointerDown={(e) => handlePointerDown(e, item)}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => handlePointerUp(e, item)}
          style={{ transform, zIndex, cursor, touchAction: 'none' }}
          className={`${baseClass} w-6 h-6 bg-orange-100 border-2 border-orange-500 rounded-full flex items-center justify-center font-bold text-[10px] text-orange-700 shadow-sm transition-colors hover:bg-orange-200`}
        >
          1
        </div>
      );
    }
  };

  const leftItems = items.filter(i => i.side === 'left');
  const rightItems = items.filter(i => i.side === 'right');
  const tableItems = items.filter(i => i.side === 'table');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[600px] mx-auto pb-4">
      
      {/* Caja Principal del Simulador */}
      <div
        ref={containerRef}
        className="relative w-full h-[460px] bg-white border border-tinta/10 rounded-3xl flex flex-col items-center justify-start p-6 select-none overflow-hidden shadow-sm"
      >
        <div className="flex flex-col items-center gap-1 mb-2">
          <span className="text-3xl font-semibold tracking-wide font-mono text-tinta">
            {equation.a}x + {equation.b} = {equation.c}
          </span>
          <span className="text-xs text-slate-500 text-center px-4 h-4">
            Aisla las cajas 'x' en un solo platillo manteniendo el equilibrio.
          </span>
        </div>

        {/* Estructura de la Balanza */}
        <div className="relative w-full h-[150px] mt-4">
          {/* Brazo */}
          <div
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)`, transition: springTransition }}
            className="absolute left-1/2 top-[12px] w-[340px] h-[8px] rounded-full bg-slate-800 origin-center"
          />

          {/* Eje central */}
          <div className="absolute left-1/2 top-[-2px] -translate-x-1/2 w-5 h-5 rounded-full bg-blue-action border-[3px] border-white shadow-md z-10" />
          <div className="absolute left-1/2 top-[15px] -translate-x-1/2 w-[14px] h-[130px] bg-slate-800 rounded-t" />
          <div className="absolute left-1/2 top-[140px] -translate-x-1/2 w-[140px] h-[12px] bg-slate-800 rounded-full shadow-sm" />

          {/* Platillo Izquierdo */}
          <div
            style={{ transform: `translateY(${leftPanY}px)`, transition: springTransition }}
            className="absolute left-[30px] top-[15px] flex flex-col items-center"
          >
            <div className="w-[2px] h-[50px] bg-slate-400" />
            <div className="w-[130px] min-h-[60px] rounded-b-3xl bg-slate-50 border-[3px] border-slate-300 flex flex-wrap content-end justify-center gap-1.5 p-3 pb-4 shadow-inner">
              {leftItems.map(item => renderItem(item))}
            </div>
            <div className={`mt-2 text-xs font-bold font-mono transition-colors ${leftWeight === rightWeight ? 'text-green-600' : 'text-red-500'}`}>
              Peso: {leftWeight}
            </div>
          </div>

          {/* Platillo Derecho */}
          <div
            style={{ transform: `translateY(${rightPanY}px)`, transition: springTransition }}
            className="absolute right-[30px] top-[15px] flex flex-col items-center"
          >
            <div className="w-[2px] h-[50px] bg-slate-400" />
            <div className="w-[130px] min-h-[60px] rounded-b-3xl bg-slate-50 border-[3px] border-slate-300 flex flex-wrap content-end justify-center gap-1.5 p-3 pb-4 shadow-inner">
              {rightItems.map(item => renderItem(item))}
            </div>
            <div className={`mt-2 text-xs font-bold font-mono transition-colors ${leftWeight === rightWeight ? 'text-green-600' : 'text-red-500'}`}>
              Peso: {rightWeight}
            </div>
          </div>
        </div>

        {/* Zona de Mesa (Abajo) */}
        <div className="absolute bottom-0 left-0 w-full min-h-[110px] bg-yellow-50/60 border-t-2 border-yellow-100 flex flex-col items-center justify-start p-3 z-0">
          <span className="text-[10px] font-bold text-yellow-600 mb-2 uppercase tracking-wider">Mesa de Trabajo</span>
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full px-4 relative z-10">
            {tableItems.map(item => renderItem(item, true))}
            {tableItems.length === 0 && <span className="text-xs text-yellow-500/50 italic mt-2">Arrastra piezas aquí</span>}
          </div>
        </div>
      </div>

      {/* Panel de Control y Feedback */}
      <div className="w-full flex flex-col gap-4">
        {appState === 'error_tilt' && (
          <div className="bg-[#FDF1DC] border border-amber-revisar/40 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8A5B10] flex-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#8A5B10]">La balanza está inclinada</p>
              <p className="text-xs text-[#7A5310] leading-relaxed">Recuerda: lo que quitas de un lado, debes quitarlo exactamente igual del otro lado para mantener el equilibrio.</p>
            </div>
          </div>
        )}

        {appState === 'error_mixed' && (
          <div className="bg-[#FDF1DC] border border-amber-revisar/40 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8A5B10] flex-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#8A5B10]">Aún no hemos terminado</p>
              <p className="text-xs text-[#7A5310] leading-relaxed">El objetivo es dejar las cajas 'x' solas en un platillo, sin bolitas que las acompañen.</p>
            </div>
          </div>
        )}

        {appState === 'error_not_isolated' && (
          <div className="bg-[#FDF1DC] border border-amber-revisar/40 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8A5B10] flex-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#8A5B10]">Casi, pero aún no tienes el valor de 1 sola x</p>
              <p className="text-xs text-[#7A5310] leading-relaxed">Has aislado las cajas, ¡muy bien! Pero tienes más de una caja en el platillo. Para encontrar el valor de 'x', debes dejar **UNA SOLA** caja, dividiendo (retirando cajas y su equivalente en bolitas hacia la mesa).</p>
            </div>
          </div>
        )}

        {appState === 'success' && (
          <div className="bg-[#DDF0E5] border border-green-logro/30 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-logro flex-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-green-logro">¡Excelente trabajo!</p>
              <p className="text-xs text-[#1F6B44] leading-relaxed">Has despejado la variable manteniendo la ecuación perfectamente equilibrada.</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {appState === 'success' || resuelto ? (
            <button
              onClick={() => {
                if (solvedCount >= 2 && onCorrectAction) {
                  onCorrectAction();
                } else {
                  setSolvedCount(prev => prev + 1);
                  generateEquation();
                }
              }}
              className="flex-1 bg-green-logro hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{solvedCount >= 2 ? 'Terminar Reto' : 'Siguiente Ecuación'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleComprobar}
              className="flex-1 bg-blue-action hover:bg-blue-action/90 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
            >
              Comprobar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
