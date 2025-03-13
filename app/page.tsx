import { CalendarioMensual } from "./calendar/calendario-mensual";

export default function Home() {
  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(120deg, #f0f4f8 0%, #d5e6f3 100%)",
      }}
    >
      <CalendarioMensual />
    </div>
  );
}
