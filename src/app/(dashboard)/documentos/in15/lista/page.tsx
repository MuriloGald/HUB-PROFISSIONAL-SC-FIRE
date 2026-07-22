import { listarChuveiros } from "@/app/actions/in15";
import { ChuveirosList } from "@/components/features/in15/chuveiros-list";

export default async function ChuveirosListaPage() {
  const { data: laudos } = await listarChuveiros();
  return <ChuveirosList laudos={laudos} />;
}
