import { listarClientesSave23 } from "@/app/actions/save-in23";
import { VistoriaWizard } from "@/components/features/save-in23/vistoria/vistoria-wizard";

export default async function NovaVistoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;
  const { data: clientes } = await listarClientesSave23();

  return <VistoriaWizard clientes={clientes} clienteIdInicial={clienteId} />;
}
