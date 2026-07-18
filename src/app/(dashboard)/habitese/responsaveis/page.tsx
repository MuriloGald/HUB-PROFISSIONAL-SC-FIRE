import { listarClientesImovel } from "@/app/actions/habitese";
import { ClientesList } from "@/components/features/habitese/clientes-list";

export default async function ResponsaveisHabitesePage() {
  const { data: clientes } = await listarClientesImovel();

  return <ClientesList clientes={clientes} />;
}
