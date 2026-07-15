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
  const [nextRetoId, setNextRetoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // References for synchronized audio playback
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

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
        setNextRetoId(data.nextRetoId || (data.retos.length > 0 ? data.retos[0].id : null));
      } catch (err) {
        console.error('Error fetching lesson:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeccion();
  }, [id, router]);

  // Synchronize audio playback with video events
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    // Initial sync
    audio.volume = video.volume;
    audio.muted = video.muted;

    const handlePlay = () => {
      audio.play().catch((err) => console.log('Audio autoplay blocked or failed:', err));
    };

    const handlePause = () => {
      audio.pause();
    };

    const handleVolumeChange = () => {
      audio.volume = video.volume;
      audio.muted = video.muted;
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [loading, leccion]);

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

  const handleIrReto = () => {
    router.push(`/reto/${leccion.id}`);
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

        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid md:grid-cols-12 gap-8 items-start">
        
        {/* Lado izquierdo: Reproductor de Video Manim (8 columnas) */}
         <div className="md:col-span-8 flex flex-col bg-tinta rounded-2xl shadow-md overflow-hidden relative border border-white/5">
          {/* Audio element for music track */}
          <audio ref={audioRef} src="/audio/music.mpeg" loop />

          {/* Contenedor del video */}
          <div className="aspect-video w-full relative flex flex-col items-center justify-center bg-black">
            {leccion.videoUrl ? (
              <video
                ref={videoRef}
                src={leccion.videoUrl}
                controls
                className="w-full h-full object-contain"
                controlsList="nodownload"
                poster="/thumbnail-placeholder.png"
              />
            ) : (
              <div className="text-slate-500 font-mono text-sm">No se encontró video para esta lección</div>
            )}
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
