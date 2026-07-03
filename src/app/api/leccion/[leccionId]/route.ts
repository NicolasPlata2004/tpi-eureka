import { NextResponse } from 'next/server';
import { getLeccionById, getRetosByLeccionId } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leccionId: string }> }
) {
  try {
    const { leccionId } = await params;
    const leccion = getLeccionById(leccionId);

    if (!leccion) {
      return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 });
    }

    const retos = getRetosByLeccionId(leccionId);

    return NextResponse.json({
      leccion,
      retos
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
