import { listarClientes } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { buscarComissionamentoElevador } from "@/app/actions/in09";
import { ElevadorWizard } from "@/components/features/in09/elevador-wizard";
import type { ComissionamentoElevadorState } from "@/lib/in09/types";

export default async function NovoComissionamentoElevadorPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([listarClientes(), listarProfissionais()]);

  let initialState: ComissionamentoElevadorState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarComissionamentoElevador(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as ComissionamentoElevadorState), laudoId: laudo.id, step: 1 };
    }
  }

  return <ElevadorWizard clientes={clientes} profissionais={profissionais} clienteIdInicial={clienteId} initialState={initialState} />;
}
