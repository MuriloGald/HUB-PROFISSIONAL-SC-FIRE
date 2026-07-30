import { listarLaudosTecnicos } from "@/app/actions/laudos-tecnicos";
import { LaudoTecnicoList } from "@/components/features/laudos-tecnicos/laudo-tecnico-list";

export default async function LaudosTecnicosListaPage() {
  const { data: laudos } = await listarLaudosTecnicos();
  return <LaudoTecnicoList laudos={laudos} />;
}
