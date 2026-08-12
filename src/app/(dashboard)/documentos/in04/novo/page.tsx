import { listarClientes } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { buscarVistoriaManutencao } from "@/app/actions/in04";
import { ManutencaoWizard } from "@/components/features/in04/manutencao-wizard";
import type { VistoriaManutencaoState } from "@/lib/in04/types";

export default async function NovaVistoriaManutencaoPage({ searchParams }: { searchParams: Promise<{ editarId?: string }> }) {
  const { editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([listarClientes(), listarProfissionais()]);

  let initialState: VistoriaManutencaoState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarVistoriaManutencao(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as VistoriaManutencaoState), laudoId: laudo.id, step: 2 };
    }
  }

  return <ManutencaoWizard clientes={clientes} profissionais={profissionais} initialState={initialState} />;
}
