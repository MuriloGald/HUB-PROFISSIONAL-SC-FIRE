import { listarClientes } from "@/app/actions/clientes";
import { listarProfissionais } from "@/app/actions/profissionais";
import { buscarAlarmeIn12 } from "@/app/actions/in12";
import { AlarmeWizard } from "@/components/features/in12/alarme-wizard";
import type { AlarmeIn12State } from "@/lib/in12/types";

export default async function NovoAlarmeIn12Page({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; editarId?: string }>;
}) {
  const { clienteId, editarId } = await searchParams;
  const [{ data: clientes }, { data: profissionais }] = await Promise.all([
    listarClientes(),
    listarProfissionais(),
  ]);

  let initialState: AlarmeIn12State | undefined;
  if (editarId) {
    const { data: laudo } = await buscarAlarmeIn12(editarId);
    if (laudo) {
      initialState = {
        ...(laudo.dados as unknown as AlarmeIn12State),
        laudoId: laudo.id,
        step: 1,
      };
    }
  }

  return (
    <AlarmeWizard
      clientes={clientes}
      profissionais={profissionais}
      clienteIdInicial={clienteId}
      initialState={initialState}
    />
  );
}
