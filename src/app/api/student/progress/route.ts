import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserById, getUnitsForUser, getLogrosForUser } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('eureka_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = getUserById(sessionId);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Estudiante no encontrado o rol inválido' }, { status: 403 });
    }

    const units = getUnitsForUser(user.id);
    const achievements = getLogrosForUser(user.id);

    return NextResponse.json({
      user,
      units,
      achievements
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
