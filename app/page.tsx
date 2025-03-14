import { CalendarioMensual } from "./calendar/calendario-mensual";

export default function Home() {
  return (
    <div
      className="h-[100dvh] p-2 overflow-y-auto"
      style={{
        background: "linear-gradient(120deg, #ebebeb 30%, #fafff1 100%)",
      }}
    >
      <CalendarioMensual />
    </div>
  );
}
