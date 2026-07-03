import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/db';

export async function GET() {
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

    // Retorna el siguiente reto recomendado
    return NextResponse.json({
      retoRecomendado: {
        id: 'reto-balanza-1',
        titulo: 'La balanza: resolver 2x + 3 = 11',
        leccionId: 'lec-balanza',
        duracionEstimada: 'Video 5 min + Reto',
        unidadNombre: 'Ecuaciones lineales'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
