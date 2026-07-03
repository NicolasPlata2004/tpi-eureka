import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserById, getDocenteAnalytics } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('eureka_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = getUserById(sessionId);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const analytics = getDocenteAnalytics();

    return NextResponse.json({
      analytics
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
