import { listarClientes } from "@/app/actions/clientes";
import { buscarRecurso } from "@/app/actions/in02";
import { RecursoWizard } from "@/components/features/in02/recurso-wizard";
import type { RecursoWizardState } from "@/lib/in02/types";

export default async function NovoRecursoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const { data: clientes } = await listarClientes();

  let initialState: RecursoWizardState | undefined;
  if (editarId) {
    const { data: recurso } = await buscarRecurso(editarId);
    if (recurso) {
      initialState = { ...(recurso.dados as unknown as RecursoWizardState), laudoId: recurso.id, step: 1 };
    }
  }

  return <RecursoWizard clientes={clientes} clienteIdInicial={clienteId} initialState={initialState} />;
}
