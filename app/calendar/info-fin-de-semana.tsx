import React from "react";
import { calendarData } from "../lib/calendar-data";
import { Paperclip } from "lucide-react";

interface InfoFinDeSemanaProps {
  fecha: Date; // Fecha del viernes
}

export const InfoFinDeSemana: React.FC<InfoFinDeSemanaProps> = ({ fecha }) => {
  // Solo mostrar para los viernes
  if (fecha.getDay() !== 5) return null;

  // Encontrar el progenitor que tiene la custodia para el fin de semana
  // Para esto necesitaríamos acceder a los eventos de custodia del fin de semana
  // Asumimos que el responsable de custodia del sábado es el mismo para todo el finde

  const fechaSabado = new Date(fecha);
  fechaSabado.setDate(fecha.getDate() + 1); // Sumar un día para obtener el sábado

  const fechaDomingo = new Date(fecha);
  fechaDomingo.setDate(fecha.getDate() + 2); // Sumar dos días para obtener el domingo

  // Este progenitor sería determinado según la lógica de custodia
  // Para este ejemplo, alternamos entre los progenitores basado en la semana del mes
  const semanaDelMes = Math.ceil(fecha.getDate() / 7);

  // Asumimos que el progenitor para el fin de semana es el que no tiene el viernes
  // Esta lógica podría ajustarse según las reglas específicas de custodia
  const progenitorFinDeSemana = calendarData.progenitores[semanaDelMes % 2];

  // Calcular la posición vertical basada en la semana del mes
  // para que cada post-it aparezca en su línea correspondiente
  const semana = Math.ceil(fecha.getDate() / 7);
  const top = `${semana * 20 - 15}%`;

  // Estilo para el post-it de fin de semana, con rotación aleatoria consistente
  const rotacion =
    fecha.getDate() % 3 === 0
      ? "1deg"
      : fecha.getDate() % 3 === 1
      ? "-1deg"
      : "0.5deg";

  // Posición del clip con rotación aleatoria pero consistente
  const rotacionPinche = -15 + ((fecha.getDate() * 5) % 30);
  const postItStyle: React.CSSProperties = {
    backgroundColor: progenitorFinDeSemana.colorFondo, // Usar el mismo color del progenitor
    transform: `rotate(${rotacion})`,
    boxShadow: "2px 4px 6px rgba(0,0,0,0.15)",
    position: "relative",
    padding: "8px",
    border: "1px solid rgba(0,0,0,0.1)",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div className="absolute -right-26" style={{ top }}>
      <div style={postItStyle} className="w-28 h-36">
        {/* Clip decorativo */}
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: `translateX(-50%) rotate(${rotacionPinche}deg)`,
            zIndex: 100,
            filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))",
            color: "#cc3333",
            pointerEvents: "none",
          }}
        >
          <Paperclip size={22} strokeWidth={2.5} />
        </div>
        <div className="font-semibold text-xs mb-2 text-center">
          Fin de Semana
        </div>
        <div className="text-center font-medium mb-2">
          {fechaSabado.getDate()} y {fechaDomingo.getDate()}
        </div>
        <div className="text-center">
          <span
            className="text-xs font-semibold py-1 px-2 inline-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          >
            Con {progenitorFinDeSemana.nombre}
          </span>
        </div>
      </div>
    </div>
  );
};
