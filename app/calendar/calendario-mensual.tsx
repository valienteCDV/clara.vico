"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { calendarData } from "../lib/calendar-data";
import {
  EventoCalendario,
  generarEventosCalendario,
  EventoCustodia,
  EventoActividad,
} from "../lib/calendar-utils";
import { InfoFinDeSemana } from "./info-fin-de-semana";

// Componente para mostrar indicadores de distribución de días
interface IndicadorDistribucionProps {
  eventos: EventoCalendario[];
  fechaActual: Date;
}

const IndicadorDistribucion: React.FC<IndicadorDistribucionProps> = ({
  eventos,
  fechaActual,
}) => {
  // Función para calcular estadísticas por progenitor
  const calcularEstadisticas = () => {
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();

    // Filtrar eventos del mes actual
    const eventosMes = eventos.filter(
      (evento) =>
        evento.fecha.getMonth() === mesActual &&
        evento.fecha.getFullYear() === añoActual
    );

    // Filtrar eventos de custodia
    const eventosCustodia = eventosMes.filter(
      (evento) => evento.tipo === "custodia"
    ) as EventoCustodia[];

    // Total de días en el mes
    const diasTotales = eventosCustodia.length;

    // Inicializar contadores por progenitor
    const diasPorProgenitor = {
      mama: 0,
      papa: 0,
    };

    // Contar días por progenitor
    eventosCustodia.forEach((evento) => {
      if (evento.progenitorId === "mama" || evento.progenitorId === "papa") {
        diasPorProgenitor[evento.progenitorId]++;
      }
    });

    // Filtrar eventos de logística
    const eventosLogistica = eventosMes.filter(
      (evento) => evento.tipo === "logistica"
    );

    // Contador de eventos por progenitor
    const eventosPorProgenitor = {
      mama: 0,
      papa: 0,
    };

    // Asociar eventos de logística con el progenitor del día
    eventosLogistica.forEach((evento) => {
      // Encontrar qué progenitor tiene la custodia ese día
      const fecha = new Date(evento.fecha);
      fecha.setHours(0, 0, 0, 0); // Normalizar la hora a medianoche

      // Buscar el evento de custodia para este día
      const custodiaDia = eventosCustodia.find(
        (ec) =>
          ec.fecha.getDate() === fecha.getDate() &&
          ec.fecha.getMonth() === fecha.getMonth() &&
          ec.fecha.getFullYear() === fecha.getFullYear()
      );

      if (
        custodiaDia &&
        (custodiaDia.progenitorId === "mama" ||
          custodiaDia.progenitorId === "papa")
      ) {
        eventosPorProgenitor[custodiaDia.progenitorId]++;
      }
    });

    return {
      diasTotales,
      diasPorProgenitor,
      eventosPorProgenitor,
    };
  };

  const { diasTotales, diasPorProgenitor } = calcularEstadisticas();

  // No mostrar nada si no hay datos para el mes
  if (diasTotales === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {/* Indicadores para Mamá */}
      <div
        className="flex items-center px-3 py-1.5 shadow-md transition-transform hover:scale-105"
        style={{
          backgroundColor: "#E6D6FF",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <span className="font-semibold mr-1">Mamá:</span>
        <span className="mx-1 text-sm">
          {diasPorProgenitor.mama} días (
          {Math.round((diasPorProgenitor.mama / diasTotales) * 100)}%)
        </span>
      </div>

      {/* Indicadores para Papá */}
      <div
        className="flex items-center px-3 py-1.5 shadow-md transition-transform hover:scale-105"
        style={{
          backgroundColor: "#D6FFE6",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <span className="font-semibold mr-1">Papá:</span>
        <span className="mx-1 text-sm">
          {diasPorProgenitor.papa} días (
          {Math.round((diasPorProgenitor.papa / diasTotales) * 100)}%)
        </span>
      </div>
    </div>
  );
};

// Nombres de los días de la semana completos
const nombresDiasCompletos = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Nombres de los días de la semana abreviados
const nombresDiasAbreviados = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Días laborables que queremos mostrar (1 = lunes, 5 = viernes)
const diasLaborables = [1, 2, 3, 4, 5];

// Función auxiliar para obtener el número de días en un mes
const obtenerDiasMes = (fecha: Date) => {
  const año = fecha.getFullYear();
  const mes = fecha.getMonth();
  return new Date(año, mes + 1, 0).getDate();
};

const nombresMeses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const nombresMesesAbreviados = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// Componente de celda para un día del calendario
interface DiaCeldaProps {
  fecha?: Date;
  eventos: EventoCalendario[];
  esDiaActual: boolean;
  esOtroMes?: boolean;
  animar?: boolean;
}

const DiaCelda: React.FC<DiaCeldaProps> = ({
  fecha,
  eventos,
  esDiaActual,
  esOtroMes = false,
  animar = false,
}) => {
  if (!fecha) {
    return <div className="min-h-40"></div>;
  }

  // Filtrar eventos solo para este día específico
  const eventosDia = eventos.filter((evento) => {
    // Comprobar que las fechas sean del mismo día
    return (
      evento.fecha.getDate() === fecha.getDate() &&
      evento.fecha.getMonth() === fecha.getMonth() &&
      evento.fecha.getFullYear() === fecha.getFullYear()
    );
  });

  // Encontrar el evento de custodia para este día
  const eventoCustodia = eventosDia.find(
    (evento) => evento.tipo === "custodia"
  );

  // Obtener el nombre del día de la semana
  const diaSemana = nombresDiasCompletos[fecha.getDay()];

  // Generar rotación aleatoria pero consistente basada en el día del mes
  const rotacion =
    fecha.getDate() % 3 === 0
      ? "2deg"
      : fecha.getDate() % 3 === 1
      ? "3deg"
      : "0.5deg";

  // Preparamos los estilos y clases para el efecto post-it
  const backgroundColor =
    eventoCustodia && eventoCustodia.tipo === "custodia"
      ? eventoCustodia.colorFondo
      : esOtroMes
      ? "#F3F3F370" // Color gris claro para días de otro mes
      : "#fffdf7"; // Color crema suave para el post-it del mes actual

  // Construimos las clases CSS
  const postItClasses = [
    "post-it",
    esDiaActual ? "dia-actual" : "",
    animar ? "sacudir-post-it" : "",
    "h-auto min-h-40 overflow-y-hidden hover:overflow-y-auto hover:shadow-lg flex flex-col",
    esDiaActual ? "ring-2 ring-offset-2 ring-blue-400" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Propiedades de estilo que necesitamos aplicar directamente
  const postItStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    opacity: esOtroMes ? 0.6 : 1,
    "--rotacion-inicial": rotacion,
    "--post-it-color": backgroundColor, // Añadimos la variable CSS para el color del post-it
    maxHeight: "200px",
    overflowX: "hidden", // Evitamos el scroll horizontal
  } as React.CSSProperties;

  // Filtramos solo eventos de logística
  const eventosLogistica = eventosDia.filter(
    (evento) => evento.tipo === "logistica"
  );

  // Agrupamos eventos por actividadId
  const eventosPorActividad: Record<string, EventoActividad[]> = {};

  eventosLogistica.forEach((evento) => {
    if (evento.tipo !== "logistica") return;

    if (!eventosPorActividad[evento.actividadId]) {
      eventosPorActividad[evento.actividadId] = [];
    }

    eventosPorActividad[evento.actividadId].push(evento as EventoActividad);
  });

  // Determinar si hay muchos eventos (más de 4)
  const cantidadEventos = Object.keys(eventosPorActividad).length;
  const tieneMuchosEventos = cantidadEventos > 4;

  return (
    <div className={postItClasses} style={postItStyle}>
      <div className="flex justify-center items-start border-b border-gray-400">
        <div
          className={`font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-sm md:text-base ${
            esOtroMes ? "text-gray-400" : ""
          }`}
        >
          {/* Versión completa para pantallas medianas y grandes */}
          <span className="hidden sm:inline">
            {diaSemana} {fecha.getDate()} de {nombresMeses[fecha.getMonth()]}
          </span>

          {/* Versión abreviada para pantallas pequeñas */}
          <span className="sm:hidden">
            {nombresDiasAbreviados[fecha.getDay()]} {fecha.getDate()}{" "}
            {nombresMesesAbreviados[fecha.getMonth()]}
          </span>
        </div>
      </div>

      {/* Nombre de progenitor discreto en la esquina inferior derecha detrás de los eventos */}
      {eventoCustodia && eventoCustodia.tipo === "custodia" && (
        <div
          className="absolute left-0 right-0 bottom-0 flex justify-center z-10"
          style={{ pointerEvents: "none" }}
        >
          <span className="text-xs text-gray-400">
            {eventoCustodia.progenitorNombre}
          </span>
        </div>
      )}

      <div className="flex-grow relative">
        {/* Renderizar todos los eventos agrupados por actividad */}
        <div
          className={`mt-2 relative z-10 ${
            tieneMuchosEventos ? "space-y-0" : "space-y-1"
          }`}
        >
          {(() => {
            // Procesamos cada grupo de eventos
            return Object.entries(eventosPorActividad).map(
              ([actividadId, eventos], index) => {
                // Ordenamos los eventos por hora
                eventos.sort((a, b) => {
                  const aMinutos =
                    a.fecha.getHours() * 60 + a.fecha.getMinutes();
                  const bMinutos =
                    b.fecha.getHours() * 60 + b.fecha.getMinutes();
                  return aMinutos - bMinutos;
                });

                // Encontramos los eventos de llevar y recoger
                const eventoLlevar = eventos.find(
                  (e) => e.subTipo === "llevar"
                );
                const eventoRecoger = eventos.find(
                  (e) => e.subTipo === "recoger"
                );

                // Si no tenemos ambos eventos, no mostramos nada
                if (!eventoLlevar || !eventoRecoger) return null;

                const horaInicio = eventoLlevar.fecha
                  .getHours()
                  .toString()
                  .padStart(2, "0");
                const horaFin = eventoRecoger.fecha
                  .getHours()
                  .toString()
                  .padStart(2, "0");

                // Determinar la clase según el niño
                const claseNiño =
                  eventoLlevar.niñoId === "vico"
                    ? "evento-vico"
                    : "evento-clara";

                return (
                  <div
                    key={actividadId}
                    className={`flex items-center text-xs transition-all hover:scale-105 shadow-sm overflow-hidden max-w-full ${
                      tieneMuchosEventos ? "p-0.5 mb-0.5" : "p-1 mb-1"
                    } ${claseNiño}`}
                    style={{
                      marginTop:
                        tieneMuchosEventos && index > 0 ? "-4px" : "0px",
                    }}
                  >
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {horaInicio}a{horaFin} {eventoLlevar.actividadNombre}
                    </span>
                  </div>
                );
              }
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// Componente principal del calendario
export const CalendarioMensual: React.FC = () => {
  // Estado para controlar cuándo animar los post-its
  const [debeAnimar, setDebeAnimar] = useState(false);
  const [animacionCargaPagina, setAnimacionCargaPagina] = useState(true);

  // Estado para la animación de transición entre meses
  const [direccionTransicion, setDireccionTransicion] = useState<
    "izquierda" | "derecha" | null
  >(null);
  const [animandoTransicion, setAnimandoTransicion] = useState(false);

  // Estado para la fecha actual del calendario
  const [fechaActual, setFechaActual] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const avanzarMes = useCallback(() => {
    // Prevenimos múltiples clics durante la animación
    if (animandoTransicion) return;

    setDireccionTransicion("izquierda");
    setFechaActual(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, [animandoTransicion, setDireccionTransicion, setFechaActual]);

  const retrocederMes = useCallback(() => {
    // Prevenimos múltiples clics durante la animación
    if (animandoTransicion) return;

    setDireccionTransicion("derecha");
    setFechaActual(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, [animandoTransicion, setDireccionTransicion, setFechaActual]);

  // Efecto para ejecutar la animación cuando se carga la página
  useEffect(() => {
    // Primera carga
    setTimeout(() => {
      setAnimacionCargaPagina(false);
    }, 600);

    // Manejador de eventos para las teclas de flecha
    const manejarTeclas = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        retrocederMes();
      } else if (e.key === "ArrowRight") {
        avanzarMes();
      }
    };

    // Agregar y quitar el event listener
    window.addEventListener("keydown", manejarTeclas);
    return () => {
      window.removeEventListener("keydown", manejarTeclas);
    };
  }, [retrocederMes, avanzarMes]);

  // Efecto para animar los post-its cuando cambia el mes
  useEffect(() => {
    // Solo animar si no es la primera carga y hay una dirección definida
    if (!animacionCargaPagina && direccionTransicion) {
      setDebeAnimar(true);
      setAnimandoTransicion(true);

      // Resetear la animación después de completarse
      const timer = setTimeout(() => {
        setDebeAnimar(false);
        setAnimandoTransicion(false);
        setDireccionTransicion(null);
      }, 500); // Duración de la animación

      return () => clearTimeout(timer);
    }
  }, [fechaActual, animacionCargaPagina, direccionTransicion]);

  const eventos = useMemo(() => {
    const primerDiaMes = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      1
    );
    const ultimoDiaMes = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() + 1,
      0
    );

    // Determinar el primer día visible en el calendario (incluyendo días del mes anterior)
    const primerDiaSemana = primerDiaMes.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    const diasNecesariosAnterior =
      primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    const primerDiaVisible = new Date(primerDiaMes);
    primerDiaVisible.setDate(
      primerDiaVisible.getDate() - diasNecesariosAnterior
    );

    // Determinar el último día visible en el calendario (incluyendo días del mes siguiente)
    const ultimoDiaVisible = new Date(ultimoDiaMes);
    const ultimoDiaSemana = ultimoDiaMes.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    // Si el último día no es viernes (5), añadir días hasta llegar al siguiente viernes
    if (ultimoDiaSemana !== 5) {
      const diasNecesariosSiguiente =
        ultimoDiaSemana < 5 ? 5 - ultimoDiaSemana : 5 + (7 - ultimoDiaSemana);
      ultimoDiaVisible.setDate(
        ultimoDiaVisible.getDate() + diasNecesariosSiguiente
      );
    }

    // Generar eventos para todo el rango visible del calendario
    return generarEventosCalendario(
      primerDiaVisible,
      ultimoDiaVisible,
      calendarData
    );
  }, [fechaActual]);

  const irAlMesActual = () => {
    // Prevenimos múltiples clics durante la animación
    if (animandoTransicion) return;

    const now = new Date();
    const mesActual = now.getMonth();

    // Determinamos qué dirección usar comparando con el mes actual
    if (fechaActual.getMonth() < mesActual) {
      setDireccionTransicion("izquierda");
    } else if (fechaActual.getMonth() > mesActual) {
      setDireccionTransicion("derecha");
    }

    setFechaActual(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Generar el grid del calendario organizado por semanas con días laborables ordenados
  const generarCalendario = () => {
    const hoy = new Date();
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const diasEnMes = obtenerDiasMes(fechaActual);

    // Información para el mes anterior
    const mesAnterior = mes === 0 ? 11 : mes - 1;
    const añoAnterior = mes === 0 ? año - 1 : año;
    const diasMesAnterior = obtenerDiasMes(
      new Date(añoAnterior, mesAnterior, 1)
    );

    // Información para el mes siguiente (guardado para posible uso futuro)
    // const mesSiguiente = mes === 11 ? 0 : mes + 1;
    // const añoSiguiente = mes === 11 ? año + 1 : año;

    // Determinar cuántas semanas necesitamos para este mes
    const primerDiaMes = new Date(año, mes, 1);
    const primerDiaSemana = primerDiaMes.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado

    // Inicializar un array para almacenar todas las fechas a mostrar
    const todasLasFechas: Array<{ fecha: Date; esOtroMes: boolean }> = [];

    // Determinar si necesitamos días del mes anterior
    let necesitaDiasMesAnterior = false;

    // Encontrar el primer día laboral (lun-vie) del mes
    const primerDiaLaboral = new Date(año, mes, 1);
    while (!diasLaborables.includes(primerDiaLaboral.getDay())) {
      primerDiaLaboral.setDate(primerDiaLaboral.getDate() + 1);
    }

    // Si el primer día laboral no es lunes, necesitamos días del mes anterior
    if (primerDiaLaboral.getDay() !== 1) {
      necesitaDiasMesAnterior = true;
    }

    // Solo agregar días del mes anterior si realmente los necesitamos
    if (necesitaDiasMesAnterior) {
      // Si es domingo (0), necesitamos 6 días laborables anteriores (para llegar al lunes previo)
      // Si es otro día (2-6), necesitamos n-1 días anteriores (para llegar al lunes previo)
      const diasNecesarios = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

      for (let i = diasNecesarios; i > 0; i--) {
        // Calcula el día del mes anterior
        const diaAnterior = diasMesAnterior - i + 1;
        const fecha = new Date(añoAnterior, mesAnterior, diaAnterior);

        // Solo agregamos si es un día laborable
        const diaSemana = fecha.getDay();
        if (diasLaborables.includes(diaSemana)) {
          todasLasFechas.push({
            fecha: fecha,
            esOtroMes: true,
          });
        }
      }
    }

    // 2. Agregar todos los días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(año, mes, i);
      const diaSemana = fecha.getDay();

      // Solo agregamos si es un día laborable
      if (diasLaborables.includes(diaSemana)) {
        todasLasFechas.push({
          fecha: fecha,
          esOtroMes: false,
        });
      }
    }

    // 3. Agregar días del mes siguiente si es necesario
    // Calculamos cuántos días necesitamos para completar la última semana
    // Aseguramos tener semanas completas de 5 días laborables
    while (todasLasFechas.length % 5 !== 0) {
      const ultimoDiaIndice = todasLasFechas.length - 1;
      const ultimaFecha = todasLasFechas[ultimoDiaIndice].fecha;
      const siguienteDia = new Date(ultimaFecha);
      siguienteDia.setDate(ultimaFecha.getDate() + 1);

      // Solo agregamos si es un día laborable
      const diaSemana = siguienteDia.getDay();
      if (diasLaborables.includes(diaSemana)) {
        todasLasFechas.push({
          fecha: siguienteDia,
          esOtroMes: siguienteDia.getMonth() !== mes,
        });
      }
    }

    // Agrupar días en semanas (5 días laborables por semana)
    const semanas: Array<Array<{ fecha: Date; esOtroMes: boolean } | null>> =
      [];

    for (let i = 0; i < todasLasFechas.length; i += 5) {
      const semana = todasLasFechas.slice(i, i + 5);

      // Crear una semana del tamaño exacto de días laborables (5)
      const semanaArray: Array<{ fecha: Date; esOtroMes: boolean } | null> =
        Array(5).fill(null);

      // Ubicar cada día en su posición correcta según el día de la semana
      semana.forEach((item) => {
        const diaSemana = item.fecha.getDay();
        if (diasLaborables.includes(diaSemana)) {
          const indiceDia = diasLaborables.indexOf(diaSemana);
          semanaArray[indiceDia] = item;
        }
      });

      semanas.push(semanaArray);
    }

    // Convertir la estructura de semanas en celdas para el calendario
    const celdas: React.ReactNode[] = [];

    // Para cada semana
    semanas.forEach((semana, indexSemana) => {
      // Para cada día posible de la semana (lun-vie)
      semana.forEach((item, indexDia) => {
        if (item) {
          const { fecha, esOtroMes } = item;

          // Verificar si es el día actual
          const esDiaActual =
            fecha.getDate() === hoy.getDate() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear();

          celdas.push(
            <DiaCelda
              key={`semana-${indexSemana}-dia-${indexDia}`}
              fecha={fecha}
              eventos={eventos}
              esDiaActual={esDiaActual}
              esOtroMes={esOtroMes}
              animar={debeAnimar || animacionCargaPagina}
            />
          );
        } else {
          // Para días vacíos, añadir una celda vacía para mantener la estructura
          celdas.push(
            <div
              key={`empty-${indexSemana}-${indexDia}`}
              className="min-h-32 md:min-h-40"
            ></div>
          );
        }
      });
    });

    return celdas;
  };

  return (
    <div
      className="w-full"
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "manipulation",
        msOverflowStyle: "none",
      }}
    >
      <div className="min-w-[690px] w-full max-w-[1120px] mx-auto relative p-4">
        {/* Número de versión - en la parte inferior derecha alineado con los post-it */}
        <div className="absolute -right-16 opacity-50 bottom-1">
          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md shadow-sm">
            v3.3
          </span>
        </div>
        {/* Las animaciones ahora están en globals.css */}

        {/* Header con navegación y estadísticas */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            {/* Título del mes con estilo armonizado */}
            <div className="hidden sm:flex items-center">
              <div className="text-2xl font-bold px-4 py-2 rounded-md bg-blue-50 border border-blue-100 shadow-sm">
                {nombresMeses[fechaActual.getMonth()]}{" "}
                {fechaActual.getFullYear()}
              </div>
            </div>

            {/* Indicadores estadísticos en una fila propia con margen superior */}
            <div className="mt-0 mb-0">
              <IndicadorDistribucion
                eventos={eventos}
                fechaActual={fechaActual}
              />
            </div>

            {/* Botones de navegación con estilo armonizado */}
            <div className="flex items-center gap-4">
              <button
                onClick={retrocederMes}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm flex items-center"
              >
                <span className="mr-1">←</span> Anterior
              </button>
              <button
                onClick={irAlMesActual}
                className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm"
              >
                Hoy
              </button>
              <button
                onClick={avanzarMes}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm flex items-center"
              >
                Siguiente <span className="ml-1">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor principal del calendario - siempre 5 columnas para preservar estructura */}
        <div className="calendario-grid sm:pr-0 pr-4">
          {/* Días del mes organizados por semanas y días */}
          {generarCalendario()}

          {/* Post-its con información de fin de semana */}
          {(() => {
            const viernes = [];
            const mesActual = fechaActual.getMonth();
            const añoActual = fechaActual.getFullYear();

            // Buscar todos los viernes del mes actual
            for (let i = 1; i <= obtenerDiasMes(fechaActual); i++) {
              const fecha = new Date(añoActual, mesActual, i);
              if (fecha.getDay() === 5) {
                // 5 = viernes
                viernes.push(
                  <InfoFinDeSemana
                    key={`finde-${i}`}
                    fecha={fecha}
                    animar={debeAnimar || animacionCargaPagina}
                  />
                );
              }
            }
            return viernes;
          })()}
        </div>
      </div>
    </div>
  );
};
