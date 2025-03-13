# Calendario Familiar con Régimen de Custodia y Actividades

Este proyecto implementa un calendario visual interactivo diseñado para familias con régimen de custodia compartida, permitiendo visualizar fácilmente cuándo los niños están con cada progenitor y todas sus actividades programadas.

## Características Principales

- **Visualización mensual** con diseño tipo "post-it" para días y eventos
- **Régimen de custodia** claramente visualizado con colores diferenciados
- **Actividades de los niños** organizadas cronológicamente
- **Eventos de logística** (quién lleva/recoge a cada niño)
- **Información de fin de semana** como post-its adicionales
- **Navegación** entre meses con botones intuitivos

## Vista Previa

El calendario muestra:

- Fondo de color para cada día según el progenitor responsable (verde para papá, violeta para mamá)
- Actividades ordenadas cronológicamente para Clara (rosa) y Vico (celeste)
- Iconos para llevar/recoger a los niños de sus actividades
- Post-its laterales con información del fin de semana

## Implementación Técnica

El proyecto está desarrollado con:

- **Next.js** como framework frontend
- **Tailwind CSS** para estilos y diseño responsive
- **TypeScript** para desarrollo tipado
- **Componentes React** modulares y reutilizables

## Estructura del Proyecto

```
app/
├── src/
│   ├── app/
│   ├── components/ui/
│   │   └── calendar/     # Componentes del calendario
│   │       ├── calendario-mensual.tsx
│   │       └── info-fin-de-semana.tsx
│   └── lib/
│       ├── calendar-data.ts   # Datos de custodia y actividades
│       └── calendar-utils.ts  # Funciones de utilidad
```

## Lógica de Negocio

### Régimen de Custodia

El sistema implementa un régimen de custodia basado en semanas pares e impares:

- **Semanas pares**: Los domingos con mamá, lunes con papá, martes y miércoles con mamá, jueves con mamá, viernes y sábado con papá
- **Semanas impares**: Los domingos con papá, lunes con mamá, martes y miércoles con mamá, jueves con papá, viernes y sábado con mamá

### Actividades Programadas

Incluye un conjunto de actividades recurrentes para los niños:

- Horarios escolares
- Clases de inglés
- Deportes (fútbol)
- Actividades artísticas (baile)
- Educación física

Cada actividad tiene información de quién debe llevar y recoger al niño.

## Documentación Detallada

Para detalles técnicos sobre la implementación, configuración del proyecto y guías de mantenimiento, consulta [dev.md](./dev.md).

## Uso

Para ejecutar este proyecto localmente:

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   cd app
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Mejoras Futuras

- Persistencia de datos (guardado local o en nube)
- Editor visual del régimen de custodia
- Añadir notificaciones para eventos importantes
- Vista alternativa semanal con más detalles
- Exportación/importación del calendario
