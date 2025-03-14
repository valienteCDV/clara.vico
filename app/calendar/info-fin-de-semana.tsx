import React from "react";
import { calendarData } from "../lib/calendar-data";
import { Paperclip } from "lucide-react";

interface InfoFinDeSemanaProps {
  fecha: Date; // Fecha del viernes
  animar?: boolean; // Indica si se debe animar el post-it
}

export const InfoFinDeSemana: React.FC<InfoFinDeSemanaProps> = ({
  fecha,
  animar = false,
}) => {
  // Solo mostrar para los viernes (getDay() devuelve 5 para viernes)
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

  // Asignamos una posición fija según el índice de la semana
  // Esto permite que los post-its estén siempre en la misma posición vertical
  const indice = Math.floor((fecha.getDate() - 1) / 7); // 0 para primera semana, 1 para segunda, etc
  // Posición fija para cada índice de semana (en píxeles, no en porcentaje)
  const posicionesFijas = [40, 210, 370, 530, 800];
  const top = `${posicionesFijas[indice]}px`;

  // Estilo para el post-it de fin de semana, con rotación aleatoria consistente
  const rotacion =
    fecha.getDate() % 3 === 0
      ? "1deg"
      : fecha.getDate() % 3 === 1
      ? "-1deg"
      : "0.5deg";

  // Posición del clip con rotación aleatoria pero consistente
  const rotacionPinche = -105 + ((fecha.getDate() * 5) % 30);
  const postItStyle: React.CSSProperties = {
    "--post-it-color": progenitorFinDeSemana.colorFondo, // Usar el mismo color del progenitor como variable CSS
    transform: `rotate(${rotacion})`,
    position: "relative",
    padding: "8px",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-caveat)",
    // borderRadius se elimina porque ahora se gestiona mediante la clase CSS post-it
  } as React.CSSProperties;

  // Clase CSS para la animación
  const clasePostIt = `w-28 h-36 post-it ${animar ? "sacudir-post-it" : ""}`;

  return (
    <div className="absolute -right-26" style={{ top }}>
      <div style={postItStyle} className={clasePostIt}>
        {/* Clip decorativo */}
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "15%",
            transform: `translateX(-50%) rotate(${rotacionPinche}deg)`,
            zIndex: 100,
            filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))",
            color: "#2B5FA4FF",
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
          <span className="text-xs text-gray-400">
            {progenitorFinDeSemana.nombre}
          </span>
        </div>
      </div>
    </div>
  );
};
