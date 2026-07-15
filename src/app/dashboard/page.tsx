'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

declare global {
  interface Window {
    watchedVideos?: string[];
  }
}

interface User {
  id: string;
  name: string;
  avatar: string;
  racha: number;
}

interface Habilidad {
  id: string;
  nombre: string;
  completa: boolean;
  activa?: boolean;
  leccionId?: string;
}

interface Unit {
  id: string;
  nombre: string;
  estado: 'completa' | 'en-progreso' | 'iniciada' | 'bloqueada';
  progreso: number;
  habilidades: Habilidad[];
}

interface Achievement {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
}

interface SiguienteReto {
  id: string;
  titulo: string;
  leccionId: string;
  duracionEstimada: string;
  unidadNombre: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [nextChallenge, setNextChallenge] = useState<SiguienteReto | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && Array.isArray(window.watchedVideos)) {
      setWatchedVideos([...window.watchedVideos]);
    }
  }, []);
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/student/progress');
        if (!res.ok) {
          router.push('/auth/dev-login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setUnits(data.units || []);
        setAchievements(data.achievements || []);

        // Fetch recommended next challenge
        const nextRes = await fetch('/api/student/siguiente-reto');
        if (nextRes.ok) {
          const nextData = await nextRes.json();
          setNextChallenge(nextData.retoRecomendado);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-action border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-500">Cargando tu camino...</span>
          </div>
        </div>
      </div>
    );
  }

  // Generar estado de racha visual para los días L M M J V S D
  const diasSemana = [
    { label: 'L', activa: user ? user.racha >= 1 : false },
    { label: 'M', activa: user ? user.racha >= 2 : false },
    { label: 'M', activa: user ? user.racha >= 3 : false },
    { label: 'J', activa: user ? user.racha >= 4 : false },
    { label: 'V', activa: user ? user.racha >= 5 : false, hoy: true },
    { label: 'S', activa: user ? user.racha >= 6 : false },
    { label: 'D', activa: user ? user.racha >= 7 : false }
  ];

  const processedUnits = useMemo(() => {
    if (!units || !Array.isArray(units)) return [];
    return units.map(unit => {
      if (!unit) return null;
      
      const habs = Array.isArray(unit.habilidades) ? unit.habilidades : [];
      
      // Recalculate habilidades completeness based on watchedVideos
      const updatedHabilidades = habs.map(h => {
        if (!h) return null;
        const isWatched = h.leccionId && Array.isArray(watchedVideos) && watchedVideos.includes(h.leccionId);
        return {
          ...h,
          completa: Boolean(h.completa || isWatched)
        };
      }).filter((h): h is Habilidad => h !== null);

      const completedCount = updatedHabilidades.filter(h => h.completa).length;
      
      // If this unit has any completed (or watched) habilidades, or was not blocked, it becomes active
      const hasWatchedAny = updatedHabilidades.some(h => h.leccionId && Array.isArray(watchedVideos) && watchedVideos.includes(h.leccionId));
      
      let estado = unit.estado;
      let progreso = unit.progreso;
      
      if (hasWatchedAny && unit.estado === 'bloqueada') {
        estado = 'en-progreso';
      }
      
      if (estado !== 'bloqueada') {
        const totalHab = updatedHabilidades.length;
        progreso = totalHab > 0 ? Math.round((completedCount / totalHab) * 100) : 0;
        if (progreso === 100) {
          estado = 'completa';
        }
      }

      return {
        ...unit,
        habilidades: updatedHabilidades,
        progreso,
        estado
      };
    }).filter((u): u is Unit => u !== null);
  }, [units, watchedVideos]);

  return (
    <div className="min-h-screen bg-bg-soft1 flex flex-col select-none">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid md:grid-cols-12 gap-8 items-start">
        
        {/* Lado izquierdo: Árbol de Habilidades (8 columnas) */}
        <div className="md:col-span-8 flex flex-col gap-6 text-left">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-tinta">
              ¡Hola, {user?.name}! 👋
            </h1>
            <p className="text-xs text-slate-500">
              Tu camino es individual. No hay rankings públicos ni presión.
            </p>
          </div>

          <div className="flex flex-col gap-6 relative">
            {processedUnits.map((unit, index) => {
              if (!unit) return null;
              const isU1 = unit.id === 'u1';
              const isU2 = unit.id === 'u2';
              const isU3 = unit.id === 'u3';
              const isBlocked = unit.estado === 'bloqueada';

              return (
                <div key={unit.id} className="flex flex-col">
                  {/* Tarjeta de la Unidad */}
                  <div
                    className={`bg-white border rounded-2xl p-5 flex flex-col gap-4 shadow-sm transition-all duration-300 ${
                      isBlocked 
                        ? 'opacity-60 border-tinta/10 dashed' 
                        : unit.estado === 'completa'
                        ? 'border-green-logro/30'
                        : 'border-blue-action/40 ring-1 ring-blue-action/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            isBlocked
                              ? 'bg-slate-400'
                              : unit.estado === 'completa'
                              ? 'bg-green-logro'
                              : 'bg-blue-action'
                          }`}
                        >
                          {unit.estado === 'completa' ? '✓' : unit.progreso + '%'}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-tinta">{unit.nombre}</h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {isBlocked 
                              ? 'Se desbloquea al avanzar en Ecuaciones'
                              : unit.estado === 'completa'
                              ? 'Habilidades dominadas'
                              : `En progreso · ${unit.habilidades.filter(h => h && h.completa).length} de ${unit.habilidades.length} completadas`}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          isBlocked
                            ? 'bg-bg-soft1 text-slate-400'
                            : unit.estado === 'completa'
                            ? 'bg-[#DDF0E5] text-green-logro'
                            : 'bg-bg-soft2 text-blue-action'
                        }`}
                      >
                        {isBlocked ? 'Bloqueada' : unit.estado === 'completa' ? 'Completada' : 'Estás aquí'}
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    {!isBlocked && (
                      <div className="w-full h-2 rounded-full bg-bg-soft1 overflow-hidden">
                        <div
                          style={{ width: `${unit.progreso}%` }}
                          className={`h-full transition-all duration-500 ${
                            unit.estado === 'completa' ? 'bg-green-logro' : 'bg-blue-action'
                          }`}
                        />
                      </div>
                    )}

                    {/* Lista de habilidades secundarias (Ahora siempre visibles y clickeables si tienen leccionId) */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {unit.habilidades.map((h) => {
                        if (!h) return null;
                        const isHabilityCompleted = h.completa || isU1;
                        
                        // Si tiene video/leccion, siempre permitir entrar
                        if (h.leccionId) {
                          return (
                            <button
                              key={h.id}
                              onClick={() => router.push(`/leccion/${h.leccionId}`)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition-all cursor-pointer border active:scale-95 ${
                                isHabilityCompleted
                                  ? 'text-green-logro bg-[#DDF0E5] hover:bg-[#DDF0E5]/80 border-green-logro/20'
                                  : 'text-white bg-blue-action hover:bg-blue-action/90 border-blue-action/10'
                              }`}
                            >
                              {isHabilityCompleted ? (
                                <><span className="font-extrabold text-sm leading-none">✓</span> Video: {h.nombre}</>
                              ) : (
                                <><span className="text-[10px] mr-0.5">▶</span> Video: {h.nombre}</>
                              )}
                            </button>
                          );
                        }

                        // Si no tiene video pero está completada (texto plano)
                        if (isHabilityCompleted) {
                          return (
                            <span
                              key={h.id}
                              className="text-xs font-semibold text-green-logro bg-[#DDF0E5] px-3 py-1.5 rounded-full flex items-center gap-1 border border-green-logro/15"
                            >
                              ✓ {h.nombre}
                            </span>
                          );
                        }

                        // Habilidades sin video y no completadas
                        return (
                          <span
                            key={h.id}
                            className="text-xs font-medium text-slate-400 bg-bg-soft1 border border-tinta/10 border-dashed px-3 py-1.5 rounded-full"
                          >
                            {h.nombre}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conector de unidades */}
                  {index < processedUnits.length - 1 && (
                    <div className="w-[3px] h-6 bg-slate-300/40 rounded-full mx-10 my-1 self-start" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lado derecho: Tarjetas laterales (Racha, Siguiente reto, Logros) (4 columnas) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Tarjeta 1: Siguiente reto recomendado */}
          {nextChallenge && (
            <div className="bg-blue-action text-white p-5 rounded-2xl flex flex-col gap-4 shadow-md text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bg-soft2">
                Siguiente reto recomendado
              </span>
              <div>
                <h3 className="text-lg font-bold leading-snug">{nextChallenge.titulo}</h3>
                <p className="text-xs text-bg-soft2/80 mt-1">
                  {nextChallenge.duracionEstimada} · {nextChallenge.unidadNombre}
                </p>
              </div>
              <button
                onClick={() => router.push(`/reto/${nextChallenge.id}`)}
                className="h-10 w-full rounded-xl bg-white text-blue-action text-xs font-bold hover:bg-bg-soft1 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Continuar ahora
              </button>
            </div>
          )}

          {/* Tarjeta 2: Racha */}
          <div className="bg-white border border-tinta/10 p-5 rounded-2xl flex flex-col gap-4 shadow-sm text-left">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-tinta">{user?.racha || 0}</span>
              <span className="text-xs text-slate-500 font-semibold">días seguidos aprendiendo</span>
            </div>
            
            <div className="flex justify-between items-center px-1">
              {diasSemana.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 w-8">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      d.activa
                        ? 'bg-green-logro text-white shadow-sm'
                        : d.hoy
                        ? 'bg-white border-2 border-blue-action text-blue-action'
                        : 'bg-bg-soft1 border border-tinta/10 text-slate-400'
                    }`}
                  >
                    {d.activa ? '✓' : d.hoy ? '•' : ''}
                  </div>
                  <span className={`text-[10px] ${d.hoy ? 'text-blue-action font-bold' : 'text-slate-400'}`}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 leading-normal border-t border-tinta/5 pt-3">
              Un reto corto al día mantiene tu racha viva y refuerza tu aprendizaje sin presiones.
            </p>
          </div>

          {/* Tarjeta 3: Logros recientes */}
          <div className="bg-white border border-tinta/10 p-5 rounded-2xl flex flex-col gap-4 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Logros desbloqueados
            </span>

            {achievements.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Completa retos para desbloquear insignias especiales.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {achievements.map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${
                        a.color === 'green'
                          ? 'bg-[#DDF0E5] text-green-logro'
                          : 'bg-bg-soft2 text-blue-action'
                      }`}
                    >
                      {a.icono}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-tinta">{a.titulo}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{a.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
