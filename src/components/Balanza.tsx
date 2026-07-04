'use client';

import React, { useState, useRef, useEffect } from 'react';

interface BalanzaProps {
  ecuacion: string;
  mostrarTres: boolean;
  ladoDerecho: string;
  onCorrectAction: () => void;
  resuelto: boolean;
  subtitulo?: string;
  fichaValor?: string;
  terminoIzquierdo?: string;
}

export default function Balanza({
  ecuacion,
  mostrarTres,
  ladoDerecho,
  onCorrectAction,
  resuelto,
  subtitulo,
  fichaValor = '+3',
  terminoIzquierdo = '2x'
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
    if (position.x > 160) {
      onCorrectAction();
    } else {
      // Regresar al origen de forma suave
      setPosition({ x: 0, y: 0 });
    }
  };

  // --- CÁLCULO FÍSICO Y TRIGONOMÉTRICO DE INCLINACIÓN ---
  // Distancia euclidiana del arrastre actual
  const dragDistance = Math.sqrt(position.x * position.x + position.y * position.y);
  // Progreso de la inclinación (máximo a los 100px de arrastre)
  const dragProgress = Math.min(1, dragDistance / 100);
  
  // Estado de inclinación: 0 si está resuelto, proporcional si está arrastrando
  const tiltProgress = resuelto ? 0 : (isDragging ? dragProgress : 0);
  
  // Ángulo de rotación del brazo (máximo 6.5 grados)
  // Ángulo de rotación del brazo (máximo 6.5 grados, positivo para rotación horaria)
  const rotation = tiltProgress * 6.5; 
  
  // Conversión a radianes para cálculo trigonométrico
  const rad = (rotation * Math.PI) / 180;
  
  // Desplazamiento vertical exacto en los extremos del brazo de 340px (mitad = 170px)
  const leftPanY = -170 * Math.sin(rad); // Sube (negativo)
  const rightPanY = 170 * Math.sin(rad);  // Baja (positivo)

  // Efecto spring de rebote orgánico para transiciones cuando regresa a equilibrio
  const springTransition = isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

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
          style={{ 
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transition: springTransition
          }}
          className="absolute left-1/2 top-[12px] w-[340px] h-[6px] rounded bg-tinta origin-center"
        />

        {/* Eje central */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-action border-2 border-white shadow" />
        <div className="absolute left-1/2 top-[15px] -translate-x-1/2 w-[10px] h-[80px] bg-tinta rounded-t" />
        <div className="absolute left-1/2 top-[92px] -translate-x-1/2 w-[110px] h-[8px] bg-tinta rounded" />

        {/* Hilo Izquierdo */}
        <div
          style={{ 
            transform: `translateY(${leftPanY}px)`,
            transition: springTransition
          }}
          className="absolute left-[70px] top-[15px] w-[1.5px] h-[34px] bg-slate-500"
        />
        {/* Platillo Izquierdo */}
        <div
          style={{ 
            transform: `translateY(${leftPanY}px)`,
            transition: springTransition
          }}
          className="absolute left-[15px] top-[48px] w-[112px] h-[44px] rounded-b-2xl bg-bg-soft2 border-2 border-blue-action flex items-center justify-center gap-1"
        >
          <span className="bg-white border border-blue-action/40 rounded-md px-2 py-0.5 text-sm font-semibold font-mono text-blue-action">
            {terminoIzquierdo}
          </span>

          {mostrarTres && (
            <span
              ref={dragRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                // Descontamos la traslación vertical del platillo izquierdo para que no salte bajo el mouse
                transform: `translate(${position.x}px, ${isDragging ? position.y - leftPanY : 0}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                touchAction: 'none'
              }}
              className={`bg-white border-2 border-blue-action rounded-md px-2 py-0.5 text-sm font-bold font-mono text-blue-action cursor-grab active:cursor-grabbing shadow-sm select-none z-10 ${
                isDragging ? 'scale-110 shadow-md ring-2 ring-blue-action/30' : ''
              }`}
            >
              {fichaValor}
            </span>
          )}
        </div>

        {/* Hilo Derecho */}
        <div
          style={{ 
            transform: `translateY(${rightPanY}px)`,
            transition: springTransition
          }}
          className="absolute right-[70px] top-[15px] w-[1.5px] h-[34px] bg-slate-500"
        />
        {/* Platillo Derecho */}
        <div
          style={{ 
            transform: `translateY(${rightPanY}px)`,
            transition: springTransition
          }}
          className="absolute right-[15px] top-[48px] w-[112px] h-[44px] rounded-b-2xl bg-[#DDF0E5] border-2 border-green-logro flex items-center justify-center"
        >
          <span className="bg-white border border-green-logro/40 rounded-md px-3 py-0.5 text-sm font-semibold font-mono text-green-logro">
            {ladoDerecho}
          </span>
        </div>
      </div>

      {!resuelto && (
        <span className="text-[10px] text-slate-400 font-mono">
          [ Arrastra la ficha {fichaValor} hacia el platillo derecho ]
        </span>
      )}
    </div>
  );
}
