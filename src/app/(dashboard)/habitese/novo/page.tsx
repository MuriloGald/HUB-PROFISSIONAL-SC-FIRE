import { buscarTermoHabitese } from "@/app/actions/habitese";
import { listarClientes } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { TermoWizard } from "@/components/features/habitese/wizard/termo-wizard";
import type { HabiteseWizardState } from "@/lib/habitese/types";

export default async function NovoTermoHabitesePage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([listarClientes(), listarProfissionais()]);

  let initialState: HabiteseWizardState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarTermoHabitese(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as HabiteseWizardState), laudoId: laudo.id, step: 7 };
    }
  }

  return <TermoWizard clientes={clientes} profissionais={profissionais} clienteIdInicial={clienteId} initialState={initialState} />;
}
