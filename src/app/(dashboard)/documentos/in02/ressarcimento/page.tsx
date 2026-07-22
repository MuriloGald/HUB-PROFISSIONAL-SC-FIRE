import { listarRessarcimentos } from "@/app/actions/in02";
import { RessarcimentoList } from "@/components/features/in02/ressarcimento-list";

export default async function RessarcimentosPage() {
  const { data: laudos } = await listarRessarcimentos();
  return <RessarcimentoList laudos={laudos} />;
}
