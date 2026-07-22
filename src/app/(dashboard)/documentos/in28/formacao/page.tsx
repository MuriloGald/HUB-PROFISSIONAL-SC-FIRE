import { listarRelatoriosFormacao } from "@/app/actions/in28";
import { FormacaoList } from "@/components/features/in28/formacao-list";

export default async function RelatoriosFormacaoPage() {
  const { data: laudos } = await listarRelatoriosFormacao();
  return <FormacaoList laudos={laudos} />;
}
