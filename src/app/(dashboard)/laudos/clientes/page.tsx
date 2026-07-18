import { listarClientesEvento } from "@/app/actions/laudos";
import { ClientesList } from "@/components/features/laudos/clientes-list";

export default async function ClientesEventoPage() {
  const { data: clientes } = await listarClientesEvento();

  return <ClientesList clientes={clientes} />;
}
