import { listarClausulasPadrao } from "@/app/actions/save-in23";
import { listarClientes } from "@/app/actions/clientes";
import { LaudoTecnicoWizard } from "@/components/features/save-in23/laudo/laudo-tecnico-wizard";

export default async function NovoLaudoSave23Page({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;
  const [{ data: clientes }, { data: clausulasPadrao }] = await Promise.all([listarClientes(), listarClausulasPadrao()]);

  return <LaudoTecnicoWizard clientes={clientes} clausulasPadrao={clausulasPadrao} clienteIdInicial={clienteId} />;
}
