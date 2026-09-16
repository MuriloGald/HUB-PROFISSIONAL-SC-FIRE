import { listarAlarmeIn12 } from "@/app/actions/in12";
import { AlarmeList } from "@/components/features/in12/alarme-list";

export default async function ListaAlarmeIn12Page() {
  const { data: laudos } = await listarAlarmeIn12();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          Comissionamentos de Alarme de Incêndio (IN 12)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gerencie e exporte os relatórios de comissionamento de alarme de incêndio preenchidos.
        </p>
      </div>

      <AlarmeList laudos={laudos} />
    </div>
  );
}
