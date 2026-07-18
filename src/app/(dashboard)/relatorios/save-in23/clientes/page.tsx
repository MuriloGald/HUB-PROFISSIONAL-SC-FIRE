import { listarClientesSave23 } from "@/app/actions/save-in23";
import { ClientesList } from "@/components/features/save-in23/clientes-list";

export default async function ClientesSave23Page() {
  const { data: clientes } = await listarClientesSave23();

  return <ClientesList clientes={clientes} />;
}
