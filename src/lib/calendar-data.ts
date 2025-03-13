export interface Niño {
  id: string;
  nombre: string;
  colorActividad: string;
}

export interface Progenitor {
  id: string;
  nombre: string;
  colorFondo: string;
}

export interface Horario {
  inicio: string;
  fin: string;
  nota?: string;
}

export interface HorariosPorDia {
  [diaSemana: string]: Horario;
}

export interface Actividad {
  id: string;
  titulo: string;
  niñoId: string;
  tipo: string;
  diasSemana: string[];
  horarios: HorariosPorDia;
}

export interface TipoActividad {
  id: string;
  nombre: string;
}

export interface RegimenTenencia {
  semanasPares: { [dia: string]: string };
  semanasImpares: { [dia: string]: string };
}

export interface CalendarData {
  niños: Niño[];
  progenitores: Progenitor[];
  regimenTenencia: RegimenTenencia;
  actividades: Actividad[];
  tiposActividad: TipoActividad[];
}

export const calendarData: CalendarData = {
  niños: [
    {
      id: "clara",
      nombre: "Clara",
      colorActividad: "#FFD6E0",
    },
    {
      id: "vico",
      nombre: "Vico",
      colorActividad: "#D6E5FF",
    },
  ],
  progenitores: [
    {
      id: "mama",
      nombre: "Mamá",
      colorFondo: "#E6D6FF",
    },
    {
      id: "papa",
      nombre: "Papá",
      colorFondo: "#D6FFE6",
    },
  ],
  regimenTenencia: {
    semanasPares: {
      domingo: "mama",
      lunes: "papa",
      martes: "mama",
      miercoles: "mama",
      jueves: "mama",
      viernes: "papa",
      sabado: "papa",
    },
    semanasImpares: {
      domingo: "papa",
      lunes: "mama",
      martes: "mama",
      miercoles: "mama",
      jueves: "papa",
      viernes: "mama",
      sabado: "mama",
    },
  },
  actividades: [
    {
      id: "cole-vico",
      titulo: "Cole Vico",
      niñoId: "vico",
      tipo: "colegio",
      diasSemana: ["lunes", "martes", "miercoles", "jueves", "viernes"],
      horarios: {
        lunes: { inicio: "08:00", fin: "12:00" },
        martes: { inicio: "08:00", fin: "12:00" },
        miercoles: { inicio: "08:00", fin: "12:40" },
        jueves: { inicio: "08:00", fin: "12:00" },
        viernes: { inicio: "08:00", fin: "12:00" },
      },
    },
    {
      id: "cole-clara",
      titulo: "Cole Clara",
      niñoId: "clara",
      tipo: "colegio",
      diasSemana: ["lunes", "martes", "miercoles", "jueves", "viernes"],
      horarios: {
        lunes: { inicio: "14:00", fin: "18:35" },
        martes: { inicio: "14:00", fin: "19:15" },
        miercoles: { inicio: "14:00", fin: "19:15" },
        jueves: { inicio: "14:00", fin: "19:15" },
        viernes: { inicio: "14:00", fin: "19:15" },
      },
    },
    {
      id: "ingles-vico",
      titulo: "Inglés Vico",
      niñoId: "vico",
      tipo: "idioma",
      diasSemana: ["lunes"],
      horarios: {
        lunes: { inicio: "16:00", fin: "18:00" },
      },
    },
    {
      id: "ingles-clara",
      titulo: "Inglés Clara",
      niñoId: "clara",
      tipo: "idioma",
      diasSemana: ["jueves"],
      horarios: {
        jueves: { inicio: "09:00", fin: "11:00", nota: "Ari/Clari" },
      },
    },
    {
      id: "futbol-vico",
      titulo: "Fútbol Vico",
      niñoId: "vico",
      tipo: "deporte",
      diasSemana: ["lunes", "miercoles"],
      horarios: {
        lunes: { inicio: "18:30", fin: "20:00" },
        miercoles: { inicio: "18:30", fin: "20:00" },
      },
    },
    {
      id: "baile-clara",
      titulo: "Baile Clara",
      niñoId: "clara",
      tipo: "danza",
      diasSemana: ["lunes", "viernes"],
      horarios: {
        lunes: { inicio: "18:30", fin: "19:30" },
        viernes: { inicio: "19:30", fin: "20:30" },
      },
    },
    {
      id: "ed-fisica-clara",
      titulo: "Ed. Física Clara",
      niñoId: "clara",
      tipo: "deporte",
      diasSemana: ["lunes", "jueves"],
      horarios: {
        lunes: { inicio: "12:00", fin: "13:00" },
        jueves: { inicio: "12:00", fin: "13:00" },
      },
    },
  ],
  tiposActividad: [
    {
      id: "colegio",
      nombre: "Colegio",
    },
    {
      id: "deporte",
      nombre: "Deporte",
    },
    {
      id: "danza",
      nombre: "Danza",
    },
    {
      id: "idioma",
      nombre: "Idioma",
    },
  ],
};
