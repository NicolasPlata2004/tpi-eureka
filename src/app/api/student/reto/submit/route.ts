import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserById, submitRetoAttempt, unlockLogroForUser, getLogrosForUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('eureka_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = getUserById(sessionId);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { retoId, habilidadId, passed } = body;

    if (!retoId || !habilidadId || typeof passed !== 'boolean') {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Registrar el intento
    const attempt = submitRetoAttempt(user.id, retoId, habilidadId, passed);

    // Lógica para desbloquear logros dinámicos
    let newLogro = null;
    if (passed) {
      if (retoId === 'reto-balanza-1') {
        newLogro = unlockLogroForUser(
          user.id,
          'equilibrista',
          'Equilibrista',
          'Resolviste el reto de la balanza manteniendo la igualdad.',
          '◆',
          'green'
        );
      }
      
      // Logro para detective del error
      if (attempt.intentos >= 3) {
        newLogro = unlockLogroForUser(
          user.id,
          'detective',
          'Detective del error',
          'Encontraste tu error y resolviste el reto con persistencia.',
          '●',
          'blue'
        );
      }
    }

    return NextResponse.json({
      success: true,
      attempt,
      newLogro
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
