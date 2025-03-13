import { CalendarioMensual } from "./calendar/calendario-mensual";

export default function Home() {
  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(120deg, #f0f4f8 0%, #d5e6f3 100%)",
      }}
    >
      <header className="max-w-screen-xl mx-auto py-2 mb-2">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Calendario Familiar
          </h1>
          <p className="text-sm text-gray-500">
            Régimen de tenencia y actividades
          </p>
        </div>
      </header>

      <CalendarioMensual />
    </div>
  );
}
