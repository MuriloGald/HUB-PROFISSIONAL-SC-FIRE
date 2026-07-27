import { listarVistoriasManutencao } from "@/app/actions/in04";
import { ManutencaoList } from "@/components/features/in04/manutencao-list";

export default async function VistoriasManutencaoPage() {
  const { data: laudos } = await listarVistoriasManutencao();
  return <ManutencaoList laudos={laudos} />;
}
