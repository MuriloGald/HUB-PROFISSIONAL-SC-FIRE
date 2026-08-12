import { listarClientes, buscarCliente } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { buscarVistoria } from "@/app/actions/save-in23";
import { VistoriaWizard } from "@/components/features/save-in23/vistoria/vistoria-wizard";
import { preencherLacunasSnapshot } from "@/lib/clientes/snapshot";
import type { VistoriaWizardState } from "@/lib/save-in23/types";

export default async function NovaVistoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([listarClientes(), listarProfissionais()]);

  let initialState: VistoriaWizardState | undefined;
  if (editarId) {
    const { data: vistoria } = await buscarVistoria(editarId);
    if (vistoria) {
      initialState = { ...(vistoria.dados as unknown as VistoriaWizardState), laudoId: vistoria.id, step: 3 };
      // Snapshot congelado na criação — se um campo (ex: RE) foi cadastrado no
      // cliente depois deste documento existir, o snapshot antigo fica sem ele.
      // Preenche só as lacunas, sem sobrescrever o que já foi preservado de propósito.
      if (initialState.cliente_id) {
        const { data: clienteAtual } = await buscarCliente(initialState.cliente_id);
        if (clienteAtual) {
          initialState.cliente = preencherLacunasSnapshot(initialState.cliente, clienteAtual);
        }
      }
    }
  }

  return <VistoriaWizard clientes={clientes} profissionais={profissionais} clienteIdInicial={clienteId} initialState={initialState} />;
}
