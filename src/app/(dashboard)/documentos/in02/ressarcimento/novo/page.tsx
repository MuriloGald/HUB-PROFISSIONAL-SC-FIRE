import { listarClientes } from "@/app/actions/clientes";
import { buscarRessarcimento } from "@/app/actions/in02";
import { RessarcimentoWizard } from "@/components/features/in02/ressarcimento-wizard";
import type { RessarcimentoWizardState } from "@/lib/in02/types";

export default async function NovoRessarcimentoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const { data: clientes } = await listarClientes();

  let initialState: RessarcimentoWizardState | undefined;
  if (editarId) {
    const { data: ressarcimento } = await buscarRessarcimento(editarId);
    if (ressarcimento) {
      initialState = { ...(ressarcimento.dados as unknown as RessarcimentoWizardState), laudoId: ressarcimento.id, step: 1 };
    }
  }

  return <RessarcimentoWizard clientes={clientes} clienteIdInicial={clienteId} initialState={initialState} />;
}
