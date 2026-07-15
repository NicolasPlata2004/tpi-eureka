# Eureka — Plataforma Educativa de Álgebra

**Eureka** es una plataforma gamificada diseñada para estudiantes de grado 8° en Colombia, enfocada exclusivamente en facilitar la transición de la aritmética al álgebra. Su propósito principal es reducir la ansiedad matemática a través de un enfoque de mentalidad de crecimiento, convirtiendo el error en una oportunidad de aprendizaje constructivo.

## Características de la Aplicación

- **Física de Balanza Interactiva:** Despeja ecuaciones mediante arrastre de fichas (Drag-and-Drop) utilizando eventos de puntero unificados para máxima fluidez y compatibilidad con pantallas táctiles móviles.
- **Mentalidad de Crecimiento:** Retroalimentación reflexiva (en color ámbar △) al cometer errores, guiando al estudiante a encontrar la solución por sí mismo sin mensajes punitivos.
- **Árbol de Habilidades Individual:** Progreso personal libre de tablas de posiciones públicas o competencia para reducir el estrés.
- **Panel Docente Privado:** Analíticas de rendimiento grupal en tiempo real, KPIs de participación, gráficos de dificultad e informes exportables en formato CSV.
- **Optimización Móvil y de Conectividad:** Diseñado mobile-first y optimizado para funcionar en conexiones lentas de internet (0.5 Mbps) típicas de colegios rurales colombianos.

---

## Tecnologías Utilizadas

- **Frontend/Backend:** Next.js 15+ (App Router) con TypeScript
- **Estilos:** Tailwind CSS (v4) + Fuentes de Google (Lexend & Spline Sans Mono)
- **Persistencia:** Base de datos local ligera en formato JSON (`data/db.json`) para máxima portabilidad sin dependencias externas.

---

## Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

---

## Cómo Probar los Flujos Clave

1. Abre la aplicación e ingresa a **"Empezar gratis"** en la Landing Page.
2. En la pantalla de acceso para desarrollo (`/auth/dev-login`), selecciona una cuenta de prueba:
   - **Valentina (Estudiante):** Para ver el árbol de habilidades, racha de días, ver lecciones con reproductor Manim simulado y resolver el reto interactivo de la balanza.
   - **Profesor Carlos (Docente):** Para acceder al panel docente privado, ver estadísticas de dificultad y descargar la lista de alumnos en formato CSV.

---

## Cómo Contribuir (y ver los cambios en Vercel)

Si quieres ayudar a mejorar Eureka o probar cambios en el código, el proceso es muy sencillo gracias a nuestra integración continua con Vercel. 

Dependiendo de si eres un colaborador externo o miembro directo del equipo, el flujo cambia ligeramente:

### Opción A: Eres Colaborador Directo del Repositorio
Si Nicolás ya te agregó como colaborador en GitHub:
1. **Clona el repositorio**: `git clone https://github.com/NicolasPlata2004/tpi-eureka.git`
2. **Crea una nueva rama**: No trabajes directo en `main`. Crea una rama local para tus cambios (ej. `git checkout -b mejora-interfaz`).
3. **Sube tus cambios y abre un Pull Request (PR)**: Haz un `git push origin mejora-interfaz` y ve a GitHub para abrir el Pull Request hacia la rama `main`.
4. **Visualiza tus cambios en Vercel**: El bot de Vercel comentará en tu PR con un enlace de "Preview Deployment". Úsalo para probar tus cambios.
5. **Merge a Producción**: Una vez aprobado, haz el merge a `main` y Vercel lo mandará directo a la web principal.

### Opción B: Eres un Contribuidor Externo (Sin acceso de escritura)
1. **Haz un Fork del repositorio**: Crea una copia del proyecto en tu propia cuenta de GitHub.
2. **Crea una nueva rama**: Trabaja tus cambios en una rama local (ej. `git checkout -b mejora-interfaz`).
3. **Sube tus cambios y abre un Pull Request (PR)**: Cuando estés listo, haz un push a tu fork y abre un Pull Request hacia la rama `main` de este repositorio original.
4. **Visualiza tus cambios en Vercel (Preview Deployment)**: Una vez que abras el Pull Request, Vercel detectará automáticamente los cambios y generará un enlace temporal. Podrás encontrar este enlace en los comentarios automáticos del bot de Vercel dentro de tu mismo Pull Request. ¡Así todo el equipo podrá ver y probar tus cambios en vivo antes de que sean aprobados!
5. **Aprobación y Despliegue a Producción**: Si tus cambios son revisados y aprobados, se fusionarán (merge) a la rama `main`. Vercel desplegará automáticamente esta nueva versión oficial en [tpi-eureka.vercel.app](https://tpi-eureka.vercel.app/).
