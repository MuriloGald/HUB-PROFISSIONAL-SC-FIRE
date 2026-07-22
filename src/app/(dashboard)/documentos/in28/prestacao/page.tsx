import { listarRelatoriosPrestacao } from "@/app/actions/in28";
import { PrestacaoList } from "@/components/features/in28/prestacao-list";

export default async function RelatoriosPrestacaoPage() {
  const { data: laudos } = await listarRelatoriosPrestacao();
  return <PrestacaoList laudos={laudos} />;
}
