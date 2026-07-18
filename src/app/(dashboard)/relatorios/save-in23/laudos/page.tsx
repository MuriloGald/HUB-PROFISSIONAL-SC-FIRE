import { listarLaudosTecnicos } from "@/app/actions/save-in23";
import { LaudosList } from "@/components/features/save-in23/laudo/laudos-list";

export default async function LaudosSave23Page() {
  const { data: laudos } = await listarLaudosTecnicos();

  return <LaudosList laudos={laudos} />;
}
