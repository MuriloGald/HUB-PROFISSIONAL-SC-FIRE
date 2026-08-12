import { buscarLaudoEvento } from "@/app/actions/laudos";
import { listarClientes } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { EventoWizard } from "@/components/features/laudos/wizard/evento-wizard";
import type { EventoWizardState } from "@/lib/laudos/types";

export default async function NovoEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([listarClientes(), listarProfissionais()]);

  let initialState: EventoWizardState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarLaudoEvento(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as EventoWizardState), laudoId: laudo.id, step: 4 };
    }
  }

  return <EventoWizard clientes={clientes} profissionais={profissionais} clienteIdInicial={clienteId} initialState={initialState} />;
}
