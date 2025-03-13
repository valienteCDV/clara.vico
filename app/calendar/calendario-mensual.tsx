"use client";

import React, { useState, useMemo } from "react";
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

  const { diasTotales, diasPorProgenitor, eventosPorProgenitor } =
    calcularEstadisticas();

  // No mostrar nada si no hay datos para el mes
  if (diasTotales === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {/* Indicadores para Mamá */}
      <div
        className="flex items-center px-3 py-1.5 rounded-md shadow-sm transition-transform hover:scale-105"
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
        <span className="mx-1 text-xs opacity-60">•</span>
        <span className="text-sm">{eventosPorProgenitor.mama} eventos</span>
      </div>

      {/* Indicadores para Papá */}
      <div
        className="flex items-center px-3 py-1.5 rounded-md shadow-sm transition-transform hover:scale-105"
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
        <span className="mx-1 text-xs opacity-60">•</span>
        <span className="text-sm">{eventosPorProgenitor.papa} eventos</span>
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

// Componente de celda para un día del calendario
interface DiaCeldaProps {
  fecha?: Date;
  eventos: EventoCalendario[];
  esDiaActual: boolean;
  esOtroMes?: boolean;
}

const DiaCelda: React.FC<DiaCeldaProps> = ({
  fecha,
  eventos,
  esDiaActual,
  esOtroMes = false,
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
      ? "1deg"
      : fecha.getDate() % 3 === 1
      ? "-1deg"
      : "0.5deg";

  // Estilo para crear el efecto de "post-it" con inclinación aleatoria
  const postItStyle: React.CSSProperties = {
    backgroundColor:
      eventoCustodia && eventoCustodia.tipo === "custodia"
        ? eventoCustodia.colorFondo
        : esOtroMes
        ? "#f3f3f3" // Color gris claro para días de otro mes
        : "#fffdf7", // Color crema suave para el post-it del mes actual
    opacity: esOtroMes ? 0.8 : 1, // Reducir un poco la opacidad para días de otro mes
    transform: `rotate(${rotacion})`, // Inclinación aleatoria
    boxShadow: esDiaActual
      ? "0 0 20px rgba(59, 130, 246, 0.7), 0 0 30px rgba(59, 130, 246, 0.4), 2px 4px 6px rgba(0,0,0,0.15)" // Sombra azul más intensa para el día actual
      : "2px 4px 6px rgba(0,0,0,0.15)", // Sombra suave para otros días
    position: "relative", // Para posicionar el "pinche" de forma absoluta
    padding: "10px 12px 16px 12px", // Reducimos padding arriba y aumentamos abajo para el badge
    border: "1px solid rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    // Solo animar la sombra, no el post-it entero
    animation: esDiaActual ? "pulseShadow 2s infinite alternate" : "none",
    // Limitamos la altura máxima para que los post-it sean más compactos
    maxHeight: "200px",
  };

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
    <div
      className={`h-auto min-h-40 overflow-y-auto transition-all hover:shadow-lg flex flex-col ${
        esDiaActual ? "ring-2 ring-offset-2 ring-blue-400" : ""
      }`}
      style={postItStyle}
    >
      <div className="flex justify-center items-start border-b border-gray-400">
        <div
          className={`font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-sm md:text-base ${
            esOtroMes ? "text-gray-500" : ""
          }`}
        >
          {diaSemana} {fecha.getDate()} de {nombresMeses[fecha.getMonth()]}
        </div>
      </div>

      {/* Badge de progenitor posicionado absolutamente en la esquina inferior derecha pero detrás de los eventos */}
      {eventoCustodia && eventoCustodia.tipo === "custodia" && (
        <div
          className="absolute bottom-1 right-1 z-0"
          style={{ pointerEvents: "none" }}
        >
          <span className="text-xs font-semibold px-1.5 py-0.5 bg-black/10 text-black rounded-md">
            {eventoCustodia.progenitorNombre}
          </span>
        </div>
      )}

      <div className="flex-grow relative">
        {/* Renderizar todos los eventos agrupados por actividad */}
        <div
          className={`mt-2 relative z-10 ${
            tieneMuchosEventos ? "space-y-0.5" : "space-y-1"
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

                return (
                  <div
                    key={actividadId}
                    className={`flex items-center text-xs rounded-sm transition-all hover:scale-105 shadow-sm overflow-hidden max-w-full ${
                      tieneMuchosEventos ? "p-0.5 mb-0.5" : "p-1 mb-1"
                    }`}
                    style={{
                      backgroundColor: eventoLlevar.colorActividad,
                      color: "#333333", // Texto oscuro para mejor contraste
                      border: `1px solid ${eventoLlevar.colorActividad}`,
                      fontWeight: 500, // Texto semi-negrita para mejor legibilidad
                      // Superposición para eventos cuando hay muchos
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
  const [fechaActual, setFechaActual] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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

  const avanzarMes = () => {
    setFechaActual(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const retrocederMes = () => {
    setFechaActual(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const irAlMesActual = () => {
    const now = new Date();
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
      className="w-full overflow-x-auto"
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "manipulation",
        msOverflowStyle: "none",
      }}
    >
      <div className="min-w-[720px] w-full max-w-[1050] mx-auto sm:p-4">
        {/* Número de versión */}
        <div className="absolute top-2 right-4 z-50">
          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md shadow-sm">
            v3.2
          </span>
        </div>
        {/* Estilos globales para animaciones */}
        <style jsx global>{`
          @keyframes pulseShadow {
            0% {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.5),
                0 0 30px rgba(59, 130, 246, 0.3);
            }
            50% {
              box-shadow: 0 0 25px rgba(59, 130, 246, 0.7),
                0 0 35px rgba(59, 130, 246, 0.5);
            }
            100% {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.5),
                0 0 30px rgba(59, 130, 246, 0.3);
            }
          }
        `}</style>

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
            <div className="mt-4 mb-2">
              <IndicadorDistribucion
                eventos={eventos}
                fechaActual={fechaActual}
              />
            </div>

            {/* Botones de navegación con estilo armonizado */}
            <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-5 gap-4 p-2 relative">
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
                  <InfoFinDeSemana key={`finde-${i}`} fecha={fecha} />
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
