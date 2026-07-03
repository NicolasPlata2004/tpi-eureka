'use client';

import React, { useState, useRef, useEffect } from 'react';

interface BalanzaProps {
  ecuacion: string;
  mostrarTres: boolean;
  ladoDerecho: string;
  onCorrectAction: () => void;
  resuelto: boolean;
  subtitulo?: string;
}

export default function Balanza({
  ecuacion,
  mostrarTres,
  ladoDerecho,
  onCorrectAction,
  resuelto,
  subtitulo
}: BalanzaProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, y: 0 });

  // Resetear la posición local de arrastre cuando cambia la ecuación
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [ecuacion]);

  const handlePointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (resuelto || !mostrarTres) return;
    setIsDragging(true);
    startRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    // Capturar el puntero para que siga arrastrando fuera del elemento
    dragRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - startRef.current.x;
    const newY = e.clientY - startRef.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragRef.current?.releasePointerCapture(e.pointerId);

    // Validar si se arrastró hacia el lado derecho (platillo derecho)
    // El platillo izquierdo está a la izquierda (~8px a ~188px)
    // El platillo derecho está a la derecha (~292px a ~472px)
    // Así que si la coordenada X relativa es mayor a 180px, consideramos que se soltó en la derecha.
    if (position.x > 160) {
      onCorrectAction();
    } else {
      // Regresar al origen de forma suave
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[480px] h-[220px] bg-white border border-tinta/10 rounded-2xl flex flex-col items-center justify-between p-6 select-none"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl font-semibold tracking-wide font-mono text-tinta">
          {ecuacion}
        </span>
        <span className="text-xs text-slate-500 text-center px-4">
          {subtitulo || (resuelto
            ? '¡Balanza equilibrada! Quitaste 3 de cada lado.'
            : 'La balanza está equilibrada. Despeja x sin romper el equilibrio.')}
        </span>
      </div>

      {/* Estructura de la Balanza en HTML/SVG */}
      <div className="relative w-full h-[120px] mt-4">
        {/* Barra superior de la balanza (brazo) */}
        <div
          style={{ transform: `translateX(-50%) rotate(${isDragging ? -4 : 0}deg)` }}
          className="absolute left-1/2 top-[12px] w-[340px] h-[6px] rounded bg-tinta origin-center transition-transform duration-300 ease-out"
        />

        {/* Eje central */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-action border-2 border-white shadow" />
        <div className="absolute left-1/2 top-[15px] -translate-x-1/2 w-[10px] h-[80px] bg-tinta rounded-t" />
        <div className="absolute left-1/2 top-[92px] -translate-x-1/2 w-[110px] h-[8px] bg-tinta rounded" />

        {/* Hilo Izquierdo */}
        <div
          style={{ transform: `translateY(${isDragging ? -12 : 0}px)` }}
          className="absolute left-[70px] top-[15px] w-[1.5px] h-[34px] bg-slate-500 transition-transform duration-300 ease-out"
        />
        {/* Platillo Izquierdo */}
        <div
          style={{ transform: `translateY(${isDragging ? -12 : 0}px)` }}
          className={`absolute left-[15px] top-[48px] w-[112px] h-[44px] rounded-b-2xl bg-bg-soft2 border-2 border-blue-action flex items-center justify-center gap-1 transition-transform duration-300 ease-out`}
        >
          <span className="bg-white border border-blue-action/40 rounded-md px-2 py-0.5 text-sm font-semibold font-mono text-blue-action">
            2x
          </span>

          {mostrarTres && (
            <span
              ref={dragRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                touchAction: 'none'
              }}
              className={`bg-white border-2 border-blue-action rounded-md px-2 py-0.5 text-sm font-bold font-mono text-blue-action cursor-grab active:cursor-grabbing shadow-sm select-none z-10 ${
                isDragging ? 'scale-110 shadow-md ring-2 ring-blue-action/30' : ''
              }`}
            >
              +3
            </span>
          )}
        </div>

        {/* Hilo Derecho */}
        <div
          style={{ transform: `translateY(${isDragging ? 12 : 0}px)` }}
          className="absolute right-[70px] top-[15px] w-[1.5px] h-[34px] bg-slate-500 transition-transform duration-300 ease-out"
        />
        {/* Platillo Derecho */}
        <div
          style={{ transform: `translateY(${isDragging ? 12 : 0}px)` }}
          className={`absolute right-[15px] top-[48px] w-[112px] h-[44px] rounded-b-2xl bg-[#DDF0E5] border-2 border-green-logro flex items-center justify-center transition-transform duration-300 ease-out`}
        >
          <span className="bg-white border border-green-logro/40 rounded-md px-3 py-0.5 text-sm font-semibold font-mono text-green-logro">
            {ladoDerecho}
          </span>
        </div>
      </div>

      {!resuelto && (
        <span className="text-[10px] text-slate-400 font-mono">
          [ Arrastra la ficha +3 hacia el platillo derecho ]
        </span>
      )}
    </div>
  );
}
