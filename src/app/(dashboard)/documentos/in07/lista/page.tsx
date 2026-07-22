import { listarComissionamentosSHP } from "@/app/actions/in07";
import { ShpList } from "@/components/features/in07/shp-list";

export default async function ComissionamentosSHPPage() {
  const { data: laudos } = await listarComissionamentosSHP();
  return <ShpList laudos={laudos} />;
}
