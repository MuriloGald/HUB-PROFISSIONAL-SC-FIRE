import { listarClausulasPadrao, buscarLaudoTecnico } from "@/app/actions/save-in23";
import { listarClientes, buscarCliente } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { LaudoTecnicoWizard } from "@/components/features/save-in23/laudo/laudo-tecnico-wizard";
import { preencherLacunasSnapshot } from "@/lib/clientes/snapshot";
import type { LaudoTecnicoWizardState } from "@/lib/save-in23/types";

export default async function NovoLaudoSave23Page({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: clausulasPadrao }, { data: profissionais }] = await Promise.all([
    listarClientes(),
    listarClausulasPadrao(),
    listarProfissionais(),
  ]);

  let initialState: LaudoTecnicoWizardState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarLaudoTecnico(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as LaudoTecnicoWizardState), laudoId: laudo.id, step: 6 };
      // Mesmo backfill do snapshot congelado usado na Vistoria de Campo — ver
      // preencherLacunasSnapshot.
      if (initialState.cliente_id) {
        const { data: clienteAtual } = await buscarCliente(initialState.cliente_id);
        if (clienteAtual) {
          initialState.cliente = preencherLacunasSnapshot(initialState.cliente, clienteAtual);
        }
      }
    }
  }

  return (
    <LaudoTecnicoWizard
      clientes={clientes}
      profissionais={profissionais}
      clausulasPadrao={clausulasPadrao}
      clienteIdInicial={clienteId}
      initialState={initialState}
    />
  );
}
