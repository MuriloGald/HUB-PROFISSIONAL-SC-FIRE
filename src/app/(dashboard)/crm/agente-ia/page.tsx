import { getSdrConfig } from "@/app/actions/crm-agente";
import { AgenteIaForm } from "@/components/features/crm/agente-ia-form";

export default async function AgenteIaPage() {
  const { data: config, error } = await getSdrConfig();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Agente IA (SDR)</h1>
        <p className="text-sm text-gray-400 mt-1">
          Persona e prompt do agente que atende os leads do WhatsApp — só o diretor configura.
        </p>
      </div>

      {error || !config ? (
        <p className="text-sm text-red-400">{error ?? "Configuração do agente não encontrada."}</p>
      ) : (
        <AgenteIaForm config={config} />
      )}
    </div>
  );
}
