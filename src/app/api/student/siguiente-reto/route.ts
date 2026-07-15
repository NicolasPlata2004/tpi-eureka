import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserById, getSiguienteRetoRecomendado } from '@/lib/db';

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

    // Retorna el siguiente reto recomendado de manera dinámica
    const retoRecomendado = getSiguienteRetoRecomendado(user.id);
    return NextResponse.json({ retoRecomendado });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
