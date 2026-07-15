import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    
    let retos = [];
    let foundLeccionId = id; // Assuming id IS the leccionId now
    let foundHabilidadId = '';

    if (db.retos[foundLeccionId]) {
      retos = db.retos[foundLeccionId];
    } else {
      return NextResponse.json({ error: 'Lección o retos no encontrados' }, { status: 404 });
    }

    // Buscar la habilidadId correspondiente a esa lección en las unidades
    for (const unit of db.units) {
      if (Array.isArray(unit.habilidades)) {
        const hab = unit.habilidades.find((h: any) => h.leccionId === foundLeccionId);
        if (hab) {
          foundHabilidadId = hab.id;
          break;
        }
      }
    }

    return NextResponse.json({
      retos, // Return the whole array
      leccionId: foundLeccionId,
      habilidadId: foundHabilidadId
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
