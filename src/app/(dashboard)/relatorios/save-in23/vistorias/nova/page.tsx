import { listarClientes } from "@/app/actions/clientes";
import { buscarVistoria } from "@/app/actions/save-in23";
import { VistoriaWizard } from "@/components/features/save-in23/vistoria/vistoria-wizard";
import type { VistoriaWizardState } from "@/lib/save-in23/types";

export default async function NovaVistoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const { data: clientes } = await listarClientes();

  let initialState: VistoriaWizardState | undefined;
  if (editarId) {
    const { data: vistoria } = await buscarVistoria(editarId);
    if (vistoria) {
      initialState = { ...(vistoria.dados as unknown as VistoriaWizardState), laudoId: vistoria.id, step: 3 };
    }
  }

  return <VistoriaWizard clientes={clientes} clienteIdInicial={clienteId} initialState={initialState} />;
}
