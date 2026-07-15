'use client';

import React, { useState, useRef, useEffect } from 'react';

interface BalanzaProps {
  onCorrectAction: () => void;
  resuelto: boolean;
  subtitulo?: string;
}

type ItemType = 'box' | 'ball';
type Side = 'left' | 'right' | 'trash';

interface Item {
  id: string;
  type: ItemType;
  side: Side;
}

const INITIAL_ITEMS: Item[] = [
  { id: 'box-L1', type: 'box', side: 'left' },
  { id: 'box-L2', type: 'box', side: 'left' },
  { id: 'ball-L1', type: 'ball', side: 'left' },
  { id: 'ball-L2', type: 'ball', side: 'left' },
  { id: 'ball-L3', type: 'ball', side: 'left' },
  { id: 'ball-L4', type: 'ball', side: 'left' },
  { id: 'ball-L5', type: 'ball', side: 'left' },
  
  { id: 'ball-R1', type: 'ball', side: 'right' },
  { id: 'ball-R2', type: 'ball', side: 'right' },
  { id: 'ball-R3', type: 'ball', side: 'right' },
  { id: 'ball-R4', type: 'ball', side: 'right' },
  { id: 'ball-R5', type: 'ball', side: 'right' },
  { id: 'ball-R6', type: 'ball', side: 'right' },
  { id: 'ball-R7', type: 'ball', side: 'right' },
  { id: 'ball-R8', type: 'ball', side: 'right' },
];

export default function Balanza({
  onCorrectAction,
  resuelto,
  subtitulo,
}: BalanzaProps) {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate weights
  const leftWeight = items.filter(i => i.side === 'left').reduce((acc, curr) => acc + (curr.type === 'box' ? 1.5 : 1), 0);
  const rightWeight = items.filter(i => i.side === 'right').reduce((acc, curr) => acc + (curr.type === 'box' ? 1.5 : 1), 0);
  
  // Diff > 0 means right is heavier (tilts right)
  const diff = rightWeight - leftWeight;
  const rotation = Math.max(-15, Math.min(15, diff * 4)); // Max 15 degrees tilt
  
  const rad = (rotation * Math.PI) / 180;
  const leftPanY = -170 * Math.sin(rad); 
  const rightPanY = 170 * Math.sin(rad);  

  useEffect(() => {
    // Check win condition:
    // Left: 2 boxes, 0 balls
    // Right: 3 balls
    // Balance: Equal
    const leftBoxes = items.filter(i => i.side === 'left' && i.type === 'box').length;
    const leftBalls = items.filter(i => i.side === 'left' && i.type === 'ball').length;
    const rightBalls = items.filter(i => i.side === 'right' && i.type === 'ball').length;
    
    if (leftBoxes === 2 && leftBalls === 0 && rightBalls === 3 && leftWeight === rightWeight && !resuelto) {
      onCorrectAction();
    }
  }, [items, leftWeight, rightWeight, resuelto, onCorrectAction]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, item: Item) => {
    if (resuelto) return;
    setDraggedItemId(item.id);
    setStartPos({ x: e.clientX, y: e.clientY });
    setPointerPos({ x: 0, y: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
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
    
    // Check if dropped near the bottom 60px (Trash area)
    const relativeY = e.clientY - rect.top;
    if (relativeY > 240) {
      // Dropped in trash
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, side: 'trash' } : i));
    }
  };

  const springTransition = draggedItemId ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  const renderItem = (item: Item) => {
    if (item.side === 'trash') return null;
    
    const isDragging = draggedItemId === item.id;
    const transform = isDragging ? `translate(${pointerPos.x}px, ${pointerPos.y}px) scale(1.2)` : 'translate(0px, 0px) scale(1)';
    const zIndex = isDragging ? 50 : 10;
    const cursor = isDragging ? 'grabbing' : 'grab';

    if (item.type === 'box') {
      return (
        <div
          key={item.id}
          onPointerDown={(e) => handlePointerDown(e, item)}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => handlePointerUp(e, item)}
          style={{ transform, zIndex, cursor, touchAction: 'none' }}
          className="w-8 h-8 bg-blue-100 border-2 border-blue-500 rounded flex items-center justify-center font-bold text-blue-700 shadow-sm"
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
          className="w-5 h-5 bg-orange-100 border-2 border-orange-500 rounded-full flex items-center justify-center font-bold text-xs text-orange-700 shadow-sm"
        >
          1
        </div>
      );
    }
  };

  const leftItems = items.filter(i => i.side === 'left');
  const rightItems = items.filter(i => i.side === 'right');

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[500px] h-[320px] bg-white border border-tinta/10 rounded-2xl flex flex-col items-center justify-start p-6 select-none overflow-hidden"
    >
      <div className="flex flex-col items-center gap-1 mb-2">
        <span className="text-2xl font-semibold tracking-wide font-mono text-tinta">
          2x + 5 = 8
        </span>
        <span className="text-xs text-slate-500 text-center px-4 h-8">
          {subtitulo || (resuelto
            ? '¡Ecuación resuelta! Mantuvo el equilibrio.'
            : 'Arrastra elementos a la caneca inferior para despejar "x" manteniendo la balanza equilibrada.')}
        </span>
      </div>

      {/* Estructura de la Balanza */}
      <div className="relative w-full h-[140px] mt-2">
        {/* Barra superior (brazo) */}
        <div
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)`, transition: springTransition }}
          className="absolute left-1/2 top-[12px] w-[340px] h-[6px] rounded bg-slate-800 origin-center"
        />

        {/* Eje central */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-action border-2 border-white shadow z-10" />
        <div className="absolute left-1/2 top-[15px] -translate-x-1/2 w-[12px] h-[110px] bg-slate-800 rounded-t" />
        <div className="absolute left-1/2 top-[120px] -translate-x-1/2 w-[120px] h-[10px] bg-slate-800 rounded" />

        {/* Platillo Izquierdo */}
        <div
          style={{ transform: `translateY(${leftPanY}px)`, transition: springTransition }}
          className="absolute left-[20px] top-[15px] flex flex-col items-center"
        >
          <div className="w-[1.5px] h-[40px] bg-slate-400" />
          <div className="w-[120px] min-h-[50px] rounded-b-2xl bg-slate-100 border-2 border-slate-400 flex flex-wrap content-end justify-center gap-1 p-2 pb-3 shadow-inner">
            {leftItems.map(item => renderItem(item))}
          </div>
          {/* Indicador visual de peso */}
          <div className={`mt-1 text-xs font-bold font-mono transition-colors ${leftWeight === rightWeight ? 'text-green-600' : 'text-red-500'}`}>
            Peso: {leftWeight}
          </div>
        </div>

        {/* Platillo Derecho */}
        <div
          style={{ transform: `translateY(${rightPanY}px)`, transition: springTransition }}
          className="absolute right-[20px] top-[15px] flex flex-col items-center"
        >
          <div className="w-[1.5px] h-[40px] bg-slate-400" />
          <div className="w-[120px] min-h-[50px] rounded-b-2xl bg-slate-100 border-2 border-slate-400 flex flex-wrap content-end justify-center gap-1 p-2 pb-3 shadow-inner">
            {rightItems.map(item => renderItem(item))}
          </div>
          {/* Indicador visual de peso */}
          <div className={`mt-1 text-xs font-bold font-mono transition-colors ${leftWeight === rightWeight ? 'text-green-600' : 'text-red-500'}`}>
            Peso: {rightWeight}
          </div>
        </div>
      </div>

      {/* Zona de Basura (Caneca) */}
      <div className="absolute bottom-0 left-0 w-full h-[60px] bg-red-50/50 border-t border-red-100 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        <span className="text-sm font-semibold text-red-400">Caneca (arrastra aquí para eliminar)</span>
      </div>
    </div>
  );
}
