import { listarClientes } from "@/app/actions/clientes";
import { buscarLaudoTecnico } from "@/app/actions/laudos-tecnicos";
import { LaudoTecnicoWizard } from "@/components/features/laudos-tecnicos/laudo-tecnico-wizard";
import type { LaudoTecnicoWizardState } from "@/lib/laudos-tecnicos/types";

export default async function NovoLaudoTecnicoPage({ searchParams }: { searchParams: Promise<{ editarId?: string }> }) {
  const { editarId } = await searchParams;
  const { data: clientes } = await listarClientes();

  let initialState: LaudoTecnicoWizardState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarLaudoTecnico(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as LaudoTecnicoWizardState), laudoId: laudo.id, step: 1 };
    }
  }

  return <LaudoTecnicoWizard clientes={clientes} initialState={initialState} />;
}
