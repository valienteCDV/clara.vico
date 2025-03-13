"use client";

import React, { useState, useMemo } from "react";
import { calendarData } from "@/lib/calendar-data";
import {
  EventoCalendario,
  generarEventosCalendario,
} from "@/lib/calendar-utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { InfoFinDeSemana } from "./info-fin-de-semana";
// Iconos para eventos de logística
const iconosLogistica: Record<string, React.ReactNode> = {
  llevar: <ArrowUp className="w-4 h-4" />,
  recoger: <ArrowDown className="w-4 h-4" />,
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
}

const DiaCelda: React.FC<DiaCeldaProps> = ({ fecha, eventos, esDiaActual }) => {
  if (!fecha) {
    return <div className="min-h-32 md:min-h-40"></div>;
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
        : "#fffdf7", // Color crema suave para el post-it
    transform: `rotate(${rotacion})`, // Inclinación aleatoria
    boxShadow: esDiaActual
      ? "0 0 20px rgba(59, 130, 246, 0.7), 0 0 30px rgba(59, 130, 246, 0.4), 2px 4px 6px rgba(0,0,0,0.15)" // Sombra azul más intensa para el día actual
      : "2px 4px 6px rgba(0,0,0,0.15)", // Sombra suave para otros días
    position: "relative", // Para posicionar el "pinche" de forma absoluta
    padding: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    // Solo animar la sombra, no el post-it entero
    animation: esDiaActual ? "pulseShadow 2s infinite alternate" : "none",
  };

  return (
    <div
      className={`h-auto min-h-40 overflow-y-auto transition-all hover:shadow-lg flex flex-col ${
        esDiaActual ? "ring-2 ring-offset-2 ring-blue-400" : ""
      }`}
      style={postItStyle}
    >
      <div className="flex justify-between items-start mb-1 pb-1 border-b border-gray-300">
        <div className="font-semibold">
          {diaSemana} {fecha.getDate()}
        </div>

        <div className="flex items-center">
          {eventoCustodia && eventoCustodia.tipo === "custodia" && (
            <span className="text-xs font-semibold px-1.5 py-0.5 bg-black/10 text-black rounded-md mr-1">
              {eventoCustodia.progenitorNombre}
            </span>
          )}
        </div>
      </div>

      <div className="flex-grow">
        {/* Renderizar todos los eventos ordenados por hora */}
        <div className="mt-2 space-y-1">
          {eventosDia
            .filter((evento) => evento.tipo === "logistica")
            .sort((a, b) => {
              // Convertir a minutos desde medianoche para ordenar por hora
              const aMinutos = a.fecha.getHours() * 60 + a.fecha.getMinutes();
              const bMinutos = b.fecha.getHours() * 60 + b.fecha.getMinutes();
              return aMinutos - bMinutos;
            })
            .map((evento, idx) => {
              if (evento.tipo !== "logistica") return null;

              return (
                <div
                  key={`${evento.actividadId}-${evento.subTipo}-${idx}`}
                  className="flex items-center text-xs p-1 rounded-sm mb-1 transition-all hover:scale-105 shadow-sm overflow-hidden max-w-full"
                  style={{
                    backgroundColor: evento.colorActividad,
                    color: "#333333", // Texto oscuro para mejor contraste
                    border: `1px solid ${evento.colorActividad}`,
                    fontWeight: 500, // Texto semi-negrita para mejor legibilidad
                  }}
                >
                  <span className="mr-1 flex-shrink-0">
                    {iconosLogistica[evento.subTipo]}
                  </span>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {evento.fecha.getHours().toString().padStart(2, "0")}:
                    {evento.fecha.getMinutes().toString().padStart(2, "0")}
                    {" • "}
                    {evento.actividadNombre}
                  </span>
                </div>
              );
            })}
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

    return generarEventosCalendario(primerDiaMes, ultimoDiaMes, calendarData);
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

  // Generar el grid del calendario solo con días laborables
  const generarCalendario = () => {
    const hoy = new Date();
    const diasEnMes = obtenerDiasMes(fechaActual);
    const dias = [];

    // Agregar celdas para cada día del mes (solo días laborables)
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth(),
        i
      );

      // Solo incluir el día si es un día laborable (de lunes a viernes)
      if (diasLaborables.includes(fecha.getDay())) {
        const esDiaActual =
          fecha.getDate() === hoy.getDate() &&
          fecha.getMonth() === hoy.getMonth() &&
          fecha.getFullYear() === hoy.getFullYear();

        dias.push(
          <DiaCelda
            key={`day-${i}`}
            fecha={fecha}
            eventos={eventos}
            esDiaActual={esDiaActual}
          />
        );
      }
    }

    return dias;
  };

  return (
    <div className="max-w-screen-xl mx-auto p-2 sm:p-4">
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

      {/* Encabezado con leyenda */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="text-xl font-bold mb-3 sm:mb-0">
          {nombresMeses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
        </div>

        {/* Leyenda de colores centrada */}
        <div className="flex justify-center gap-8 text-lg mb-3 sm:mb-0">
          <div className="flex items-center gap-2">
            {calendarData.progenitores.map((progenitor) => (
              <div key={progenitor.id} className="flex items-center mr-3">
                <div
                  className="w-8 h-5 mr-1 rounded-md border border-gray-400"
                  style={{ backgroundColor: progenitor.colorFondo }}
                />
                <span>{progenitor.nombre}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {calendarData.niños.map((niño) => (
              <div key={niño.id} className="flex items-center mr-3">
                <div
                  className="w-8 h-5 mr-1 rounded-md border border-gray-400"
                  style={{ backgroundColor: niño.colorActividad }}
                />
                <span>{niño.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center gap-3">
          <button
            onClick={retrocederMes}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center"
          >
            <span className="mr-1">←</span> Anterior
          </button>
          <button
            onClick={irAlMesActual}
            className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors shadow-sm hover:shadow"
          >
            Hoy
          </button>
          <button
            onClick={avanzarMes}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center"
          >
            Siguiente <span className="ml-1">→</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2 relative">
        {/* Días del mes (solo días laborables, sin encabezado) */}
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
  );
};
