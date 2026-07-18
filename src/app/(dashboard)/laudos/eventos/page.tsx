import { listarLaudosEvento } from "@/app/actions/laudos";
import { EventosList } from "@/components/features/laudos/eventos-list";

export default async function ConsultaEventosPage() {
  const { data: laudos } = await listarLaudosEvento();

  return <EventosList laudos={laudos} />;
}
