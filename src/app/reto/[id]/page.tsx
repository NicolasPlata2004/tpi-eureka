'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Balanza from '@/components/Balanza';
import Sustituidor from '@/components/Sustituidor';
import Simplificador from '@/components/Simplificador';
import AreaModel from '@/components/AreaModel';
import PitagorasModel from '@/components/PitagorasModel';
import LadderModel from '@/components/LadderModel';

type ProgressStatus = 'pending' | 'current' | 'correct' | 'correct_with_errors';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RetoPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [retos, setRetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del juego y feedback
  const [currentRetoIndex, setCurrentRetoIndex] = useState(0);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus[]>([]);
  const [hasFailedCurrent, setHasFailedCurrent] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);

  // Estado de logro desbloqueado
  const [logroDesbloqueado, setLogroDesbloqueado] = useState<any>(null);
  const [habilidadId, setHabilidadId] = useState<string>('h3-2');

  useEffect(() => {
    async function fetchRetos() {
      try {
        const res = await fetch(`/api/reto/${id}`);
        if (!res.ok) {
          window.location.href = '/dashboard';
          return;
        }
        const data = await res.json();
        if (data.retos && data.retos.length > 0) {
          setRetos(data.retos);
          setProgressStatus(data.retos.map((_: any, i: number) => i === 0 ? 'current' : 'pending'));
          if (data.habilidadId) {
            setHabilidadId(data.habilidadId);
          }
        } else {
          window.location.href = '/dashboard';
        }
      } catch (err) {
        console.error('Error fetching challenges:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRetos();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-action border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-500">Cargando retos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (retos.length === 0) return null;

  const currentReto = retos[currentRetoIndex];

  const handleCorrectAction = async () => {
    const newStatus = [...progressStatus];
    newStatus[currentRetoIndex] = hasFailedCurrent ? 'correct_with_errors' : 'correct';
    
    // Si hay un siguiente reto, ponlo como current
    if (currentRetoIndex < retos.length - 1) {
      newStatus[currentRetoIndex + 1] = 'current';
    }
    
    setProgressStatus(newStatus);
    
    setTimeout(async () => {
      if (currentRetoIndex < retos.length - 1) {
        setCurrentRetoIndex(currentRetoIndex + 1);
        setHasFailedCurrent(false);
      } else {
        // Enviar resultado a la API al finalizar todos
        try {
          const isPerfect = !newStatus.includes('correct_with_errors');
          const res = await fetch('/api/student/reto/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              retoId: id, // enviamos el leccionId como llave
              habilidadId: habilidadId,
              passed: true,
              perfect: isPerfect
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.newLogro) {
              setLogroDesbloqueado(data.newLogro);
            }
          }
        } catch (err) {
          console.error('Error submitting result:', err);
        }
        setShowEndScreen(true);
      }
    }, 1200);
  };

  const handleErrorAction = () => {
    setHasFailedCurrent(true);
  };

  if (showEndScreen) {
    const isPerfect = !progressStatus.includes('correct_with_errors');
    return (
      <div className="min-h-screen bg-bg-soft1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full border border-tinta/10 animate-scaleIn">
          <div className="text-6xl mb-4">{isPerfect ? '🌟' : '💪'}</div>
          <h2 className="text-2xl font-bold text-tinta mb-2">
            {isPerfect ? '¡Perfección absoluta!' : '¡Gran esfuerzo!'}
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {isPerfect 
              ? 'Has completado todos los ejercicios sin un solo error. ¡Tu lógica está impecable!' 
              : 'Completaste todos los retos. Los errores son solo escalones hacia el éxito, ¡sigue así!'}
          </p>
          <div className="flex gap-2 justify-center mb-8">
            {progressStatus.map((status, idx) => (
              <div key={idx} className={`h-3 w-8 rounded-full ${status === 'correct' ? 'bg-green-logro' : 'bg-yellow-500'}`} />
            ))}
          </div>
          {logroDesbloqueado && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
              <div className="text-3xl mb-2">{logroDesbloqueado.icono}</div>
              <h3 className="font-bold text-blue-700">{logroDesbloqueado.titulo}</h3>
              <p className="text-sm text-blue-600">{logroDesbloqueado.descripcion}</p>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-action text-white font-bold py-3.5 rounded-xl hover:bg-blue-action/90 transition-all active:scale-95 shadow-md"
          >
            Volver al Camino
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft1 flex flex-col select-none relative overflow-hidden text-left">
      <Header />
      
      {/* Top Bar con Progreso */}
      <div className="bg-white border-b border-tinta/10 w-full py-4 z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 border border-tinta/10 hover:bg-bg-soft1 rounded-xl flex items-center justify-center font-bold text-tinta text-base active:scale-95 transition-all cursor-pointer"
            >
              ←
            </button>
            <div>
              <h1 className="text-sm font-bold text-tinta">Reto de Habilidad</h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Ejercicio {currentRetoIndex + 1} de {retos.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {progressStatus.map((status, idx) => {
              let bgColor = 'bg-slate-200';
              if (status === 'current') bgColor = 'bg-blue-action';
              else if (status === 'correct') bgColor = 'bg-green-logro';
              else if (status === 'correct_with_errors') bgColor = 'bg-yellow-500';
              
              return (
                <div 
                  key={idx} 
                  className={`h-2 w-8 rounded-full ${bgColor} transition-all duration-500`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 md:py-12 flex flex-col relative z-10">
        {currentReto.tipo === 'balanza' && (
          <Balanza 
            key={currentReto.id}
            reto={currentReto} 
            onCorrectAction={handleCorrectAction} 
            onErrorAction={handleErrorAction} 
          />
        )}
        {currentReto.tipo === 'sustituidor' && (
          <Sustituidor 
            key={currentReto.id}
            reto={currentReto} 
            onCorrectAction={handleCorrectAction} 
            onErrorAction={handleErrorAction} 
          />
        )}
        {currentReto.tipo === 'simplificador' && (
          <Simplificador 
            key={currentReto.id}
            reto={currentReto} 
            onCorrectAction={handleCorrectAction} 
            onErrorAction={handleErrorAction} 
          />
        )}
        {currentReto.tipo === 'areas' && (
          <AreaModel 
            key={currentReto.id}
            reto={currentReto} 
            onCorrectAction={handleCorrectAction} 
            onErrorAction={handleErrorAction} 
          />
        )}
        {currentReto.tipo === 'pitagoras' && (
          <PitagorasModel 
            key={currentReto.id}
            reto={currentReto} 
            onCorrectAction={handleCorrectAction} 
            onErrorAction={handleErrorAction} 
          />
        )}
        {currentReto.tipo === 'ladder' && (
          <LadderModel 
            key={currentReto.id}
            reto={currentReto} 
            onCorrectAction={handleCorrectAction} 
            onErrorAction={handleErrorAction} 
          />
        )}
      </main>
    </div>
  );
}
