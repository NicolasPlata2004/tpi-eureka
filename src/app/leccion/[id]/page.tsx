'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Leccion {
  id: string;
  titulo: string;
  unidadId: string;
  videoUrl: string;
  duracion: string;
  ideasClave: string[];
  concepto: string;
  conceptoDetalle: string;
}

interface Reto {
  id: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LeccionPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [retos, setRetos] = useState<Reto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del reproductor de video
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5>(1);
  const [showCC, setShowCC] = useState(true);

  useEffect(() => {
    async function fetchLeccion() {
      try {
        const res = await fetch(`/api/leccion/${id}`);
        if (!res.ok) {
          router.push('/dashboard');
          return;
        }
        const data = await res.json();
        setLeccion(data.leccion);
        setRetos(data.retos);
      } catch (err) {
        console.error('Error fetching lesson:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeccion();
  }, [id, router]);

  // Simulación de progreso de video
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + (speed === 1.5 ? 1.5 : 1);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-action border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-500">Cargando lección...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!leccion) return null;

  // Formatear tiempo de simulación
  const totalSegundos = 340; // 5:40
  const segundosActuales = Math.floor((progress / 100) * totalSegundos);
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIrReto = () => {
    if (retos.length > 0) {
      router.push(`/reto/${retos[0].id}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft1 flex flex-col select-none text-left">
      <Header />
      
      {/* Header secundario de navegación de lección */}
      <div className="bg-white border-b border-tinta/8 w-full py-3.5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 border border-tinta/10 hover:bg-bg-soft1 rounded-xl flex items-center justify-center font-bold text-tinta text-base active:scale-95 transition-all cursor-pointer"
            >
              ←
            </button>
            <div>
              <h1 className="text-sm font-bold text-tinta">{leccion.titulo}</h1>
              <p className="text-[10px] text-slate-500 font-medium">
                {leccion.unidadId === 'u2' ? 'Expresiones algebraicas' : 'Ecuaciones lineales'} · Lección activa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-bg-soft1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-action transition-all duration-300"
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid md:grid-cols-12 gap-8 items-start">
        
        {/* Lado izquierdo: Reproductor de Video Manim (8 columnas) */}
        <div className="md:col-span-8 flex flex-col bg-tinta rounded-2xl shadow-md overflow-hidden relative border border-white/5">
          {/* Contenedor del video */}
          <div className="aspect-video w-full relative flex flex-col items-center justify-center text-center p-6 bg-slate-950">
            {/* Fondo decorativo abstracto matemático de Manim */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(47,109,181,0.18),transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />

            {/* Animación del video interactiva simulada */}
            <div className="z-10 flex flex-col items-center gap-5">
              <div className="flex items-center gap-6">
                <div className="w-32 h-16 border-2 border-bg-soft2/80 rounded-xl flex items-center justify-center text-bg-soft2 text-2xl font-semibold font-mono tracking-wide shadow-inner">
                  2x + 3
                </div>
                <div className="w-10 h-0.5 bg-slate-500" />
                <div className="w-32 h-16 border-2 border-green-logro/80 rounded-xl flex items-center justify-center text-green-logro text-2xl font-semibold font-mono tracking-wide shadow-inner animate-pulse">
                  11
                </div>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {isPlaying 
                  ? '[ Animación: sustrayendo 3 de ambos lados... ]'
                  : '[ Video Manim: ¿Por qué la balanza se mantiene en equilibrio? ]'}
              </p>
            </div>

            {/* Subtítulos integrados */}
            {showCC && isPlaying && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg max-w-[85%] border border-white/10 text-center z-15">
                <p className="text-xs md:text-sm text-white font-medium">
                  &quot;Si restamos 3 en la izquierda para dejar sola a la x, debemos restar 3 también en la derecha para mantener el equilibrio.&quot;
                </p>
              </div>
            )}
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-4 px-5 py-3.5 bg-slate-900 border-t border-white/5 select-none">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-white text-tinta flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex-none"
            >
              {isPlaying ? (
                <div className="flex gap-1">
                  <div className="w-1 h-3.5 bg-tinta rounded-sm" />
                  <div className="w-1 h-3.5 bg-tinta rounded-sm" />
                </div>
              ) : (
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-tinta ml-0.5" />
              )}
            </button>

            {/* Barra de progreso */}
            <div className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden relative cursor-pointer group">
              <div 
                className="h-full bg-blue-action group-hover:bg-blue-action/80 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Tiempo */}
            <span className="text-xs text-slate-400 font-mono">
              {formatTime(segundosActuales)} / {leccion.duracion}
            </span>

            {/* Subtítulos CC Toggle */}
            <button
              onClick={() => setShowCC(!showCC)}
              className={`text-[10px] font-bold border rounded px-2 py-0.5 transition-all cursor-pointer ${
                showCC 
                  ? 'border-blue-action bg-blue-action/10 text-blue-action' 
                  : 'border-white/20 text-slate-400 hover:border-white/40'
              }`}
            >
              CC
            </button>

            {/* Velocidad de reproducción */}
            <button
              onClick={() => setSpeed(speed === 1 ? 1.5 : 1)}
              className="text-[10px] font-bold border border-white/20 hover:border-white/40 text-slate-300 rounded px-2 py-0.5 cursor-pointer"
            >
              {speed}x
            </button>
          </div>
        </div>

        {/* Lado derecho: Notas de lección y CTA (4 columnas) */}
        <div className="md:col-span-4 flex flex-col gap-5">
          {/* Ideas clave */}
          <div className="bg-white border border-tinta/10 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ideas clave
            </span>
            <div className="flex flex-col gap-3">
              {leccion.ideasClave.map((idea, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-xs font-bold text-blue-action mt-0.5">{index + 1}.</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{idea}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gran Idea / Concepto */}
          <div className="bg-bg-soft2/60 border border-blue-action/10 p-5 rounded-2xl flex flex-col gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-action">
              Concepto
            </span>
            <h3 className="text-sm font-bold text-tinta">{leccion.concepto}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {leccion.conceptoDetalle}
            </p>
          </div>

          {/* Botón CTA para ir al reto */}
          <button
            onClick={handleIrReto}
            className="h-12 w-full mt-2 rounded-xl bg-blue-action text-white text-sm font-semibold hover:bg-blue-action/90 active:scale-95 shadow-md shadow-blue-action/15 hover:shadow-lg active:scale-98 transition-all flex items-center justify-center cursor-pointer gap-1"
          >
            Ir al reto →
          </button>

          {/* Indicador de progreso de aprendizaje */}
          <div className="flex items-center justify-center gap-5 mt-2">
            <span className="text-[10px] font-bold text-green-logro flex items-center gap-1">
              ✓ Video
            </span>
            <div className="w-8 h-px bg-slate-300" />
            <span className="text-[10px] font-bold text-blue-action flex items-center gap-1">
              • Notas
            </span>
            <div className="w-8 h-px bg-slate-300" />
            <span className="text-[10px] font-medium text-slate-400">
              Reto
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}
