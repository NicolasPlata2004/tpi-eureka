'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Balanza from '@/components/Balanza';

interface RetoOpcion {
  id: string;
  texto: string;
  ok: boolean;
  reflexion?: string;
}

interface Reto {
  id: string;
  tipo: string;
  pregunta: string;
  ecuacionOriginal: string;
  platilloIzquierdo: { terminos: string[]; mostrarTres: boolean };
  platilloDerecho: { valor: number };
  opciones: RetoOpcion[];
  pista: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RetoPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [reto, setReto] = useState<Reto | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados del juego y feedback
  const [resuelto, setResuelto] = useState(false);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [mostrarReflexion, setMostrarReflexion] = useState(false);
  const [reflexionMsg, setReflexionMsg] = useState('');
  const [intentos, setIntentos] = useState(0);

  // Estado de logro desbloqueado
  const [logroDesbloqueado, setLogroDesbloqueado] = useState<{
    titulo: string;
    descripcion: string;
    icono: string;
  } | null>(null);

  useEffect(() => {
    async function fetchReto() {
      try {
        // En este MVP simplificado cargamos los retos de la lección "lec-balanza"
        const res = await fetch('/api/leccion/lec-balanza');
        if (!res.ok) {
          router.push('/dashboard');
          return;
        }
        const data = await res.json();
        const foundReto = data.retos.find((r: Reto) => r.id === id);
        if (foundReto) {
          setReto(foundReto);
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching challenge:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReto();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-action border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-500">Cargando reto...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!reto) return null;

  // Lógica cuando se realiza la acción correcta (vía drag and drop o botón correcto)
  const handleCorrectAction = async () => {
    if (resuelto) return;
    setResuelto(true);
    setSelectedOp('a'); // La opción 'a' es la correcta
    setMostrarReflexion(false);
    
    // Incrementar número de intentos local
    const totalAttempts = intentos + 1;
    setIntentos(totalAttempts);

    // Enviar resultado a la API
    try {
      const res = await fetch('/api/student/reto/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retoId: reto.id,
          habilidadId: 'h3-2', // Habilidad de la balanza
          passed: true
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
  };

  // Lógica cuando se selecciona una opción de botón
  const handleSelectOption = async (op: RetoOpcion) => {
    if (resuelto) return;
    setSelectedOp(op.id);
    
    const totalAttempts = intentos + 1;
    setIntentos(totalAttempts);

    if (op.ok) {
      handleCorrectAction();
    } else {
      setReflexionMsg(op.reflexion || 'Inténtalo de nuevo.');
      setMostrarReflexion(true);

      // Registrar intento fallido silenciosamente
      try {
        await fetch('/api/student/reto/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            retoId: reto.id,
            habilidadId: 'h3-2',
            passed: false
          })
        });
      } catch (err) {
        console.error('Error submitting incorrect attempt:', err);
      }
    }
  };

  const terminarReto = () => {
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg-soft1 flex flex-col select-none text-left">
      <Header />
      
      {/* Header secundario de progreso del reto */}
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
              <h1 className="text-sm font-bold text-tinta">Reto: La Balanza</h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Ecuaciones lineales · Reto 2 de 6
              </p>
            </div>
          </div>

          {/* Progreso visual en burbujas */}
          <div className="flex gap-2">
            <div className="w-6 h-2 rounded-full bg-green-logro" />
            <div className={`w-6 h-2 rounded-full transition-all duration-500 ${resuelto ? 'bg-green-logro' : 'bg-blue-action'}`} />
            <div className="w-6 h-2 rounded-full bg-bg-soft2" />
            <div className="w-6 h-2 rounded-full bg-bg-soft2" />
            <div className="w-6 h-2 rounded-full bg-bg-soft2" />
            <div className="w-6 h-2 rounded-full bg-bg-soft2" />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid md:grid-cols-12 gap-8 items-start">
        
        {/* Lado izquierdo: Balanza (7 columnas) */}
        <div className="md:col-span-7 flex flex-col items-center gap-4 w-full">
          <Balanza
            ecuacion={resuelto ? '2x = 8' : reto.ecuacionOriginal}
            mostrarTres={!resuelto}
            ladoDerecho={resuelto ? '8' : String(reto.platilloDerecho?.valor)}
            onCorrectAction={handleCorrectAction}
            resuelto={resuelto}
            subtitulo={resuelto ? '¡Eso es! Quitaste 3 de cada lado de la balanza.' : undefined}
          />
        </div>

        {/* Lado derecho: Pregunta, Opciones y Feedback (5 columnas) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <span className="text-base md:text-lg font-bold text-tinta leading-snug">
            {reto.pregunta}
          </span>

          {/* Opciones del reto */}
          <div className="flex flex-col gap-2.5">
            {reto.opciones.map((op) => {
              const isSelected = selectedOp === op.id;
              let btnClass = 'bg-white border border-tinta/15 text-tinta';
              let badge = '○';
              let badgeClass = 'text-slate-400';

              if (isSelected) {
                if (op.ok) {
                  btnClass = 'bg-[#DDF0E5] border-2 border-green-logro text-green-logro font-semibold';
                  badge = '✓';
                  badgeClass = 'text-green-logro font-bold';
                } else {
                  btnClass = 'bg-[#FDF1DC] border-2 border-amber-revisar text-[#8A5B10] font-semibold';
                  badge = '△';
                  badgeClass = 'text-amber-revisar font-bold';
                }
              }

              return (
                <button
                  key={op.id}
                  onClick={() => handleSelectOption(op)}
                  disabled={resuelto}
                  className={`w-full min-h-[52px] rounded-xl flex items-center gap-3.5 px-4 py-3 text-left text-xs md:text-sm transition-all duration-200 select-none ${btnClass} ${
                    !resuelto ? 'hover:bg-bg-soft1 active:scale-[0.99] cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span className={`text-base flex-none ${badgeClass}`}>{badge}</span>
                  <span className="leading-normal">{op.texto}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback interactivo en Ámbar (Error reflexivo) */}
          {mostrarReflexion && !resuelto && (
            <div className="bg-[#FDF1DC] border border-amber-revisar/40 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn">
              <span className="text-lg font-extrabold text-[#8A5B10] flex-none">△</span>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-[#8A5B10]">Pausa y observa la balanza</p>
                <p className="text-xs text-[#7A5310] leading-relaxed">{reflexionMsg}</p>
                <p className="text-[10px] font-semibold text-[#8A5B10] mt-1">Vas por buen camino — ¡inténtalo otra vez!</p>
              </div>
            </div>
          )}

          {/* Feedback interactivo en Verde (Correcto) */}
          {resuelto && (
            <div className="bg-[#DDF0E5] border border-green-logro/30 rounded-2xl p-4 flex gap-3 text-left animate-fadeIn">
              <span className="text-lg font-extrabold text-green-logro flex-none">✓</span>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-green-logro">¡Excelente trabajo!</p>
                <p className="text-xs text-[#1F6B44] leading-relaxed">
                  Restar 3 en ambos lados mantiene la balanza en equilibrio. Mira la animación: el +3 desapareció de la izquierda y la derecha cambió a 8. Ahora queda la ecuación simplificada <span className="font-bold font-mono">2x = 8</span>.
                </p>
              </div>
            </div>
          )}

          {/* Modal / Alerta de Logro Desbloqueado */}
          {logroDesbloqueado && (
            <div className="bg-gradient-to-r from-bg-soft2 to-[#DDF0E5] border-2 border-green-logro/40 rounded-2xl p-4 flex items-center justify-between text-left shadow-md animate-bounce-short">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-green-logro">{logroDesbloqueado.icono}</span>
                <div>
                  <p className="text-xs font-bold text-green-logro">¡Logro Desbloqueado!</p>
                  <p className="text-xs font-extrabold text-tinta">{logroDesbloqueado.titulo}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{logroDesbloqueado.descripcion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones secundarios (Pistas y Saltar) */}
          <div className="flex gap-3 mt-2 select-none">
            <button
              onClick={() => setMostrarPista(!mostrarPista)}
              className="flex-1 h-11 border border-blue-action/30 hover:border-blue-action text-blue-action font-semibold text-xs rounded-xl flex items-center justify-center hover:bg-bg-soft2 active:scale-95 transition-all cursor-pointer bg-white"
            >
              {mostrarPista ? 'Ocultar pista' : 'Ver una pista'}
            </button>
            
            <button
              onClick={terminarReto}
              className="flex-1 h-11 text-slate-400 hover:text-slate-600 font-semibold text-xs rounded-xl flex items-center justify-center hover:bg-bg-soft1 active:scale-95 transition-all cursor-pointer bg-transparent border border-transparent"
            >
              {resuelto ? 'Regresar al dashboard' : 'Saltar por ahora'}
            </button>
          </div>

          {/* Panel de pista */}
          {mostrarPista && (
            <div className="bg-bg-soft2 border border-blue-action/10 rounded-xl p-4 flex gap-3 text-left animate-fadeIn">
              <span className="text-sm font-bold text-blue-action flex-none">i</span>
              <p className="text-xs text-blue-action leading-relaxed">
                {reto.pista}
              </p>
            </div>
          )}

          {resuelto && (
            <button
              onClick={terminarReto}
              className="h-12 w-full mt-2 rounded-xl bg-green-logro text-white text-sm font-semibold hover:bg-green-logro/90 active:scale-95 shadow-md shadow-green-logro/15 transition-all flex items-center justify-center cursor-pointer"
            >
              Continuar al camino →
            </button>
          )}

          {!resuelto && (
            <p className="text-[10px] text-slate-400 text-center">
              Saltar no descuenta puntos. Este reto volverá más adelante cuando estés listo.
            </p>
          )}
        </div>

      </main>
    </div>
  );
}
