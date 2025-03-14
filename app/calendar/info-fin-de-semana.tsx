import React, { useEffect } from "react";
import { calendarData } from "../lib/calendar-data";
import { Paperclip } from "lucide-react";

/**
 * Configuración para ajustar la posición de los post-its de fin de semana
 * Puedes ajustar estos valores para mover todos los post-its juntos
 * Incluye configuraciones específicas para diferentes tamaños de pantalla
 */
export const weekendPostItConfig = {
  // Configuración para pantallas normales (default)
  default: {
    offsetX: 66, // Desplazamiento horizontal (negativo = izquierda, positivo = derecha)
    offsetY: 40, // Desplazamiento vertical (negativo = arriba, positivo = abajo)
  },
  // Configuración para pantallas pequeñas (sm)
  sm: {
    offsetX: 40, // Menos desplazamiento horizontal en pantallas pequeñas
    offsetY: 25, // Menos desplazamiento vertical en pantallas pequeñas
  },
};

/**
 * Posiciona los post-its de fin de semana en relación con los posts-its de los viernes
 * @param customConfig - Configuración personalizada opcional para sobrescribir la configuración por defecto
 */
export function positionWeekendPostIts(
  customConfig: Partial<typeof weekendPostItConfig> = {}
) {
  // Esperar hasta que el DOM esté completamente cargado
  if (typeof window === "undefined") return;

  // Determinar qué configuración usar basado en el ancho de la pantalla
  const isSmallScreen = window.innerWidth < 640; // 640px es el breakpoint 'sm' en Tailwind CSS

  // Seleccionar la configuración adecuada para el tamaño de pantalla
  const baseConfig = isSmallScreen
    ? weekendPostItConfig.sm
    : weekendPostItConfig.default;

  // Combinar la configuración base con la personalizada
  const config = {
    ...baseConfig,
    ...customConfig,
  };

  // Esta función se ejecutará después de que el DOM esté listo
  setTimeout(() => {
    // Buscar todos los post-its de fin de semana
    const weekendPostIts = document.querySelectorAll<HTMLElement>(
      ".finde-semana-post-it"
    );
    const gridElement = document.querySelector<HTMLElement>(".calendario-grid");

    if (!gridElement) return;
    const gridRect = gridElement.getBoundingClientRect();

    weekendPostIts.forEach((postIt) => {
      const semanaId = postIt.getAttribute("data-semana");
      if (!semanaId) return;

      // Encontrar el viernes correspondiente a esta semana
      const fridayPostIt = document.querySelector<HTMLElement>(
        `.calendario-grid > div:nth-child(${parseInt(semanaId) * 5})`
      );

      if (fridayPostIt) {
        // Obtener la posición del post-it del viernes
        const fridayRect = fridayPostIt.getBoundingClientRect();

        // Posicionar el post-it del fin de semana alineado con el post-it del viernes
        // con desplazamientos configurables según el tamaño de pantalla
        postIt.style.top = `${
          fridayRect.top - gridRect.top + config.offsetY
        }px`;
        postIt.style.right = `${config.offsetX * -1}px`; // Convertimos el offsetX a un valor para 'right'
      }
    });
  }, 300); // Pequeño retraso para asegurarse de que los post-its se han renderizado
}

/**
 * Crear un observador de mutación para volver a posicionar los post-its cuando cambie el DOM
 * @returns {Function} Función para limpiar el observador cuando el componente se desmonte
 */
export function setupWeekendPostitObserver() {
  if (typeof window === "undefined") return;

  // Ejecutar la función una vez al cargar
  positionWeekendPostIts();

  // Envolver la función positionWeekendPostIts para manejar eventos sin parámetros
  const handleResize = () => positionWeekendPostIts();

  // También ejecutar cuando la ventana cambie de tamaño con la función envuelta
  window.addEventListener("resize", handleResize);

  // Crear un observador que detecte cambios en el DOM
  const observer = new MutationObserver((mutations) => {
    let shouldReposition = false;

    // Verificar si los cambios afectan a los post-its
    mutations.forEach((mutation) => {
      const target = mutation.target as Element;
      if (
        target.classList &&
        (target.classList.contains("calendario-grid") ||
          target.closest(".calendario-grid"))
      ) {
        shouldReposition = true;
      }
    });

    if (shouldReposition) {
      positionWeekendPostIts();
    }
  });

  // Observar el contenedor del calendario
  const calendarGrid = document.querySelector<HTMLElement>(".calendario-grid");
  if (calendarGrid) {
    observer.observe(calendarGrid, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
  }

  // Limpiar el observador cuando el componente se desmonte
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", handleResize);
  };
}

interface InfoFinDeSemanaProps {
  fecha: Date; // Fecha del viernes
  animar?: boolean; // Indica si se debe animar el post-it
}

export const InfoFinDeSemana: React.FC<InfoFinDeSemanaProps> = ({
  fecha,
  animar = false,
}) => {
  // Referencia para acceder al elemento
  const postItRef = React.useRef<HTMLDivElement>(null);

  // Hook para asegurar que usamos el posicionamiento cuando el componente se monta
  useEffect(() => {
    // Este efecto solo se ejecuta en el lado del cliente
    if (typeof window !== "undefined") {
      // Pequeño retraso para asegurarnos que el DOM está listo
      const timer = setTimeout(() => {
        positionWeekendPostIts();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

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

  // Generamos un ID único para relacionar este post-it con su viernes correspondiente
  const semanaId = Math.ceil(fecha.getDate() / 7);
  const relacionId = `finde-semana-${semanaId}`;

  // Estilo para el post-it de fin de semana, con rotación aleatoria más pronunciada
  const rotacion =
    fecha.getDate() % 3 === 0
      ? "-5deg"
      : fecha.getDate() % 3 === 1
      ? "-9deg"
      : "3deg";

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
  } as React.CSSProperties;

  // Clase CSS para la animación con diseño responsivo
  const clasePostIt = `post-it ${animar ? "sacudir-post-it" : ""} 
    w-24 h-32 sm:w-28 sm:h-36 transition-all duration-100`;

  return (
    <div
      className="finde-semana-post-it"
      data-semana={semanaId}
      id={relacionId}
    >
      <div ref={postItRef} style={postItStyle} className={clasePostIt}>
        {/* Clip decorativo */}
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "40%",
            transform: `translateX(-50%) rotate(${rotacionPinche}deg)`,
            zIndex: 100,
            filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))",
            color: "#2B5FA4FF",
            pointerEvents: "none",
          }}
        >
          <Paperclip size={22} strokeWidth={2.5} />
        </div>
        <div className="font-semibold text-xs text-center">
          <span className="sm:hidden">Finde</span>
          <span className="hidden sm:inline">Fin de semana</span>
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
