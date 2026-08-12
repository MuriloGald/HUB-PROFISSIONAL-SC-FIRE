import { listarClientes } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { buscarEventoPirotecnico } from "@/app/actions/in27";
import { EventoWizard } from "@/components/features/in27/evento-wizard";
import type { EventoPirotecnicoState } from "@/lib/in27/types";

export default async function NovoEventoPirotecnicoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([listarClientes(), listarProfissionais()]);

  let initialState: EventoPirotecnicoState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarEventoPirotecnico(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as EventoPirotecnicoState), laudoId: laudo.id, step: 1 };
    }
  }

  return <EventoWizard clientes={clientes} profissionais={profissionais} clienteIdInicial={clienteId} initialState={initialState} />;
}
