import { listarEventosPirotecnicos } from "@/app/actions/in27";
import { EventoList } from "@/components/features/in27/evento-list";

export default async function EventosPirotecnicosPage() {
  const { data: laudos } = await listarEventosPirotecnicos();
  return <EventoList laudos={laudos} />;
}
