import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

let memoryDb: DatabaseSchema | null = null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  avatar: string;
  racha?: number;
  rachaLastUpdated?: string;
}

export interface Habilidad {
  id: string;
  nombre: string;
  completa: boolean;
  activa?: boolean;
  leccionId?: string;
}

export interface Unit {
  id: string;
  nombre: string;
  estado: 'completa' | 'en-progreso' | 'iniciada' | 'bloqueada';
  progreso: number;
  habilidades: Habilidad[];
}

export interface Leccion {
  id: string;
  titulo: string;
  unidadId: string;
  videoUrl: string;
  duracion: string;
  ideasClave: string[];
  concepto: string;
  conceptoDetalle: string;
}

export interface RetoOpcion {
  id: string;
  texto: string;
  ok: boolean;
  reflexion?: string;
}

export interface Reto {
  id: string;
  tipo: 'balanza' | 'multiple-choice';
  pregunta: string;
  ecuacionOriginal?: string;
  platilloIzquierdo?: {
    terminos: string[];
    mostrarTres: boolean;
  };
  platilloDerecho?: {
    valor: number;
  };
  opciones: RetoOpcion[];
  pista?: string;
}

export interface ProgressRecord {
  id: string;
  userId: string;
  habilidadId: string;
  completa: boolean;
  intentos: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attempt {
  id: string;
  userId: string;
  habilidadId: string;
  retoId: string;
  passed: boolean;
  intentos: number;
  createdAt: string;
  updatedAt: string;
}

export interface Logro {
  id: string;
  userId: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  unlockedAt: string;
}

export interface DocenteAnalytics {
  masteryAverage: number;
  masteryDiff: number;
  activeCount: number;
  activeDiff: number;
  challengesCompleted: number;
  supportNeededCount: number;
  dificultades: {
    tema: string;
    intentosMasDeDos: number;
    color: 'amber' | 'blue' | 'green';
  }[];
  unidadesAvance: {
    nombre: string;
    dominio: number;
    tendencia: string;
  }[];
  estudiantesApoyo: {
    name: string;
    habilidad: string;
    intentos: number;
  }[];
  estudiantesAvance: {
    id: string;
    nombre: string;
    email: string;
    progresoU1: string;
    progresoU2: string;
    progresoU3: string;
    racha: number;
  }[];
}

export interface DatabaseSchema {
  users: User[];
  units: Unit[];
  lecciones: Record<string, Leccion>;
  retos: Record<string, Reto[]>;
  progressRecords: ProgressRecord[];
  attempts: Attempt[];
  logros: Logro[];
  docenteAnalytics: DocenteAnalytics;
}

// Asegurar que la base de datos se lee de forma segura usando caché en memoria
export function getDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (!fs.existsSync(DB_PATH)) {
      return {
        users: [],
        units: [],
        lecciones: {},
        retos: {},
        progressRecords: [],
        attempts: [],
        logros: [],
        docenteAnalytics: {
          masteryAverage: 0,
          masteryDiff: 0,
          activeCount: 0,
          activeDiff: 0,
          challengesCompleted: 0,
          supportNeededCount: 0,
          dificultades: [],
          unidadesAvance: [],
          estudiantesApoyo: [],
          estudiantesAvance: []
        }
      };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    memoryDb = JSON.parse(data) as DatabaseSchema;
    return memoryDb!;
  } catch (error) {
    console.error('Error leyendo la base de datos:', error);
    throw error;
  }
}

export function saveDb(db: DatabaseSchema): void {
  // Actualizar siempre la caché en memoria para que las consultas subsecuentes sean reactivas
  memoryDb = db;

  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    // En entornos de solo lectura (como Vercel Serverless), la escritura fallará.
    // Capturamos el error para que la aplicación siga funcionando usando la caché en memoria.
    console.warn('Advertencia: El sistema de archivos es de solo lectura. Los cambios se mantendrán en memoria para la demostración.', error);
  }
}

// Helpers
export function getUsers(): User[] {
  return getDb().users;
}

export function getUserById(id: string): User | undefined {
  return getDb().users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function addUser(email: string, name: string, role: 'student' | 'teacher'): User {
  const db = getDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const newUser: User = {
    id: `${role === 'student' ? 'val' : 'tea'}-${Date.now()}`,
    email: email.toLowerCase(),
    name,
    role,
    avatar: role === 'student' ? 'avatar_val.png' : 'teacher_carlos.png',
    ...(role === 'student' ? { racha: 0, rachaLastUpdated: new Date().toISOString() } : {})
  };

  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

export function getUnitsForUser(userId: string): Unit[] {
  const db = getDb();
  // El progreso real del usuario se calcula a partir de sus progressRecords
  const userProgress = db.progressRecords.filter((pr) => pr.userId === userId);

  return db.units.map((unit) => {
    // Para enteros y racionales (u1)
    if (unit.id === 'u1') {
      const habilidades = unit.habilidades.map(h => ({ ...h, completa: true }));
      return { ...unit, estado: 'completa', progreso: 100, habilidades };
    }
    
    // Para las otras unidades, mapeamos el estado real del usuario
    let completas = 0;
    const habilidades = unit.habilidades.map((hab) => {
      const record = userProgress.find((pr) => pr.habilidadId === hab.id && pr.completa);
      if (record) completas++;
      return {
        ...hab,
        completa: !!record
      };
    });

    const percent = Math.round((completas / habilidades.length) * 100);
    let estado: Unit['estado'] = 'bloqueada';

    // Lógica para desbloquear
    if (unit.id === 'u2') {
      estado = percent === 100 ? 'completa' : 'en-progreso';
    } else if (unit.id === 'u3') {
      // Se desbloquea si la Unidad 2 está iniciada o avanzada
      estado = percent === 100 ? 'completa' : (percent > 0 ? 'en-progreso' : 'iniciada');
    } else if (unit.id === 'u4') {
      // Bloqueada hasta avanzar en ecuaciones
      const u3Prog = userProgress.filter(pr => pr.habilidadId.startsWith('h3-') && pr.completa).length;
      estado = u3Prog >= 2 ? 'iniciada' : 'bloqueada';
    }

    return {
      ...unit,
      progreso: percent,
      estado,
      habilidades
    };
  });
}

export function getLeccionById(id: string): Leccion | undefined {
  return getDb().lecciones[id];
}

export function getRetosByLeccionId(leccionId: string): Reto[] {
  return getDb().retos[leccionId] || [];
}

export function getRetoById(id: string): Reto | undefined {
  const db = getDb();
  for (const list of Object.values(db.retos)) {
    const found = list.find((r) => r.id === id);
    if (found) return found;
  }
  return undefined;
}

export function submitRetoAttempt(
  userId: string,
  retoId: string,
  habilidadId: string,
  passed: boolean
) {
  const db = getDb();
  const now = new Date().toISOString();
  
  // Buscar intento existente de este reto
  let attempt = db.attempts.find((a) => a.userId === userId && a.retoId === retoId);
  
  if (attempt) {
    attempt.intentos += 1;
    attempt.passed = passed;
    attempt.updatedAt = now;
  } else {
    attempt = {
      id: `att-${Date.now()}`,
      userId,
      habilidadId,
      retoId,
      passed,
      intentos: 1,
      createdAt: now,
      updatedAt: now
    };
    db.attempts.push(attempt);
  }

  // Si pasó, actualizar el progreso de la habilidad
  if (passed) {
    let progress = db.progressRecords.find(
      (pr) => pr.userId === userId && pr.habilidadId === habilidadId
    );
    
    if (progress) {
      progress.completa = true;
      progress.intentos = attempt.intentos;
      progress.updatedAt = now;
    } else {
      progress = {
        id: `pr-${Date.now()}`,
        userId,
        habilidadId,
        completa: true,
        intentos: attempt.intentos,
        createdAt: now,
        updatedAt: now
      };
      db.progressRecords.push(progress);
    }

    // Actualizar racha
    const user = db.users.find((u) => u.id === userId);
    if (user && user.role === 'student') {
      const todayStr = now.split('T')[0];
      const lastUpdatedStr = user.rachaLastUpdated ? user.rachaLastUpdated.split('T')[0] : '';
      
      if (lastUpdatedStr !== todayStr) {
        // Si es un día diferente, incrementar racha
        user.racha = (user.racha || 0) + 1;
        user.rachaLastUpdated = now;
      }
    }
  }

  saveDb(db);
  return attempt;
}

export function getLogrosForUser(userId: string): Logro[] {
  return getDb().logros.filter((l) => l.userId === userId);
}

export function unlockLogroForUser(
  userId: string,
  tipo: string,
  titulo: string,
  descripcion: string,
  icono: string,
  color: string
): Logro | undefined {
  const db = getDb();
  // Verificar si ya está desbloqueado
  const existing = db.logros.find((l) => l.userId === userId && l.tipo === tipo);
  if (existing) return existing;

  const newLogro: Logro = {
    id: `logro-${Date.now()}`,
    userId,
    tipo,
    titulo,
    descripcion,
    icono,
    color,
    unlockedAt: new Date().toISOString()
  };

  db.logros.push(newLogro);
  saveDb(db);
  return newLogro;
}

export function getDocenteAnalytics(): DocenteAnalytics {
  const db = getDb();
  const students = db.users.filter(u => u.role === 'student');
  
  // 1. Calcular estudiantesAvance dinámicamente
  const estudiantesAvance = students.map(student => {
    const prs = db.progressRecords.filter(pr => pr.userId === student.id && pr.completa);
    
    // Contar completadas por unidad
    const u1Count = prs.filter(pr => pr.habilidadId.startsWith('h1-')).length;
    const u2Count = prs.filter(pr => pr.habilidadId.startsWith('h2-')).length;
    const u3Count = prs.filter(pr => pr.habilidadId.startsWith('h3-')).length;
    
    return {
      id: student.id,
      nombre: student.name,
      email: student.email,
      progresoU1: `${Math.round((u1Count / 4) * 100)}%`,
      progresoU2: `${Math.round((u2Count / 5) * 100)}%`,
      progresoU3: `${Math.round((u3Count / 6) * 100)}%`,
      racha: student.racha || 0
    };
  });

  // 2. Calcular estudiantesApoyo (estudiantes que necesitan apoyo)
  // Estudiantes con intentos >= 3 y que NO han completado la habilidad
  const estudiantesApoyo: { name: string; habilidad: string; intentos: number }[] = [];
  
  const studentIds = students.map(s => s.id);
  const allAttempts = db.attempts.filter(att => studentIds.includes(att.userId));
  
  // Agrupar intentos por (userId, habilidadId)
  const attemptMap: Record<string, { intentos: number; passed: boolean; userId: string; habilidadId: string }> = {};
  allAttempts.forEach(att => {
    const key = `${att.userId}_${att.habilidadId}`;
    if (!attemptMap[key] || attemptMap[key].intentos < att.intentos) {
      attemptMap[key] = {
        intentos: att.intentos,
        passed: att.passed,
        userId: att.userId,
        habilidadId: att.habilidadId
      };
    }
  });

  // Encontrar el nombre de la habilidad por su ID
  const findHabilidadNombre = (habilidadId: string): string => {
    for (const unit of db.units) {
      const found = unit.habilidades.find(h => h.id === habilidadId);
      if (found) return found.nombre;
    }
    return 'Tema de Álgebra';
  };

  Object.values(attemptMap).forEach(att => {
    const isCompleted = db.progressRecords.some(pr => pr.userId === att.userId && pr.habilidadId === att.habilidadId && pr.completa);
    if (!isCompleted && att.intentos >= 3) {
      const student = db.users.find(u => u.id === att.userId);
      if (student) {
        estudiantesApoyo.push({
          name: student.name,
          habilidad: findHabilidadNombre(att.habilidadId),
          intentos: att.intentos
        });
      }
    }
  });

  // Ordenar estudiantesApoyo por número de intentos descendente
  estudiantesApoyo.sort((a, b) => b.intentos - a.intentos);

  // 3. Calcular dificultades (Temas con más dificultad)
  const dificultadCounts: Record<string, { tema: string; count: number }> = {};
  estudiantesApoyo.forEach(ea => {
    if (!dificultadCounts[ea.habilidad]) {
      dificultadCounts[ea.habilidad] = { tema: ea.habilidad, count: 0 };
    }
    dificultadCounts[ea.habilidad].count += 1; // Contar número de alumnos con dificultades
  });

  const dificultades = Object.values(dificultadCounts)
    .map(dc => {
      let color: 'amber' | 'blue' | 'green' = 'green';
      if (dc.count >= 2) color = 'amber';
      else if (dc.count >= 1) color = 'blue';
      
      return {
        tema: dc.tema,
        intentosMasDeDos: dc.count,
        color
      };
    })
    .sort((a, b) => b.intentosMasDeDos - a.intentosMasDeDos);

  // Rellenar con algunas dificultades por defecto del seed si es necesario
  if (dificultades.length === 0) {
    dificultades.push(
      { tema: "Propiedad distributiva", intentosMasDeDos: 2, color: "amber" },
      { tema: "Términos semejantes", intentosMasDeDos: 1, color: "blue" }
    );
  }

  // 4. Calcular avance promedio de unidades (unidadesAvance)
  const unidadesAvance = db.units.map(unit => {
    let totalProgress = 0;
    students.forEach(student => {
      if (unit.id === 'u1') {
        const prs = db.progressRecords.filter(pr => pr.userId === student.id && pr.habilidadId.startsWith('h1-') && pr.completa);
        totalProgress += (prs.length / 4) * 100;
        return;
      }
      const prs = db.progressRecords.filter(pr => pr.userId === student.id && pr.habilidadId.startsWith(unit.id) && pr.completa);
      totalProgress += (prs.length / unit.habilidades.length) * 100;
    });

    const avgProgress = Math.round(totalProgress / students.length);
    let tendencia = '▲ estable';
    if (avgProgress > 80) tendencia = '▲ sube';
    else if (avgProgress > 40) tendencia = '▲ estable';
    else if (avgProgress > 0) tendencia = '△ atención';
    else tendencia = 'no iniciada';

    return {
      nombre: unit.nombre,
      dominio: avgProgress,
      tendencia
    };
  });

  // 5. KPIs globales
  const masteryAverage = Math.round(unidadesAvance.reduce((acc, u) => acc + u.dominio, 0) / unidadesAvance.length);
  const activeCount = students.filter(s => db.attempts.some(att => att.userId === s.id)).length;
  const challengesCompleted = db.attempts.filter(att => att.passed).length + 138; // base offset para demo realista
  const supportNeededCount = estudiantesApoyo.length;

  return {
    masteryAverage,
    masteryDiff: 4,
    activeCount,
    activeDiff: 2,
    challengesCompleted,
    supportNeededCount,
    dificultades,
    unidadesAvance,
    estudiantesApoyo,
    estudiantesAvance
  };
}

export function resetDbToSeed(): void {
  try {
    // Para restablecer, leemos directamente del archivo estático original db.json en el disco
    // y limpiamos la caché en memoria para forzar la recarga
    memoryDb = null;
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    memoryDb = JSON.parse(data) as DatabaseSchema;
    console.log('Base de datos restablecida correctamente al estado semilla original.');
  } catch (error) {
    console.error('Error restableciendo DB:', error);
  }
}
