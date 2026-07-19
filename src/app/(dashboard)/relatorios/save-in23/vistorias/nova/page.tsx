import { listarClientes } from "@/app/actions/clientes";
import { VistoriaWizard } from "@/components/features/save-in23/vistoria/vistoria-wizard";

export default async function NovaVistoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;
  const { data: clientes } = await listarClientes();

  return <VistoriaWizard clientes={clientes} clienteIdInicial={clienteId} />;
}
