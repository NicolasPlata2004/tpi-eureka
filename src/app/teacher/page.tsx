'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Dificultad {
  tema: string;
  intentosMasDeDos: number;
  color: 'amber' | 'blue' | 'green';
}

interface UnidadAvance {
  nombre: string;
  dominio: number;
  tendencia: string;
}

interface EstudianteApoyo {
  name: string;
  habilidad: string;
  intentos: number;
}

interface EstudianteAvance {
  id: string;
  nombre: string;
  email: string;
  progresoU1: string;
  progresoU2: string;
  progresoU3: string;
  racha: number;
}

interface AnalyticsData {
  masteryAverage: number;
  masteryDiff: number;
  activeCount: number;
  activeDiff: number;
  challengesCompleted: number;
  supportNeededCount: number;
  dificultades: Dificultad[];
  unidadesAvance: UnidadAvance[];
  estudiantesApoyo: EstudianteApoyo[];
  estudiantesAvance: EstudianteAvance[];
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verListaApoyo, setVerListaApoyo] = useState(false);
  const [verDetalleEstudiantes, setVerDetalleEstudiantes] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/teacher/analytics');
        if (!res.ok) {
          router.push('/auth/dev-login');
          return;
        }
        const data = await res.json();
        setAnalytics(data.analytics);
      } catch (err) {
        console.error('Error fetching teacher analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [router]);

  const handleExportCSV = () => {
    // Redirigir directamente al endpoint del navegador para iniciar la descarga
    window.location.href = '/api/teacher/export';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-tinta border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-500">Cargando panel docente...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-bg-soft1 flex flex-col select-none text-left">
      <Header />
      
      {/* Subheader con controles de exportación */}
      <div className="bg-white border-b border-tinta/8 py-4 w-full">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Eureka Logo" className="h-8 w-auto object-contain" />
            <div>
              <h1 className="text-base font-bold text-tinta">Panel Docente</h1>
              <p className="text-xs text-slate-500 font-medium">Control de progreso de grupo · Grado 8-B</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="h-10 px-4 rounded-xl border border-tinta/15 bg-white text-tinta text-xs font-semibold hover:bg-bg-soft1 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-6">
        
        {/* Encabezado descriptivo de privacidad */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-tinta">Grupo 8-B · 32 Estudiantes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Semana del 22 al 26 de junio</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-white border border-tinta/5 px-3 py-1 rounded-full">
            Los estudiantes nunca ven estos datos ni rankings
          </span>
        </div>

        {/* KPIs Grid (4 tarjetas) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white border border-tinta/10 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dominio Promedio</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-tinta">{analytics.masteryAverage}%</span>
              <span className="text-[11px] font-bold text-green-logro">
                ▲ +{analytics.masteryDiff} pts
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">vs. semana pasada</p>
          </div>

          <div className="bg-white border border-tinta/10 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estudiantes Activos</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-tinta">
                {analytics.activeCount} <span className="text-sm font-semibold text-slate-400">/ 32</span>
              </span>
              <span className="text-[11px] font-bold text-green-logro">
                ▲ +{analytics.activeDiff}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">activos esta semana</p>
          </div>

          <div className="bg-white border border-tinta/10 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Retos Completados</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-tinta">{analytics.challengesCompleted}</span>
              <span className="text-[11px] font-bold text-slate-400">— estable</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">retos resueltos en total</p>
          </div>

          <div 
            onClick={() => setVerListaApoyo(!verListaApoyo)}
            className="bg-white border border-tinta/10 p-5 rounded-2xl flex flex-col justify-between shadow-sm cursor-pointer hover:border-amber-revisar/55 hover:bg-bg-soft1 transition-all"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Piden Apoyo</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-amber-revisar">{analytics.supportNeededCount}</span>
              <span className="text-[10px] font-bold text-amber-revisar">△ ver lista</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">necesitan refuerzo</p>
          </div>

        </div>

        {/* Modal/Lista expandible de apoyo privado */}
        {verListaApoyo && (
          <div className="bg-[#FDF1DC] border border-amber-revisar/30 rounded-2xl p-5 text-left animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-[#8A5B10]">
                Lista privada de Estudiantes que necesitan apoyo (Confidencial)
              </h3>
              <button 
                onClick={() => setVerListaApoyo(false)}
                className="text-xs font-bold text-[#8A5B10] hover:underline cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.estudiantesApoyo.map((est, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-amber-revisar/20 flex flex-col gap-1">
                  <p className="text-xs font-bold text-tinta">{est.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Habilidad: {est.habilidad}</p>
                  <p className="text-[10px] font-bold text-amber-revisar">Intentos acumulados: {est.intentos}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#7A5310] mt-3 italic">
              * El estudiante no recibe ninguna alerta de fracaso en su interfaz. Comunícate con ellos y ofréceles una explicación constructiva.
            </p>
          </div>
        )}

        {/* Sección de Gráficos y Tablas (2 columnas) */}
        <div className="grid md:grid-cols-12 gap-6 items-stretch">
          
          {/* Lado izquierdo: Temas con dificultad (7 columnas) */}
          <div className="md:col-span-7 bg-white border border-tinta/10 rounded-2xl p-5 flex flex-col gap-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-tinta">Temas con más dificultad</h3>
              <p className="text-xs text-slate-400 mt-0.5">% de intentos que requirieron 2 o más intentos</p>
            </div>

            <div className="flex flex-col gap-4">
              {analytics.dificultades.map((dif, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline text-xs font-medium text-tinta">
                    <span>{dif.tema}</span>
                    <span className={`font-bold ${
                      dif.color === 'amber' ? 'text-amber-revisar' : dif.color === 'green' ? 'text-green-logro' : 'text-slate-500'
                    }`}>
                      {dif.intentosMasDeDos}%
                    </span>
                  </div>
                  
                  {/* Barra horizontal pura CSS */}
                  <div className="w-full h-3.5 bg-bg-soft1 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${dif.intentosMasDeDos}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        dif.color === 'amber'
                          ? 'bg-amber-revisar'
                          : dif.color === 'green'
                          ? 'bg-green-logro'
                          : 'bg-blue-action/60'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sugerencia pedagógica inteligente */}
            <div className="bg-bg-soft2/60 border border-blue-action/15 rounded-xl p-4 flex gap-3 text-left">
              <span className="text-sm font-bold text-blue-action flex-none">💡</span>
              <div className="text-xs text-blue-action leading-normal font-medium">
                <strong>Sugerencia pedagógica:</strong> Repasa la propiedad distributiva con el video animado <strong>&quot;Repartir para multiplicar&quot;</strong> en la próxima sesión grupal. El 64% de los estudiantes está tomando más de 2 intentos para superarla.
              </div>
            </div>
          </div>

          {/* Lado derecho: Avance por unidad (5 columnas) */}
          <div className="md:col-span-5 bg-white border border-tinta/10 rounded-2xl p-5 flex flex-col gap-4 shadow-sm justify-between">
            <h3 className="text-base font-bold text-tinta">Avance promedio por unidad</h3>
            
            <div className="flex-1 flex flex-col justify-center divide-y divide-tinta/5">
              {analytics.unidadesAvance.map((u, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-tinta">{u.nombre}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Dominio estimado</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-xs font-bold text-tinta">{u.dominio}%</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      u.tendencia.includes('sube')
                        ? 'bg-[#DDF0E5] text-green-logro'
                        : u.tendencia.includes('atención')
                        ? 'bg-[#FDF1DC] text-amber-revisar'
                        : 'bg-bg-soft1 text-slate-400'
                    }`}>
                      {u.tendencia.includes('sube') ? '▲' : u.tendencia.includes('atención') ? '△' : '—'} {u.tendencia.split(' ')[1] || u.tendencia}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setVerDetalleEstudiantes(!verDetalleEstudiantes)}
              className="h-10 w-full border border-tinta/15 bg-white text-tinta text-xs font-semibold rounded-xl hover:bg-bg-soft1 transition-colors cursor-pointer text-center"
            >
              {verDetalleEstudiantes ? 'Ocultar listado de estudiantes' : 'Ver listado detallado (Privado) →'}
            </button>
          </div>

        </div>

        {/* Tabla privada detallada de estudiantes */}
        {verDetalleEstudiantes && (
          <div className="bg-white border border-tinta/10 rounded-2xl overflow-hidden shadow-sm animate-fadeIn">
            <div className="px-5 py-4 border-b border-tinta/5 bg-bg-soft1 flex justify-between items-center">
              <h3 className="text-sm font-bold text-tinta">Progreso Individual por Estudiante (Privado)</h3>
              <button 
                onClick={handleExportCSV}
                className="text-xs font-bold text-blue-action hover:underline cursor-pointer"
              >
                Descargar esta lista como CSV
              </button>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-bg-soft1/55 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-tinta/5 text-left">
                    <th className="px-5 py-3">Nombre</th>
                    <th className="px-5 py-3">Correo</th>
                    <th className="px-5 py-3 text-center">U1 (Enteros)</th>
                    <th className="px-5 py-3 text-center">U2 (Expresiones)</th>
                    <th className="px-5 py-3 text-center">U3 (Ecuaciones)</th>
                    <th className="px-5 py-3 text-center">Racha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tinta/5 font-medium text-tinta">
                  {analytics.estudiantesAvance.map((est) => (
                    <tr key={est.id} className="hover:bg-bg-soft1/40">
                      <td className="px-5 py-3.5 font-bold">{est.nombre}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{est.email}</td>
                      <td className="px-5 py-3.5 text-center text-green-logro font-bold">{est.progresoU1}</td>
                      <td className="px-5 py-3.5 text-center">{est.progresoU2}</td>
                      <td className="px-5 py-3.5 text-center">{est.progresoU3}</td>
                      <td className="px-5 py-3.5 text-center font-bold">{est.racha} d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
