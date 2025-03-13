import { CalendarData } from "./calendar-data";

export interface EventoLogistica {
  niñoId: string;
  actividadId: string;
  tipo: "llevar" | "recoger";
  hora: string;
  progenitor: string;
  actividad: string;
}

export interface EventoCustodia {
  fecha: Date;
  tipo: "custodia";
  progenitorId: string;
  progenitorNombre: string;
  colorFondo: string;
}

export interface EventoActividad {
  fecha: Date;
  tipo: "logistica";
  subTipo: "llevar" | "recoger";
  niñoId: string;
  niñoNombre: string;
  colorActividad: string;
  actividadId: string;
  actividadNombre: string;
  progenitorId: string;
  progenitorNombre: string;
  descripcion: string;
}

export type EventoCalendario = EventoCustodia | EventoActividad;

/**
 * Determina si una fecha está en una semana par o impar
 * @param fecha - Fecha a evaluar
 * @returns 'par' o 'impar'
 */
export function esSemanaParImpar(fecha: Date): "par" | "impar" {
  // Obtener el número de semana en el año
  const primerDia = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor(
    (fecha.getTime() - primerDia.getTime()) / (24 * 60 * 60 * 1000)
  );
  const numeroSemana = Math.ceil((fecha.getDay() + 1 + dias) / 7);

  return numeroSemana % 2 === 0 ? "par" : "impar";
}

/**
 * Convierte una hora en formato HH:MM a minutos desde medianoche
 * @param hora - Hora en formato HH:MM
 * @returns Minutos desde medianoche
 */
export function convertirHoraAMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map((num) => parseInt(num, 10));
  return horas * 60 + minutos;
}

/**
 * Determina qué progenitor tiene la custodia en una fecha determinada
 * @param fecha - Fecha a evaluar
 * @param regimenTenencia - Objeto con el régimen de tenencia
 * @returns ID del progenitor
 */
export function determinarProgenitorDelDia(
  fecha: Date,
  regimenTenencia: CalendarData["regimenTenencia"]
): string {
  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const diaSemana = diasSemana[fecha.getDay()];
  const esPar = esSemanaParImpar(fecha) === "par";

  return esPar
    ? regimenTenencia.semanasPares[diaSemana]
    : regimenTenencia.semanasImpares[diaSemana];
}

/**
 * Encuentra el nombre de un progenitor por su ID
 * @param id - ID del progenitor
 * @param progenitores - Array de progenitores
 * @returns Nombre del progenitor
 */
export function encontrarNombreProgenitor(
  id: string,
  progenitores: CalendarData["progenitores"]
): string {
  const progenitor = progenitores.find((p) => p.id === id);
  return progenitor ? progenitor.nombre : id;
}

/**
 * Encuentra el color de un progenitor por su ID
 * @param id - ID del progenitor
 * @param progenitores - Array de progenitores
 * @returns Color del progenitor
 */
export function encontrarColorProgenitor(
  id: string,
  progenitores: CalendarData["progenitores"]
): string {
  const progenitor = progenitores.find((p) => p.id === id);
  return progenitor ? progenitor.colorFondo : "#FFFFFF";
}

/**
 * Determina el progenitor responsable de cada evento de recogida y llevada
 * @param fecha - Fecha a evaluar
 * @param regimenTenencia - Objeto con el régimen de tenencia
 * @param actividades - Array con todas las actividades
 * @returns Eventos de logística con el progenitor responsable
 */
export function determinarLogisticaDiaria(
  fecha: Date,
  regimenTenencia: CalendarData["regimenTenencia"],
  actividades: CalendarData["actividades"]
): EventoLogistica[] {
  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const diaSemana = diasSemana[fecha.getDay()];
  const esPar = esSemanaParImpar(fecha) === "par";

  // Determinar progenitor del día actual
  const progenitorHoy = esPar
    ? regimenTenencia.semanasPares[diaSemana]
    : regimenTenencia.semanasImpares[diaSemana];

  // Determinar progenitor del día anterior
  const fechaAnterior = new Date(fecha);
  fechaAnterior.setDate(fecha.getDate() - 1);
  const diaAnterior = diasSemana[fechaAnterior.getDay()];
  const esParAnterior = esSemanaParImpar(fechaAnterior) === "par";

  const progenitorAyer = esParAnterior
    ? regimenTenencia.semanasPares[diaAnterior]
    : regimenTenencia.semanasImpares[diaAnterior];

  // Obtener las actividades de este día de la semana
  const actividadesDiarias: Record<
    string,
    {
      id: string;
      titulo: string;
      inicio: string;
      fin: string;
      tipo: string;
    }[]
  > = {};

  // Agrupar actividades por niño
  actividades.forEach((actividad) => {
    if (
      actividad.diasSemana.includes(diaSemana) &&
      actividad.horarios[diaSemana]
    ) {
      if (!actividadesDiarias[actividad.niñoId]) {
        actividadesDiarias[actividad.niñoId] = [];
      }

      actividadesDiarias[actividad.niñoId].push({
        id: actividad.id,
        titulo: actividad.titulo,
        inicio: actividad.horarios[diaSemana].inicio,
        fin: actividad.horarios[diaSemana].fin,
        tipo: actividad.tipo,
      });
    }
  });

  // Ordenar actividades por hora de inicio
  Object.keys(actividadesDiarias).forEach((niñoId) => {
    actividadesDiarias[niñoId].sort((a, b) => {
      return convertirHoraAMinutos(a.inicio) - convertirHoraAMinutos(b.inicio);
    });
  });

  // Crear eventos de logística
  const eventosLogistica: EventoLogistica[] = [];

  // Para cada niño, procesar sus actividades
  Object.keys(actividadesDiarias).forEach((niñoId) => {
    const actividadesNiño = actividadesDiarias[niñoId];

    if (actividadesNiño.length > 0) {
      // Primera actividad del día - la lleva quien tuvo al niño el día anterior
      const primeraActividad = actividadesNiño[0];
      eventosLogistica.push({
        niñoId: niñoId,
        actividadId: primeraActividad.id,
        tipo: "llevar",
        hora: primeraActividad.inicio,
        progenitor: progenitorAyer,
        actividad: primeraActividad.titulo,
      });

      // Recoger de la primera actividad y las demás las maneja el progenitor del día
      eventosLogistica.push({
        niñoId: niñoId,
        actividadId: primeraActividad.id,
        tipo: "recoger",
        hora: primeraActividad.fin,
        progenitor: progenitorHoy,
        actividad: primeraActividad.titulo,
      });

      // Procesar el resto de actividades del día
      for (let i = 1; i < actividadesNiño.length; i++) {
        const actividad = actividadesNiño[i];

        // Llevar a las siguientes actividades
        eventosLogistica.push({
          niñoId: niñoId,
          actividadId: actividad.id,
          tipo: "llevar",
          hora: actividad.inicio,
          progenitor: progenitorHoy,
          actividad: actividad.titulo,
        });

        // Recoger de las siguientes actividades
        eventosLogistica.push({
          niñoId: niñoId,
          actividadId: actividad.id,
          tipo: "recoger",
          hora: actividad.fin,
          progenitor: progenitorHoy,
          actividad: actividad.titulo,
        });
      }
    }
  });

  // Ordenar todos los eventos por hora
  eventosLogistica.sort((a, b) => {
    return convertirHoraAMinutos(a.hora) - convertirHoraAMinutos(b.hora);
  });

  return eventosLogistica;
}

/**
 * Genera todos los eventos para un rango de fechas
 * @param fechaInicio - Fecha de inicio del rango
 * @param fechaFin - Fecha de fin del rango
 * @param datos - Objeto con los datos de niños, actividades y régimen de tenencia
 * @returns Array con todos los eventos generados
 */
export function generarEventosCalendario(
  fechaInicio: Date,
  fechaFin: Date,
  datos: CalendarData
): EventoCalendario[] {
  const { niños, progenitores, regimenTenencia, actividades } = datos;
  const eventos: EventoCalendario[] = [];

  // Para cada día en el rango
  const fechaActual = new Date(fechaInicio);
  while (fechaActual <= fechaFin) {
    // 1. Determinar el progenitor que tiene la custodia ese día
    const progenitorDia = determinarProgenitorDelDia(
      fechaActual,
      regimenTenencia
    );

    // 2. Determinar los eventos de logística
    const eventosLogistica = determinarLogisticaDiaria(
      fechaActual,
      regimenTenencia,
      actividades
    );

    // 3. Generar evento de custodia para el día
    eventos.push({
      fecha: new Date(fechaActual),
      tipo: "custodia",
      progenitorId: progenitorDia,
      progenitorNombre: encontrarNombreProgenitor(progenitorDia, progenitores),
      colorFondo: encontrarColorProgenitor(progenitorDia, progenitores),
    });

    // 4. Generar eventos de actividades y logística
    eventosLogistica.forEach((evento) => {
      // Convertir la hora a Date
      const fechaHora = new Date(fechaActual);
      const [horas, minutos] = evento.hora
        .split(":")
        .map((num) => parseInt(num, 10));
      fechaHora.setHours(horas, minutos, 0, 0);

      const niño = niños.find((n) => n.id === evento.niñoId);
      const progenitor = progenitores.find((p) => p.id === evento.progenitor);

      eventos.push({
        fecha: fechaHora,
        tipo: "logistica",
        subTipo: evento.tipo,
        niñoId: evento.niñoId,
        niñoNombre: niño ? niño.nombre : evento.niñoId,
        colorActividad: niño ? niño.colorActividad : "#CCCCCC",
        actividadId: evento.actividadId,
        actividadNombre: evento.actividad,
        progenitorId: evento.progenitor,
        progenitorNombre: progenitor ? progenitor.nombre : evento.progenitor,
        descripcion: `${evento.tipo === "llevar" ? "Llevar a" : "Recoger de"} ${
          niño ? niño.nombre : evento.niñoId
        } (${evento.actividad})`,
      });
    });

    // Avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return eventos;
}
