# Guía para configurar un proyecto moderno con Next.js, Tailwind CSS y shadcn/ui

Esta guía ofrece los pasos necesarios para configurar un proyecto moderno con Next.js, Tailwind CSS, shadcn/ui y otras bibliotecas útiles. Sigue estos pasos para tener una base sólida para tus desarrollos.

## 1. Preparación del entorno

```bash
# Crear un directorio para la aplicación
mkdir mi-proyecto

# Navegar al directorio
cd mi-proyecto
```

## 2. Inicializar un proyecto Next.js

```bash
# Crear un proyecto Next.js con TypeScript, Tailwind CSS y ESLint
npx create-next-app@latest . --typescript --tailwind --eslint
```

Opciones recomendadas durante la configuración:

- ¿Quieres tu código dentro de un directorio `src/`? **Sí** (Mejor organización)
- ¿Quieres usar App Router? **Sí** (Recomendado para nuevos proyectos)
- ¿Quieres usar Turbopack? **No** (Todavía en desarrollo, opcional)
- ¿Quieres personalizar el alias de importación? **No** (`@/*` es un buen estándar)

## 3. Instalar dependencias esenciales

```bash
# Instalar bibliotecas de componentes y utilidades
npm install lucide-react date-fns

# Instalar dependencias requeridas para shadcn/ui
npm install @shadcn/ui tailwindcss-animate class-variance-authority clsx next-themes
```

## 4. Configurar shadcn/ui

```bash
# Inicializar shadcn/ui con opciones automatizadas
npx shadcn@latest init
```

Opciones recomendadas:

- Estilo: **Default** (o el que prefieras)
- Color base: **Slate** (o el que prefieras)
- Radio de borde global: **0.5rem**
- CSS variables para colores: **Sí**

Si hay problemas de compatibilidad con React 19 o versiones recientes:

```bash
npx shadcn@latest init --yes --force
```

## 5. Crear estructura básica del proyecto

```bash
# Crear directorios principales (si no existen ya)
mkdir -p src/lib src/components/ui src/components/shared
```

### Estructura recomendada de archivos:

```
mi-proyecto/
├── src/
│   ├── app/               # Rutas y páginas (App Router)
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/            # Componentes de interfaz básicos
│   │   └── shared/        # Componentes compartidos específicos
│   └── lib/               # Utilitarios y funciones auxiliares
└── public/                # Archivos estáticos
```

## 6. Configurar utilidades básicas

Crear archivo `src/lib/utils.ts` con funciones útiles:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Función para combinar clases de Tailwind de manera eficiente
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función para formatear fechas
export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Función para generar IDs únicos
export const generateId = () => Math.random().toString(36).substring(2, 9);
```

## 7. Personalizar Tailwind CSS

Editar el archivo `tailwind.config.js` para añadir colores personalizados, fuentes o plugins:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Agrega tus colores personalizados
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Puedes añadir más colores personalizados
      },
      fontFamily: {
        // Configura fuentes personalizadas
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Añade otros plugins si los necesitas
  ],
};
```

## 8. Crear páginas de ejemplo y navegación

Modificar `src/app/page.tsx` para crear una página inicial simple:

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <header className="max-w-screen-xl mx-auto py-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          Mi Aplicación
        </h1>
      </header>

      <main className="max-w-screen-xl mx-auto">
        {/* Contenido principal */}
        <p className="text-center text-gray-500 mt-2">
          Proyecto inicializado con Next.js, Tailwind CSS y shadcn/ui
        </p>
      </main>
    </div>
  );
}
```

## 9. Instalar y configurar componentes de shadcn/ui

```bash
# Instalar algunos componentes básicos
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

## 10. Consideraciones para desarrollos robustos

### Convenciones de nomenclatura

- **Componentes**: PascalCase (ej. `CalendarioMensual.tsx`)
- **Utilidades y hooks**: camelCase (ej. `useFormatDate.ts`)
- **Nombres acordes a la funcionalidad**: Usar nombres descriptivos que reflejen el propósito real

### Estructura de componentes recomendada

```tsx
// Estructura básica de un componente
"use client"; // Si el componente necesita interactividad

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Definir las props con TypeScript
interface MiComponenteProps {
  titulo: string;
  variante?: "primaria" | "secundaria";
  onClick?: () => void;
}

export const MiComponente: React.FC<MiComponenteProps> = ({
  titulo,
  variante = "primaria",
  onClick,
}) => {
  // Estado local
  const [isActive, setIsActive] = useState(false);

  // Lógica del componente
  const handleClick = () => {
    setIsActive(!isActive);
    if (onClick) onClick();
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg transition-all",
        variante === "primaria" ? "bg-blue-100" : "bg-gray-100",
        isActive && "ring-2 ring-blue-400"
      )}
      onClick={handleClick}
    >
      <h2 className="text-lg font-medium">{titulo}</h2>
    </div>
  );
};
```

### Diseño responsive

- Usar un enfoque "mobile-first"
- Utilizar los modificadores de Tailwind (`sm:`, `md:`, `lg:`)
- Probar en diferentes tamaños de pantalla

```tsx
<div className="flex flex-col sm:flex-row items-center">
  <div className="w-full sm:w-1/2 p-2 sm:p-4">{/* Contenido */}</div>
</div>
```

### Solución de problemas comunes

1. **Errores de ESLint**:

   - Verificar y corregir variables no utilizadas
   - Asegurar importaciones correctas
   - Ejecutar `npm run lint` para revisar errores

2. **Incompatibilidad de iconos**:

   - Verificar que los iconos existan en la versión de lucide-react instalada
   - Consultar la documentación actualizada para nombres correctos

3. **Optimización de rendimiento**:

   - Utilizar `useMemo` y `useCallback` para componentes complejos
   - Memoizar funciones y valores calculados
   - Evitar re-renderizados innecesarios

4. **Mejora continua de la UI**:
   - Añadir estados hover, focus, y active para elementos interactivos
   - Usar transiciones suaves entre estados
   - Implementar feedback visual para acciones del usuario

## 11. Despliegue en Vercel

### Instalación de la CLI de Vercel

```bash
# Instalar la CLI de Vercel globalmente
npm install -g vercel
```

### Despliegue de la aplicación

```bash
# Navegar al directorio del proyecto
cd mi-proyecto

# Desplegar una versión de vista previa
vercel

# Desplegar a producción
vercel --prod
```

Durante el proceso de despliegue, Vercel te guiará a través de:

1. Configuración inicial (la primera vez)
2. Vinculación con un proyecto existente o creación de uno nuevo
3. Configuración de variables de entorno si es necesario

### Optimizaciones para el despliegue

- **Configuración de dominio personalizado**: Desde el dashboard de Vercel, ve a tu proyecto > Settings > Domains
- **Mejoras de rendimiento**: Vercel aplica automáticamente optimizaciones como:
  - Compresión de imágenes
  - Edge CDN para servir contenido rápidamente
  - Minificación automática de JavaScript y CSS
- **Consideraciones de responsividad**: Asegura que tu interfaz sea responsive para todos los dispositivos antes de desplegar a producción

### Monitoreo y análisis

- Consulta las analíticas desde el dashboard de Vercel
- Configura integraciones con herramientas como Google Analytics o Sentry
- Revisa los logs de construcción y despliegue en caso de errores

## Recursos útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Componentes de shadcn/ui](https://ui.shadcn.com/docs)
- [Iconos de Lucide React](https://lucide.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Documentación de Vercel](https://vercel.com/docs)

# Documentación del Calendario Familiar

## Componentes Implementados

Este proyecto contiene los siguientes componentes principales:

### 1. CalendarioMensual (`app/src/components/ui/calendar/calendario-mensual.tsx`)

El componente principal que muestra el calendario mensual con la siguiente funcionalidad:

- Vista de días laborables (lunes a viernes)
- Visualización de eventos de custodia con colores diferenciados
- Navegación entre meses
- Estilo visual de "post-it" para los días
- Efecto de resaltado para el día actual

### 2. InfoFinDeSemana (`app/src/components/ui/calendar/info-fin-de-semana.tsx`)

Componente que muestra información sobre los fines de semana:

- Aparece junto a cada viernes del mes
- Muestra la información del sábado y domingo siguientes
- Indica qué progenitor tendrá la custodia ese fin de semana
- Utiliza el color de fondo correspondiente al progenitor
- Incluye un clip decorativo con rotación aleatoria

## Utilidades y Datos

### calendar-data.ts

Contiene los datos estructurados del calendario:

- Información de los niños (Clara y Vico)
- Información de los progenitores (Mamá y Papá)
- Régimen de custodia según semanas pares e impares
- Actividades programadas con sus horarios

### calendar-utils.ts

Implementa la lógica del calendario:

- Determinación del progenitor responsable según el día
- Cálculo de eventos de logística (llevar/recoger)
- Generación de todos los eventos para un rango de fechas

## Características Visuales

- **Diseño de Post-it**: Los días se presentan como notas adhesivas
- **Rotación aleatoria pero consistente**: Cada día tiene una pequeña inclinación
- **Colores diferenciados**: Verde para papá, violeta para mamá
- **Animaciones sutiles**: El día actual tiene una sombra animada
- **Clips decorativos**: Los post-its de fin de semana incluyen un clip visual

## Guía de Mantenimiento

### Para agregar nuevas actividades

Actualizar el objeto `actividades` en `calendar-data.ts` con el siguiente formato:

```typescript
{
  "id": "nueva-actividad",
  "titulo": "Nueva Actividad",
  "niñoId": "clara", // o "vico"
  "tipo": "deporte", // usar uno de los tipos existentes
  "icono": "sports_soccer",
  "diasSemana": ["lunes", "miercoles"],
  "horarios": {
    "lunes": { "inicio": "16:00", "fin": "17:30" },
    "miercoles": { "inicio": "16:00", "fin": "17:30" }
  }
}
```

### Para modificar el régimen de custodia

Actualizar la estructura en `calendar-data.ts`:

```typescript
"regimenTenencia": {
  "semanasPares": {
    // Modificar los días según sea necesario
    "lunes": "papa",
    // ...
  },
  "semanasImpares": {
    // Modificar los días según sea necesario
    "lunes": "mama",
    // ...
  }
}
```

## Posibles Mejoras Futuras

1. Añadir persistencia de datos (local o remoto)
2. Implementar un editor visual para el régimen de custodia
3. Agregar sistema de notificaciones para eventos importantes
4. Desarrollar vista semanal más detallada
5. Permitir exportar/importar datos del calendario
