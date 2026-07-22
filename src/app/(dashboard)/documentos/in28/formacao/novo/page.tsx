import { listarClientes } from "@/app/actions/clientes";
import { buscarRelatorioFormacao } from "@/app/actions/in28";
import { FormacaoWizard } from "@/components/features/in28/formacao-wizard";
import type { RelatorioFormacaoState } from "@/lib/in28/types";

export default async function NovoRelatorioFormacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const { data: clientes } = await listarClientes();

  let initialState: RelatorioFormacaoState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarRelatorioFormacao(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as RelatorioFormacaoState), laudoId: laudo.id, step: 1 };
    }
  }

  return <FormacaoWizard clientes={clientes} clienteIdInicial={clienteId} initialState={initialState} />;
}
