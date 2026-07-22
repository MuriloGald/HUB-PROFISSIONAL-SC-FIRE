import { listarClausulasPadrao, buscarLaudoTecnico } from "@/app/actions/save-in23";
import { listarClientes } from "@/app/actions/clientes";
import { LaudoTecnicoWizard } from "@/components/features/save-in23/laudo/laudo-tecnico-wizard";
import type { LaudoTecnicoWizardState } from "@/lib/save-in23/types";

export default async function NovoLaudoSave23Page({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: clausulasPadrao }] = await Promise.all([listarClientes(), listarClausulasPadrao()]);

  let initialState: LaudoTecnicoWizardState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarLaudoTecnico(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as LaudoTecnicoWizardState), laudoId: laudo.id, step: 6 };
    }
  }

  return <LaudoTecnicoWizard clientes={clientes} clausulasPadrao={clausulasPadrao} clienteIdInicial={clienteId} initialState={initialState} />;
}
