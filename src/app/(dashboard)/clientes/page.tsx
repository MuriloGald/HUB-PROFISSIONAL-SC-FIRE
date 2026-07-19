import { listarClientes } from "@/app/actions/clientes";
import { ClientesList } from "@/components/features/clientes/clientes-list";

export default async function ClientesPage() {
  const { data: clientes } = await listarClientes();

  return <ClientesList clientes={clientes} />;
}
