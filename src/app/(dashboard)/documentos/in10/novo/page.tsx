import { listarClientes } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { buscarControleFumaca } from "@/app/actions/in10";
import { FumacaWizard } from "@/components/features/in10/fumaca-wizard";
import type { ControleFumacaState } from "@/lib/in10/types";

export default async function NovoControleFumacaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([listarClientes(), listarProfissionais()]);

  let initialState: ControleFumacaState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarControleFumaca(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as ControleFumacaState), laudoId: laudo.id, step: 1 };
    }
  }

  return <FumacaWizard clientes={clientes} profissionais={profissionais} clienteIdInicial={clienteId} initialState={initialState} />;
}
