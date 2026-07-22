import { listarClientes } from "@/app/actions/clientes";
import { buscarRelatorioPrestacao } from "@/app/actions/in28";
import { PrestacaoWizard } from "@/components/features/in28/prestacao-wizard";
import type { RelatorioPrestacaoState } from "@/lib/in28/types";

export default async function NovoRelatorioPrestacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const { data: clientes } = await listarClientes();

  let initialState: RelatorioPrestacaoState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarRelatorioPrestacao(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as RelatorioPrestacaoState), laudoId: laudo.id, step: 1 };
    }
  }

  return <PrestacaoWizard clientes={clientes} clienteIdInicial={clienteId} initialState={initialState} />;
}
