import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    
    let foundReto = null;
    let foundLeccionId = '';
    let foundHabilidadId = '';

    // Buscar el reto en la base de datos por su ID en todas las lecciones
    for (const [leccionId, retosList] of Object.entries(db.retos)) {
      if (Array.isArray(retosList)) {
        const reto = retosList.find((r: any) => r.id === id);
        if (reto) {
          foundReto = reto;
          foundLeccionId = leccionId;
          break;
        }
      }
    }

    if (!foundReto) {
      return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 });
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
      reto: foundReto,
      leccionId: foundLeccionId,
      habilidadId: foundHabilidadId
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
