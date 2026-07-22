import { listarClientes } from "@/app/actions/clientes";
import { buscarComissionamentoSHP } from "@/app/actions/in07";
import { ShpWizard } from "@/components/features/in07/shp-wizard";
import type { ComissionamentoSHPState } from "@/lib/in07/types";

export default async function NovoComissionamentoSHPPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const { data: clientes } = await listarClientes();

  let initialState: ComissionamentoSHPState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarComissionamentoSHP(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as ComissionamentoSHPState), laudoId: laudo.id, step: 1 };
    }
  }

  return <ShpWizard clientes={clientes} clienteIdInicial={clienteId} initialState={initialState} />;
}
