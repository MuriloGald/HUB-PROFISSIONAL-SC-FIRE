import { listarClientes } from "@/app/actions/clientes";
import { buscarPibi } from "@/app/actions/in28";
import { PibiWizard } from "@/components/features/in28/pibi-wizard";
import type { PibiState } from "@/lib/in28/types";

export default async function NovoPibiPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const { data: clientes } = await listarClientes();

  let initialState: PibiState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarPibi(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as unknown as PibiState), laudoId: laudo.id, step: 1 };
    }
  }

  return <PibiWizard clientes={clientes} clienteIdInicial={clienteId} initialState={initialState} />;
}
