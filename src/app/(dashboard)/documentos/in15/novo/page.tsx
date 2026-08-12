import { listarClientes } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { buscarChuveiros } from "@/app/actions/in15";
import { ChuveirosWizard } from "@/components/features/in15/chuveiros-wizard";
import type { ChuveirosState } from "@/lib/in15/types";

export default async function NovoChuveirosPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([listarClientes(), listarProfissionais()]);

  let initialState: ChuveirosState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarChuveiros(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as ChuveirosState), laudoId: laudo.id, step: 1 };
    }
  }

  return <ChuveirosWizard clientes={clientes} profissionais={profissionais} clienteIdInicial={clienteId} initialState={initialState} />;
}
