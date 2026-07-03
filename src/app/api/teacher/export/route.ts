import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserById, getDocenteAnalytics } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('eureka_session')?.value;

    if (!sessionId) {
      return new NextResponse('No autenticado', { status: 401 });
    }

    const user = getUserById(sessionId);
    if (!user || user.role !== 'teacher') {
      return new NextResponse('No autorizado', { status: 403 });
    }

    const analytics = getDocenteAnalytics();
    const students = analytics.estudiantesAvance;

    // Generar contenido CSV
    const headers = 'Nombre,Correo,Unidad 1 (Enteros y racionales),Unidad 2 (Expresiones algebraicas),Unidad 3 (Ecuaciones lineales),Racha (dias)\n';
    const rows = students.map(s => 
      `"${s.nombre}","${s.email}","${s.progresoU1}","${s.progresoU2}","${s.progresoU3}",${s.racha}`
    ).join('\n');
    
    const csvContent = headers + rows;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="reporte_eureka_8B.csv"',
      },
    });
  } catch (error) {
    return new NextResponse('Error del servidor', { status: 500 });
  }
}
